import { Mistral } from "@mistralai/mistralai";

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey });

export async function extractQueryFromCV(cvText: string): Promise<string> {
  const prompt = `
    Given the following CV text, extract a concise job search query that best matches 
    the user's desired positions, skills, or interests. Return only the query string.

    CV:
    ${cvText}
  `;
  const chatResponse = await client.chat.complete({
    model: "ministral-3b-latest",
    messages: [{ role: "user", content: prompt }],
  });

  // Parse and return the LLM's response as a string
  return (chatResponse.choices[0].message as any).content.trim();
}
