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
      title, link, description, pubDate, company and source. Only include jobs that match
      the query.

      User query: "${query}"

      HTML:
      ${html}

      Return only a JSON array of jobs.
    `;

  const chatResponse = await client.chat.complete({
    model: "ministral-3b-latest",
    messages: [{ role: "user", content: prompt }],
  });

  try {
    // The LLM response is an object with a 'content' property
    const content = (chatResponse.choices[0].message as any).content;

    // Remove Markdown code block if present
    const cleaned = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Find the first JSON array in the string
    const match = cleaned.match(/\[.*\]/s);

    return JSON.parse(match[0]);
  } catch (e) {
    console.error("Error parsing LLM response:", e);
    return [];
  }
}
