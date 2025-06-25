import { NextRequest, NextResponse } from "next/server";
import { fetchRemoteIoJobs } from "@/lib/fetchers/remote-io-fetcher";
import { fetchWorkableJobs } from "@/lib/fetchers/workable-fetcher";
import { extractJobsWithLLM } from "@/lib/llm/job-extractor";

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  try {
    const [workableHtml, remoteIoXml] = await Promise.all([
      fetchWorkableJobs(query),
      fetchRemoteIoJobs(query),
    ]);

    const [workableJobs, remoteIoJobs] = await Promise.all([
      extractJobsWithLLM(workableHtml, query),
      extractJobsWithLLM(remoteIoXml, query),
    ]);

    const jobs = [...(workableJobs || []), ...(remoteIoJobs || [])];

    if (!jobs.length) {
      return NextResponse.json({
        results: [],
        message: `No jobs found for "${query}".`,
      });
    }

    return NextResponse.json({ results: jobs });
  } catch (e) {
    console.error("API /api/search error:", e);
    return NextResponse.json(
      { results: [], message: "Error fetching jobs. Please try again later." },
      { status: 500 }
    );
  }
}
