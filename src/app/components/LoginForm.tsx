import { useState } from "react";

export default function LoginForm({
  onSuccess,
}: {
  onSuccess: (data: { token: string; user: { email: string } }) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage("");
      onSuccess(data);
    } else {
      setMessage(data.error || "Login failed.");
    }
  }

  return (
    <form
      onSubmit={handleLogin}
      className="flex flex-col gap-4 bg-white rounded-xl p-6 min-w-[300px]"
    >
      <h2 className="text-xl font-bold text-[#3a6174] mb-2">Login</h2>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        type="email"
        className="border border-[#a9bcd0] text-[#6b818c] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#3a6174]"
        required
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        className="border border-[#a9bcd0] text-[#6b818c] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#3a6174]"
        required
      />
      <button
        type="submit"
        className="bg-[#3a6174] text-white rounded-lg p-2 font-semibold hover:bg-[#6b818c] transition cursor-pointer"
      >
        Login
      </button>
      {message && (
        <div className="text-center text-sm mt-2 text-red-600">{message}</div>
      )}
    </form>
  );
}
