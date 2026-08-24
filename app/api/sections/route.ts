import { NextRequest, NextResponse } from "next/server";
import { dbManager } from "@/db/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = parseInt(searchParams.get("courseId") || "1", 10);
  const sections = dbManager.getSections(courseId);
  return NextResponse.json(sections);
}
