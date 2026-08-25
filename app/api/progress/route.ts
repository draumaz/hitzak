import { NextRequest, NextResponse } from "next/server";
import { dbManager } from "@/db/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = dbManager.getUserProgress(user.userId);
  return NextResponse.json(progress);
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, lessonId, xp, challengeId, courseId } = body;

    if (action === "select_course") {
      const result = dbManager.selectCourse(courseId, user.userId);
      return NextResponse.json(result);
    }

    if (action === "record_mistake") {
      const result = dbManager.recordMistake(challengeId, user.userId);
      return NextResponse.json(result);
    }

    if (action === "remove_mistake") {
      const result = dbManager.removeMistake(challengeId, user.userId);
      return NextResponse.json(result);
    }

    if (action === "reduce_heart") {
      const result = dbManager.reduceHeart(user.userId);
      return NextResponse.json(result);
    }

    if (action === "complete_lesson") {
      const result = dbManager.completeLesson(lessonId, xp || 15, user.userId);
      return NextResponse.json(result);
    }

    if (action === "refill_hearts") {
      const result = dbManager.refillHearts(user.userId);
      return NextResponse.json(result);
    }

    if (action === "toggle_super") {
      const result = dbManager.toggleSuperSubscription(user.userId);
      return NextResponse.json(result);
    }

    if (action === "reset_progress" || action === "reset") {
      const result = dbManager.resetProgress(user.userId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 500 });
  }
}
