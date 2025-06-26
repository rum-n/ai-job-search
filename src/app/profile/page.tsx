"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    return <div className="p-8 text-[#3a6174]">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 bg-white rounded-2xl shadow-2xl p-10 border border-[#a9bcd0] flex flex-col gap-8">
      {/* User Info */}
      <div className="flex items-center gap-6 border-b border-[#a9bcd0] pb-6">
        <div className="w-20 h-20 rounded-full bg-[#a9bcd0] flex items-center justify-center text-3xl font-bold text-[#3a6174] shadow">
          {user?.email?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <div className="text-2xl font-bold text-[#3a6174] mb-1">
            Your Profile
          </div>
          <div className="text-[#6b818c]">
            <span className="font-semibold">Email:</span>{" "}
            <span className="text-[#3a6174]">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Search History */}
      <div className="bg-[#f6f8fa] rounded-xl p-6 shadow-inner">
        <h2 className="text-xl font-semibold text-[#3a6174] mb-2 flex items-center gap-2">
          <span role="img" aria-label="search">
            🔍
          </span>{" "}
          Search History
        </h2>
        <div className="text-[#6b818c]">
          Coming soon: Your recent searches will appear here.
        </div>
      </div>

      {/* Applied Jobs */}
      <div className="bg-[#f6f8fa] rounded-xl p-6 shadow-inner">
        <h2 className="text-xl font-semibold text-[#3a6174] mb-2 flex items-center gap-2">
          <span role="img" aria-label="applied">
            ✅
          </span>{" "}
          Applied Jobs
        </h2>
        <div className="text-[#6b818c]">
          Coming soon: Jobs you’ve marked as applied will appear here.
        </div>
      </div>
    </div>
  );
}
