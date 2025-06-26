"use client";

import { useEffect, useState } from "react";
import { Job } from "../../types/Job";
import { stripHtml } from "@/lib/llm/strip-html";
import Navbar from "./components/Navbar";
import Modal from "./components/Modal";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";

const PAGE_SIZE = 10;

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Job[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [visitedLinks, setVisitedLinks] = useState<Set<string>>(new Set());
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    setMessage(null);
    setPage(1);
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (token && email) setUser({ email });
  }, []);

  function handleLoginSuccess({
    token,
    user,
  }: {
    token: string;
    user: { email: string };
  }) {
    localStorage.setItem("token", token);
    localStorage.setItem("email", user.email);
    setUser(user);
    setShowLogin(false);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
  }

  const uniqueResults = Array.from(
    new Map(results.map((job) => [job.link, job])).values()
  );

  const totalPages = Math.ceil(uniqueResults.length / PAGE_SIZE);
  const paginatedResults = uniqueResults.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <>
      <Navbar
        user={user}
        onLoginClick={() => setShowLogin(true)}
        onSignupClick={() => setShowSignup(true)}
        onLogoutClick={handleLogout}
      />
      <Modal open={showLogin} onClose={() => setShowLogin(false)}>
        <LoginForm onSuccess={handleLoginSuccess} />
      </Modal>
      <Modal open={showSignup} onClose={() => setShowSignup(false)}>
        <SignupForm />
      </Modal>
      <div
        className="min-h-screen flex flex-col items-center justify-center p-8"
        style={{
          background: "linear-gradient(135deg, #a9bcd0 0%, #6b818c 100%)",
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md flex flex-col gap-4 bg-white/90 rounded-xl shadow-lg p-6 border"
          style={{
            borderColor: "#a9bcd0",
          }}
        >
          <input
            type="text"
            className="border rounded-lg p-3"
            style={{
              borderColor: "#6b818c",
              background: "#f7fafc",
              color: "#3a6174",
            }}
            placeholder="Describe your ideal job..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <button
            type="submit"
            className="rounded-lg p-3 font-semibold shadow transition cursor-pointer"
            style={{
              background: loading ? "#6b818c" : "#3a6174",
              color: "#fff",
            }}
            disabled={loading}
          >
            {loading ? "Searching..." : "Find Jobs"}
          </button>
        </form>
        <div className="mt-10 w-full max-w-2xl flex flex-col gap-6">
          {message && (
            <div className="text-gray-700 text-center">{message}</div>
          )}
          {paginatedResults.map((job, i) => (
            <div
              key={i}
              className={`relative shadow-md hover:shadow-xl transition rounded-xl p-6 border flex flex-col gap-2 bg-white ${
                visitedLinks.has(job.link)
                  ? "opacity-70 border-[#3a6174] bg-[#a9bcd0]"
                  : ""
              }`}
              style={{
                borderColor: visitedLinks.has(job.link) ? "#3a6174" : "#a9bcd0",
              }}
            >
              {/* Source badge at top right */}
              <span
                className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide"
                style={{
                  background: "#a9bcd0",
                  color: "#3a6174",
                }}
              >
                {job.source}
              </span>
              <div className="flex flex-col gap-1">
                <div className="text-xl font-bold" style={{ color: "#3a6174" }}>
                  {job.title}
                </div>
                {job.company && (
                  <div className="text-sm" style={{ color: "#6b818c" }}>
                    <span className="font-semibold">Company:</span>{" "}
                    {job.company}
                  </div>
                )}
                <div className="text-sm" style={{ color: "#6b818c" }}>
                  🗓️{" "}
                  {job.pubDate
                    ? new Date(job.pubDate).toLocaleDateString()
                    : ""}
                </div>
                <div
                  className="text-base whitespace-pre-line overflow-hidden overflow-ellipsis line-clamp-5"
                  style={{ color: "#3a6174" }}
                >
                  {stripHtml(job.description)}
                </div>
                <div className="mt-2">
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold"
                    style={{
                      color: "#3a6174",
                      textDecoration: "underline",
                    }}
                    onClick={() => {
                      setVisitedLinks((prev) => new Set(prev).add(job.link));
                    }}
                  >
                    More details &rarr;
                  </a>
                </div>
                {/* {isLoggedIn && (
                <button
                  onClick={async () => {
                    await fetch("/api/jobs/apply", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ jobId: job.id }),
                    });
                    // Optionally update UI state
                  }}
                  className="ml-2 px-3 py-1 rounded bg-[#3a6174] text-white text-xs"
                >
                  Mark as Applied
                </button>
              )} */}
              </div>
            </div>
          ))}
          {/* Pagination controls */}
          {results.length > PAGE_SIZE && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                className="px-4 py-2 rounded font-semibold disabled:opacity-50 cursor-pointer"
                style={{
                  background: "#a9bcd0",
                  color: "#3a6174",
                }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                className="px-4 py-2 rounded font-semibold disabled:opacity-50 cursor-pointer"
                style={{
                  background: "#a9bcd0",
                  color: "#3a6174",
                }}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
