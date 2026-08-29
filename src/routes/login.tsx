import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { pageHead } from "@/lib/pravaah/head";
import { DEMO_USERS } from "@/lib/pravaah/demo-data";

export const Route = createFileRoute("/login")({
  head: pageHead("Sign in", "Role-based sign-in for the PRAVAAH AI disaster decision-support prototype."),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("authority@pravaah.demo");
  const [password, setPassword] = useState("pravaah123");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-wide">PRAVAAH AI</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Predict the risk. Understand the impact. Act before disaster strikes.
          </p>
        </div>

        <form
          className="panel space-y-3 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
            setMessage(
              user
                ? `Demo sign-in accepted for role ${user.role}. Authentication is not yet wired to a backend — the prototype currently runs without a session.`
                : "No matching demo account. Use one of the demo credentials listed below.",
            );
          }}
        >
          <label className="block text-sm">
            <span className="label-mono">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              type="email"
            />
          </label>
          <label className="block text-sm">
            <span className="label-mono">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              type="password"
            />
          </label>
          <button className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Sign in
          </button>
          {message && <p className="text-xs text-risk-moderate">{message}</p>}
          <Link to="/" className="block text-center text-xs text-primary hover:underline">
            Continue to dashboard →
          </Link>
        </form>

        <div className="panel p-4 text-xs">
          <p className="label-mono mb-2">Demo credentials (password: pravaah123)</p>
          <ul className="space-y-1 text-muted-foreground">
            {DEMO_USERS.map((u) => (
              <li key={u.email} className="flex justify-between gap-2">
                <span className="font-mono">{u.email}</span>
                <span>{u.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
