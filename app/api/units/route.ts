import { NextRequest, NextResponse } from "next/server";
import { dbManager } from "@/db/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sectionIdParam = searchParams.get("sectionId");
  const sectionId = sectionIdParam ? parseInt(sectionIdParam, 10) : undefined;
  const courseId = parseInt(searchParams.get("courseId") || "1", 10);

  const units = dbManager.getUnitsWithRings(sectionId, courseId, user.userId);
  return NextResponse.json(units);
}
