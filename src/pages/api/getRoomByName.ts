import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { Participant } from "@prisma/client";

const schema = z.object({
  roomName: z.string(),
});

interface ApiRequest extends NextApiRequest {
  query: {
    roomName: string;
  };
}

export interface IGetRoomByNameResponse {
  slug: string;
  roomName: string;
  participantsCount?: number;
  roomDeleted: boolean;
  referralCode: string | null;
}

export default async function handler(req: ApiRequest, res: NextApiResponse) {
  const { roomName } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!roomName) {
    return res.status(400).json({ error: "Room name is required" });
  }

  try {
    const room = await prisma?.room.findFirst({
      where: { 
        name: roomName, 
        deleted: false
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    let referralCode: string | null = null;
    if (!session?.address && room.adminId) {
      const adminParticipant = await prisma?.participant.findFirst({
        where: { id: room.adminId },
        select: { userId: true },
      });

      if (adminParticipant?.userId) {
        referralCode = await getReferralCode(adminParticipant.userId);
      }
    }

    res.status(200).json({
      slug: room.slug,
      roomName: room.name,
      roomDeleted: room.deleted,
      participantsCount: room.participantCount,
      referralCode,
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

const getReferralCode = async (userId: string) => {
  if (!prisma) return null;

  const referralRecords = await prisma.referralCode.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  });

  if (referralRecords[0]) {
    return referralRecords[0].referralCode;
  }

  return null;
};
