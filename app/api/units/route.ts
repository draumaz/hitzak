import { NextRequest, NextResponse } from "next/server";
import { dbManager } from "@/db/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sectionIdParam = searchParams.get("sectionId");
  const sectionId = sectionIdParam ? parseInt(sectionIdParam, 10) : undefined;
  const courseId = parseInt(searchParams.get("courseId") || "1", 10);

  const units = dbManager.getUnitsWithRings(sectionId, courseId);
  return NextResponse.json(units);
}
