"use client";

import { useEffect, useState } from "react";
import { Job } from "../../types/Job";
import { stripHtml } from "@/lib/llm/strip-html";
import Navbar from "./components/Navbar";
import Modal from "./components/Modal";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
      <div className="min-h-screen flex flex-col items-center  p-8 bg-background">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Find Your Next Remote Opportunity
        </h1>
        <p className="text-lg text-muted-foreground mb-4">
          Powered by AI to match you with the perfect job opportunities from
          across the web
        </p>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl flex flex-col gap-4 bg-card rounded-xl shadow-lg p-6 border"
        >
          <Input
            type="text"
            placeholder="Describe your ideal job..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Find Jobs"}
          </Button>
        </form>

        {!loading && (
          <div className="mt-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-primary flex items-center gap-2 justify-center">
                Start Your Job Search
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Enter a job title, company, or skills to find your next
                opportunity.
              </p>
            </CardContent>
          </div>
        )}

        <div className="mt-10 w-full max-w-2xl flex flex-col gap-6">
          {paginatedResults.map((job, i) => (
            <Card
              key={i}
              className={`relative transition ${
                visitedLinks.has(job.link)
                  ? "opacity-70 border-primary bg-muted"
                  : ""
              }`}
            >
              <CardHeader className="flex justify-between items-start">
                <div>
                  <div className="text-xl font-bold text-primary">
                    {job.title}
                  </div>
                  {job.company && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold">Company:</span>{" "}
                      {job.company}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    🗓️{" "}
                    {job.pubDate
                      ? new Date(job.pubDate).toLocaleDateString()
                      : ""}
                  </div>
                </div>
                <Badge variant="secondary" className="uppercase tracking-wide">
                  {job.source}
                </Badge>
              </CardHeader>
              <Separator />
              <CardContent>
                <div className="text-base whitespace-pre-line line-clamp-5 text-primary">
                  {stripHtml(job.description)}
                </div>
                <div className="mt-2">
                  <Button
                    asChild
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() =>
                      setVisitedLinks((prev) => new Set(prev).add(job.link))
                    }
                  >
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      More details &rarr;
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {/* Pagination controls */}
          {results.length > PAGE_SIZE && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
