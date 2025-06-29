import { NextRequest, NextResponse } from "next/server";
import { extractQueryFromCV } from "@/lib/llm/cv-query-extractor";

export async function POST(req: NextRequest) {
  const { cvText } = await req.json();
  const query = await extractQueryFromCV(cvText);
  return NextResponse.json({ query });
}
