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
import { useRef } from "react";
import { extractQueryFromCV } from "@/lib/llm/cv-query-extractor";
// import { pdfjs } from "react-pdf";

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.mjs",
//   import.meta.url
// ).toString();

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
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [showUploadCV, setShowUploadCV] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (token && email) {
      setUser({ email });
      // Fetch history only if results are empty (no search yet)
      if (!historyLoaded && results.length === 0) {
        fetch("/api/history", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (
              data.history &&
              data.history.length > 0 &&
              data.history[0].results &&
              Array.isArray(data.history[0].results)
            ) {
              setResults(data.history[0].results);
              setMessage(null);
              setPage(1);
            }
            setHistoryLoaded(true);
          })
          .catch(() => setHistoryLoaded(true));
      }
    }
  }, [historyLoaded, results.length]);

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

    if (user && data.results && data.results.length > 0) {
      const token = localStorage.getItem("token");
      await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, results: data.results }),
      });
    }
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

  const handleCVUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const pdfjs = (await import("react-pdf")).pdfjs;

    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();

    // Read PDF as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + " ";
    }

    const res = await fetch("/api/extract-cv-query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvText: text }),
    });
    const data = await res.json();

    if (data.query) {
      const cleanQuery = data.query.replace(/^["']|["']$/g, "");
      setQuery(cleanQuery);
      // Optionally auto-submit the search
      // handleSubmit(new Event("submit"));
    }

    setShowUploadCV(false);
  };

  return (
    <>
      <Navbar
        user={user}
        onLoginClick={() => setShowLogin(true)}
        onSignupClick={() => setShowSignup(true)}
        onLogoutClick={handleLogout}
        onUploadCVClick={() => setShowUploadCV(true)}
      />
      <Modal open={showLogin} onClose={() => setShowLogin(false)}>
        <LoginForm onSuccess={handleLoginSuccess} />
      </Modal>
      <Modal open={showSignup} onClose={() => setShowSignup(false)}>
        <SignupForm />
      </Modal>
      <Modal open={showUploadCV} onClose={() => setShowUploadCV(false)}>
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-xl font-bold text-primary mb-2">
            Upload your CV
          </h2>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="block w-full text-sm text-muted-foreground
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-primary file:text-white
        hover:file:bg-primary/80"
          />
          <Button onClick={handleCVUpload} className="w-full">
            Upload
          </Button>
        </div>
      </Modal>
      <div
        className="min-h-screen flex flex-col items-center  p-8 bg-background"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(99,102,241,0.2) 0, transparent 60%)," +
            "radial-gradient(circle at 20% 80%, rgba(16,185,129,0.2) 0, transparent 70%)",
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          width="100%"
          height="100%"
          style={{ zIndex: -1 }}
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="squares"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <rect
                x="0"
                y="0"
                width="45"
                height="45"
                fill="rgba(99,102,241,0.04)"
              />
            </pattern>
            <radialGradient id="fadeGradient" cx="50%" cy="50%" r="70%">
              <stop offset="60%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="fadeMask">
              <rect width="100%" height="100%" fill="url(#fadeGradient)" />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#squares)"
            mask="url(#fadeMask)"
          />
        </svg>
        <h1 className="text-3xl font-bold text-primary mb-6">
          Find Your Next Remote Opportunity
        </h1>
        <p className="text-lg text-muted-foreground mb-4">
          Powered by AI to match you with the perfect job opportunities from 20+
          remote job boards.
        </p>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl flex flex-col gap-4 bg-card rounded-xl shadow-lg p-6 border my-6"
        >
          <Input
            type="text"
            placeholder="Describe your ideal job..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            className="h-12 text-lg bg-muted placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Find Jobs"}
          </Button>
          {!user && (
            <div className="flex flex-col items-center mt-2">
              <span className="text-muted-foreground text-sm mb-2">
                Or let AI do the work for you!
              </span>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                // onClick={handleUploadCV} // Implement this handler as needed
                disabled
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 16v-8m0 8l-4-4m4 4l4-4M4 20h16"
                  />
                </svg>
                Upload your CV and let AI find jobs for you
              </Button>
            </div>
          )}
        </form>

        {!loading && results.length === 0 && (
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

        <div className="mt-10 w-full max-w-3xl flex flex-col gap-6">
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
                  {/* limit width */}
                  {job.source.length > 15
                    ? job.source.slice(0, 15) + "..."
                    : job.source}
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
        <footer className="w-full mt-16 py-8 flex flex-col items-center text-sm text-muted-foreground border-t">
          <div className="w-full max-w-lg flex flex-col sm:flex-row justify-between px-4">
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-primary mb-1">Legal</span>
              <a
                href="/terms"
                className="hover:text-primary underline transition"
              >
                Terms and Conditions
              </a>
              <a
                href="/privacy"
                className="hover:text-primary underline transition"
              >
                Privacy Policy
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-primary mb-1">Company</span>
              <a
                href="/about"
                className="hover:text-primary underline transition"
              >
                About
              </a>
              <a
                href="/contact"
                className="hover:text-primary underline transition"
              >
                Contact
              </a>
              <a
                href="/employers"
                className="hover:text-primary underline transition"
              >
                For Employers
              </a>
            </div>
          </div>
          <span className="mt-6">
            &copy; {new Date().getFullYear()} Match Remote
          </span>
        </footer>
      </div>
    </>
  );
}
