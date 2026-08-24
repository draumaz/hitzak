import { NextRequest, NextResponse } from "next/server";
import { dbManager } from "@/db/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lessonId = parseInt(id, 10);
  if (isNaN(lessonId)) {
    return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
  }

  const lesson = dbManager.getLessonWithChallenges(lessonId);
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  return NextResponse.json(lesson);
}
