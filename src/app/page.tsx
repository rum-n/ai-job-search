"use client";

import { useState } from "react";

type Job = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Job[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    setMessage(null);
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    setResults(data.results || []);
    setMessage(data.message || null);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-100 to-blue-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col gap-4 bg-white/90 rounded-xl shadow-lg p-6 border border-gray-200"
      >
        <input
          type="text"
          className="border border-blue-300 rounded-lg p-3 bg-blue-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          placeholder="Describe your ideal job..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg p-3 font-semibold shadow"
          disabled={loading}
        >
          {loading ? "Searching..." : "Find Jobs"}
        </button>
      </form>
      <div className="mt-10 w-full max-w-2xl flex flex-col gap-6">
        {message && <div className="text-gray-500 text-center">{message}</div>}
        {results.map((job, i) => (
          <div
            key={i}
            className="bg-white/95 shadow-md hover:shadow-xl transition rounded-xl p-6 border border-gray-100 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl font-bold text-blue-700 hover:underline"
              >
                {job.title}
              </a>
              <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                {job.source}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-1">
              {new Date(job.pubDate).toLocaleDateString()}
            </div>
            <div className="text-gray-700 text-base whitespace-pre-line">
              {job.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
