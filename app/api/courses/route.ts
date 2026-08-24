import { NextResponse } from "next/server";
import { dbManager } from "@/db/db";

export async function GET() {
  const courses = dbManager.getCourses();
  return NextResponse.json(courses);
}
