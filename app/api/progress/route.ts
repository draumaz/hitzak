import { NextRequest, NextResponse } from "next/server";
import { dbManager } from "@/db/db";

export async function GET() {
  const progress = dbManager.getUserProgress();
  return NextResponse.json(progress);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, lessonId, xp, cost } = body;

    if (action === "reduce_heart") {
      const result = dbManager.reduceHeart();
      return NextResponse.json(result);
    }

    if (action === "complete_lesson") {
      const result = dbManager.completeLesson(lessonId, xp || 15);
      return NextResponse.json(result);
    }

    if (action === "refill_hearts") {
      const result = dbManager.refillHearts();
      return NextResponse.json(result);
    }

    if (action === "toggle_super") {
      const result = dbManager.toggleSuperSubscription();
      return NextResponse.json(result);
    }

    if (action === "reset_progress" || action === "reset") {
      const result = dbManager.resetProgress();
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 500 });
  }
}
