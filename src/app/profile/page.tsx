"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Job = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  company?: string;
};

type SearchHistoryEntry = {
  id: string;
  query: string;
  createdAt: string;
  results: Job[];
};

export default function ProfilePage() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (!token || !email) {
      router.replace("/");
      return;
    }
    setUser({ email });
    // Fetch search history
    fetch("/api/history", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setHistory(data.history || []))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <div className="p-8 text-primary">Loading profile...</div>;
  }

  return (
    <>
      <Navbar
        user={user}
        onLoginClick={() => router.push("/login")}
        onSignupClick={() => router.push("/signup")}
        onLogoutClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("email");
          router.replace("/");
        }}
      />
      <div className="max-w-3xl mx-auto mt-12 flex flex-col gap-8">
        {/* User Info */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-6 pb-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-3xl font-bold text-primary shadow">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-1">
                Your Profile
              </div>
              <div className="text-muted-foreground">
                <span className="font-semibold">Email:</span>{" "}
                <span className="text-primary">{user?.email}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Search History */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 mb-2">
            <span role="img" aria-label="search" className="text-xl">
              🔍
            </span>
            <h2 className="text-xl font-semibold text-primary">Search History</h2>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-muted-foreground">
                No search history yet.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {history.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 bg-muted">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-primary">
                          {entry.query}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setExpanded(expanded === entry.id ? null : entry.id)
                        }
                      >
                        {expanded === entry.id ? "Hide Results" : "Show Results"}
                      </Button>
                    </div>
                    {expanded === entry.id && (
                      <div className="mt-4 flex flex-col gap-2">
                        {entry.results.length === 0 ? (
                          <div className="text-muted-foreground">
                            No jobs found for this search.
                          </div>
                        ) : (
                          entry.results.map((job, i) => (
                            <Card key={i} className="p-3">
                              <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                  <div className="font-bold text-primary">
                                    {job.title}
                                  </div>
                                  {job.company && (
                                    <div className="text-sm text-muted-foreground">
                                      {job.company}
                                    </div>
                                  )}
                                  <div className="text-xs text-muted-foreground">
                                    {job.pubDate
                                      ? new Date(job.pubDate).toLocaleDateString()
                                      : ""}
                                  </div>
                                </div>
                                <Badge variant="secondary">
                                  {job.source}
                                </Badge>
                              </CardHeader>
                              <Separator />
                              <CardContent>
                                <div className="text-sm text-primary line-clamp-3">
                                  {job.description}
                                </div>
                                <Button
                                  asChild
                                  variant="link"
                                  className="p-0 h-auto mt-2"
                                >
                                  <a
                                    href={job.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    More details &rarr;
                                  </a>
                                </Button>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applied Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 mb-2">
            <span role="img" aria-label="applied" className="text-xl">
              ✅
            </span>
            <h2 className="text-xl font-semibold text-primary">Applied Jobs</h2>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">
              Coming soon: Jobs you’ve marked as applied will appear here.
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
