"use client";

import { useState } from "react";
import { Job } from "../../types/Job";
import { stripHtml } from "@/lib/llm/strip-html";

const PAGE_SIZE = 10;

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Job[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    setMessage(null);
    setPage(1); // Reset to first page on new search
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

  // Pagination logic
  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const paginatedResults = results.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

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
        {paginatedResults.map((job, i) => (
          <div
            key={i}
            className="relative bg-white/95 shadow-md hover:shadow-xl transition rounded-xl p-6 border border-gray-100 flex flex-col gap-2"
          >
            {/* Source badge at top right */}
            <span className="absolute top-4 right-4 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
              {job.source}
            </span>
            <div className="flex flex-col gap-1">
              <div className="text-xl font-bold text-blue-700">{job.title}</div>
              {job.company && (
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Company:</span> {job.company}
                </div>
              )}
              <div className="text-sm text-gray-500">
                🗓️{" "}
                {job.pubDate ? new Date(job.pubDate).toLocaleDateString() : ""}
              </div>
              <div className="text-gray-700 text-base whitespace-pre-line overflow-hidden overflow-ellipsis line-clamp-5">
                {stripHtml(job.description)}
              </div>
              <div className="mt-2">
                <a
                  href={job.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  More details &rarr;
                </a>
              </div>
            </div>
          </div>
        ))}
        {/* Pagination controls */}
        {results.length > PAGE_SIZE && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50 cursor-pointer"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50 cursor-pointer"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
