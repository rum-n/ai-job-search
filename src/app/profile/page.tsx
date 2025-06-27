"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (!token || !email) {
      router.replace("/");
      return;
    }
    setUser({ email });
    setLoading(false);
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
            <div className="text-muted-foreground">
              Coming soon: Your recent searches will appear here.
            </div>
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
