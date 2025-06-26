import { NextRequest, NextResponse } from "next/server";
import { fetchRemoteIoJobs } from "@/lib/fetchers/remote-io-fetcher";
import { fetchWorkableJobs } from "@/lib/fetchers/workable-fetcher";
import { extractJobsWithLLM } from "@/lib/llm/job-extractor";
import { splitIntoChunks } from "@/lib/llm/chunk-splitter";

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  try {
    let workableHtml, remoteIoJobs;
    try {
      workableHtml = await fetchWorkableJobs(query);
    } catch (e) {
      console.error("Error fetching workable jobs:", e);
      workableHtml = "";
    }
    try {
      remoteIoJobs = await fetchRemoteIoJobs(query);
    } catch (e) {
      console.error("Error fetching remote.io jobs:", e);
      remoteIoJobs = [];
    }

    const CHUNK_SIZE = 12000;
    const workableChunks = splitIntoChunks(workableHtml, CHUNK_SIZE);

    const workableJobsArrays = await Promise.all(
      workableChunks.map((chunk) => extractJobsWithLLM(chunk, query))
    );
    const workableJobs = workableJobsArrays.flat();

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
