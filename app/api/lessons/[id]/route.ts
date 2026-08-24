import { NextRequest, NextResponse } from "next/server";
import { dbManager } from "@/db/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const lessonId = parseInt(id, 10);
  if (isNaN(lessonId)) {
    return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 });
  }

  const lesson = dbManager.getLessonWithChallenges(lessonId, user.userId);
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  return NextResponse.json(lesson);
}
