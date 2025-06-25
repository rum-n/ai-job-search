import { NextRequest, NextResponse } from "next/server";
import { Job } from "../../../../types/Job";
import { fetchRemoteIoJobs } from "@/lib/fetchers/remote-io-fetcher";
import { fetchWorkableJobs } from "@/lib/fetchers/workable-fetcher";

const jobBoardFetchers: Array<(query: string) => Promise<Job[]>> = [
  // fetchRemoteIoJobs,
  fetchWorkableJobs,
];

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  try {
    const resultsArr = await Promise.all(
      jobBoardFetchers.map((fetcher) => fetcher(query))
    );
    const jobs = resultsArr.flat();

    if (jobs.length === 0) {
      return NextResponse.json({
        results: [],
        message: `No jobs found for "${query}".`,
      });
    }

    return NextResponse.json({ results: jobs });
  } catch (e) {
    return NextResponse.json(
      { results: "Error fetching jobs. Please try again later." },
      { status: 500 }
    );
  }
}
