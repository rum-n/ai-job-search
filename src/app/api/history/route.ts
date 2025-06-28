import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../prisma/prisma";
import { getUserFromRequest } from "@/lib/utils/auth";

export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string | undefined;
  if (typeof user === "string") {
    userId = user;
  } else if (typeof user === "object" && user !== null && "userId" in user) {
    userId = (user as { userId: string }).userId;
  } else {
    return NextResponse.json({ error: "Invalid user" }, { status: 400 });
  }

  const { query, results } = await req.json();

  // 1. Check current search count for the user
  const searchCount = await prisma.search.count({
    where: { userId: userId! },
  });

  // 2. If 5 or more, delete the oldest search (and its SearchResults)
  if (searchCount >= 5) {
    const oldest = await prisma.search.findFirst({
      where: { userId: userId! },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (oldest) {
      // Delete related SearchResults first (MongoDB/Prisma does not cascade)
      await prisma.searchResult.deleteMany({
        where: { searchId: oldest.id },
      });
      await prisma.search.delete({
        where: { id: oldest.id },
      });
    }
  }

  // 3. Create the Search record
  const search = await prisma.search.create({
    data: {
      userId: userId!,
      query,
      createdAt: new Date(),
    },
  });

  // 4. For each job in results, upsert the Job and create a SearchResult
  for (const job of results) {
    const jobRecord = await prisma.job.upsert({
      where: { link: job.link },
      update: {},
      create: {
        title: job.title,
        link: job.link,
        description: job.description,
        pubDate: job.pubDate,
        source: job.source,
        company: job.company,
        location: job.location,
        salary: job.salary,
      },
    });

    await prisma.searchResult.create({
      data: {
        searchId: search.id,
        jobId: jobRecord.id,
      },
    });
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string | undefined;
  if (typeof user === "string") {
    userId = user;
  } else if (typeof user === "object" && user !== null && "userId" in user) {
    userId = (user as { userId: string }).userId;
  } else {
    return NextResponse.json({ error: "Invalid user" }, { status: 400 });
  }

  const history = await prisma.search.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      results: {
        include: {
          job: true,
        },
      },
    },
  });

  // Format the results to return an array of jobs for each search
  const parsed = history.map((entry) => ({
    id: entry.id,
    query: entry.query,
    createdAt: entry.createdAt,
    results: entry.results.map((r) => r.job),
  }));

  return NextResponse.json({ history: parsed });
}
