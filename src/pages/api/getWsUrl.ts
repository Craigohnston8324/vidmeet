import { AccessToken } from "@dtelecom/server-sdk-js";
import type { NextApiRequest, NextApiResponse } from "next";
import requestIp from "request-ip";

export interface IGetWsUrl {
  wsUrl: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('==== API /api/getWsUrl called ====');
  console.log('Request headers:', req.headers);
  console.log('Request method:', req.method);

  const clientIp = requestIp.getClientIp(req) || undefined;
  console.log('Client IP:', clientIp);

  try {
    const token = new AccessToken();
    const wsUrl = await token.getWsUrl(clientIp);
    console.log('Generated WS URL:', wsUrl);

    const responseData = {
      wsUrl,
      clientIp: clientIp || null,
    };

    console.log('Response data:', responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error in /api/getWsUrl:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}