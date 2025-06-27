"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Navbar({
  user,
  onLoginClick,
  onSignupClick,
  onLogoutClick,
}: {
  user: { email: string } | null;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogoutClick: () => void;
}) {
  const router = useRouter();

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-card border-b shadow-sm">
      <div
        className="text-2xl font-bold tracking-wide text-primary cursor-pointer"
        onClick={() => router.push("/")}
      >
        AI Job Search
      </div>
      <div className="flex gap-3">
        {user ? (
          <>
            <Button variant="outline" onClick={() => router.push("/profile")}>
              Profile
            </Button>
            <Button variant="destructive" onClick={onLogoutClick}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button variant="default" onClick={onLoginClick}>
              Login
            </Button>
            <Button variant="secondary" onClick={onSignupClick}>
              Sign Up
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
