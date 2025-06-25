import xml2js from "xml2js";

const REMOTE_IO_RSS = "https://s3.remote.io/feed/rss.xml";

export async function fetchRemoteIoJobs(query: string): Promise<string> {
  const res = await fetch(REMOTE_IO_RSS);
  return await res.text();
  // const xml = await res.text();
  // const parser = new xml2js.Parser();
  // const feed = await parser.parseStringPromise(xml);

  // const items = feed.rss.channel[0].item || [];
  // const cleanQuery = query.toLowerCase();

  // return items
  //   .filter((item: any) => {
  //     const title = item.title?.[0] || "";
  //     const desc = item.description?.[0] || "";
  //     return (
  //       title.toLowerCase().includes(cleanQuery) ||
  //       desc.toLowerCase().includes(cleanQuery)
  //     );
  //   })
  //   .map((item: any) => ({
  //     title: item.title?.[0] || "",
  //     link: item.link?.[0] || "",
  //     description: item.description?.[0] || "",
  //     pubDate: item.pubDate?.[0] || "",
  //     source: "remote.io",
  //   }));
}
