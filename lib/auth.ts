import { NextRequest } from "next/server";
import { verifyToken } from "./auth-tokens";

export interface SessionPayload {
  userId: string;
  username: string;
}

export async function getCurrentUser(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get("session_token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}
