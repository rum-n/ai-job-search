"use client";
import { useRouter } from "next/navigation";

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
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-[#3a6174] text-white shadow">
      <div className="text-2xl font-bold tracking-wide">AI Job Search</div>
      <div className="flex gap-4">
        {user ? (
          <>
            <button
              className="px-4 py-2 rounded bg-[#a9bcd0] text-[#3a6174] font-semibold hover:bg-[#6b818c] hover:text-white transition cursor-pointer"
              onClick={() => router.push("/profile")}
            >
              Profile
            </button>
            <button
              className="px-4 py-2 rounded bg-[#a9bcd0] text-[#3a6174] font-semibold hover:bg-[#6b818c] hover:text-white transition cursor-pointer"
              onClick={onLogoutClick}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className="px-4 py-2 rounded bg-[#a9bcd0] text-[#3a6174] font-semibold hover:bg-[#6b818c] hover:text-white transition cursor-pointer"
              onClick={onLoginClick}
            >
              Login
            </button>
            <button
              className="px-4 py-2 rounded bg-[#a9bcd0] text-[#3a6174] font-semibold hover:bg-[#6b818c] hover:text-white transition cursor-pointer"
              onClick={onSignupClick}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
