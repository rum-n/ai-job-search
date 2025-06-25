import { NextRequest, NextResponse } from "next/server";
import xml2js from "xml2js";

type Job = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
};

const REMOTE_IO_RSS = "https://s3.remote.io/feed/rss.xml";

// --- Job board fetchers ---

async function fetchRemoteIoJobs(query: string): Promise<Job[]> {
  const res = await fetch(REMOTE_IO_RSS);
  const xml = await res.text();
  const parser = new xml2js.Parser();
  const feed = await parser.parseStringPromise(xml);

  const items = feed.rss.channel[0].item || [];
  console.log("Parsed items:", items);
  const cleanQuery = query.toLowerCase();

  return items
    .filter((item: any) => {
      const title = item.title?.[0] || "";
      const desc = item.description?.[0] || "";
      return (
        title.toLowerCase().includes(cleanQuery) ||
        desc.toLowerCase().includes(cleanQuery)
      );
    })
    .map((item: any) => ({
      title: item.title?.[0] || "",
      link: item.link?.[0] || "",
      description: item.description?.[0] || "",
      pubDate: item.pubDate?.[0] || "",
      source: "remote.io",
    }));
}

// --- Add more fetchers here as needed ---
// async function fetchAnotherBoardJobs(query: string): Promise<Job[]> { ... }

// --- Main search handler ---

const jobBoardFetchers: Array<(query: string) => Promise<Job[]>> = [
  fetchRemoteIoJobs,
  // Add more fetchers here
];

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  try {
    // Fetch from all job boards in parallel
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

    // Format results as Markdown
    // const results = jobs
    //   .map(
    //     (job, i) =>
    //       `${i + 1}. [${job.title}](${job.link}) _(via ${job.source})_\n${
    //         job.description
    //       }\nPosted: ${job.pubDate}\n`
    //   )
    //   .join("\n");

    return NextResponse.json({ results: jobs });
  } catch (e) {
    return NextResponse.json(
      { results: "Error fetching jobs. Please try again later." },
      { status: 500 }
    );
  }
}
