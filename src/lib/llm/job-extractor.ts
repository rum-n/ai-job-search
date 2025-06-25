import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });
export async function extractJobsWithLLM(
  html: string,
  query: string
): Promise<any[]> {
  const prompt = `
      You are a job extraction assistant. Given the following HTML from a job board
      and a user query, extract a list of relevant jobs as JSON objects with:
      title, link, description, pubDate, and source. Only include jobs that match
      the query.

      User query: "${query}"

      HTML:
      ${html}

      Return only a JSON array of jobs.
    `;

  const chatResponse = await client.chat.complete({
    model: "mistral-large-latest",
    messages: [{ role: "user", content: prompt }],
  });

  // Try to parse the JSON from the LLM response
  try {
    const content = chatResponse.choices[0].message as string;
    console.log("LLM content:", content);
    if (typeof content === "string") {
      const match = content.match(/\[.*\]/s);
      if (match) {
        return JSON.parse(match[0]);
      }
    }
    return [];
  } catch {
    return [];
  }
}
