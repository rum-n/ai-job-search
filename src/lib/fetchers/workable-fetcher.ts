export async function fetchWorkableJobs(query: string): Promise<string> {
  const searchUrl = `https://jobs.workable.com/search?query=${encodeURIComponent(
    query
  )}&workplace=remote&day_range=7`;

  const res = await fetch(searchUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    },
  });

  return await res.text();
}
