import type { NextApiRequest, NextApiResponse } from "next";
import type { TypeOf } from "zod";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { generateUUID } from "@/lib/client-utils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { User } from "@prisma/client";

const schema = z.object({
  roomName: z.string().min(3),
});

interface ApiRequest extends NextApiRequest {
  body: TypeOf<typeof schema>;
}

export default async function handler(req: ApiRequest, res: NextApiResponse) {
  const input = req.body;
  const identity = generateUUID();
  const session = await getServerSession(req, res, authOptions);
  const slug = generateUUID();
  
  

  if (prisma) {
    const existingRoom = await prisma.room.findFirst({
      where: { name: input.roomName, 
        deleted: false
       },
    });
  
    if (existingRoom) {
      return res.status(400).json({ error: "Room name already exists" });
    }
    
    const room = await prisma?.room.create({
      data: {
        name: input.roomName,
        slug,
        createdAt: new Date(),
      },
    });

    let user: User | null = null;
    if (session?.address) {
      user = await prisma.user.findFirst({
        where: {
          wallet: session.address,
        },
      });
    }

    const admin = await prisma?.participant.create({
      data: {
        identity,
        roomId: room?.id,
        userId: user?.id,
      },
    });

    await prisma?.room.update({
      where: {
        id: room?.id,
      },
      data: {
        adminId: admin.id,
      },
    });
  }

  res.status(200).json({ identity, slug });
}
