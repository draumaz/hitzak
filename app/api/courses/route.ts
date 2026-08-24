import { NextRequest, NextResponse } from "next/server";
import { dbManager } from "@/db/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courses = dbManager.getCourses();
  return NextResponse.json(courses);
}
