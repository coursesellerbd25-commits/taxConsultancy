import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Administrator Sign In | Tax & VAT Consultancy" },
      { name: "description", content: "Sign in to manage consultation inquiries and website settings." },
      { property: "og:title", content: "Administrator Sign In" },
      { property: "og:description", content: "Private administrator area." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

type Mode = "signin" | "signup" | "reset";

function Login() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => { if (session) navigate({ to: "/admin" }); }, [session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null); setNotice(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError("Incorrect email or password, or your email is not yet confirmed.");
      } else if (mode === "signup") {
        if (password.length < 8) { setError("Use at least 8 characters for your password."); return; }
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/login` } });
        if (error) setError(error.message);
        else setNotice("Check your email and click the confirmation link, then sign in here.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) setError(error.message);
        else setNotice("If an account exists for this email, a reset link has been sent.");
      }
    } finally { setBusy(false); }
  }

  const titles: Record<Mode, string> = { signin: "Administrator sign in", signup: "Create administrator account", reset: "Reset your password" };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm rounded-md border bg-card p-8 shadow-sm">
        <span className="gold-rule" />
        <h1 className="mt-4 text-2xl font-semibold">{titles[mode]}</h1>
        {mode === "signup" && <p className="mt-2 text-sm text-muted-foreground">Only the first account created receives administrator access.</p>}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {mode !== "reset" && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <LoaderCircle className="animate-spin" />}
            {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
          </Button>
        </form>
        <div className="mt-6 space-y-2 text-sm">
          {mode !== "signin" && <button type="button" className="block text-primary hover:underline" onClick={() => setMode("signin")}>Back to sign in</button>}
          {mode === "signin" && <button type="button" className="block text-primary hover:underline" onClick={() => setMode("reset")}>Forgot password?</button>}
          {mode === "signin" && <button type="button" className="block text-primary hover:underline" onClick={() => setMode("signup")}>Create an account</button>}
          <Link to="/" className="block text-muted-foreground hover:text-primary">← Back to website</Link>
        </div>
      </div>
    </div>
  );
}
