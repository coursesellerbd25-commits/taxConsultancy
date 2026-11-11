
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
      {
        name: "description",
        content: "Private administrator sign-in.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { session, loading, isAdmin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resetMode, setResetMode] = useState(false);

  useEffect(() => {
    if (!loading && session && isAdmin === true) {
      navigate({ to: "/admin" });
    }
  }, [loading, session, isAdmin, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (resetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          setError(error.message);
        } else {
          setNotice("If an account exists for this email, a reset link has been sent.");
        }

        return;
      }

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError || !data.user) {
        setError("Incorrect email or password, or your email is not confirmed.");
        return;
      }

      const { data: hasAdminRole, error: roleError } =
        await supabase.rpc("has_role", {
          _user_id: data.user.id,
          _role: "admin",
        });

      if (roleError) {
        await supabase.auth.signOut();
        setError("Could not verify administrator access. Please try again.");
        return;
      }

      if (hasAdminRole !== true) {
        await supabase.auth.signOut();
        setError("This account is not authorized to access the admin dashboard.");
        return;
      }

      await navigate({ to: "/admin" });
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Something went wrong while signing in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm rounded-md border bg-card p-8 shadow-sm">
        <span className="gold-rule" />

        <h1 className="mt-4 text-2xl font-semibold">
          {resetMode ? "Reset your password" : "Administrator sign in"}
        </h1>

        {session && !loading && isAdmin === false && !resetMode && (
          <p className="mt-3 text-sm text-destructive">
            This account does not have administrator access.
          </p>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {!resetMode && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {notice && (
            <p role="status" className="text-sm text-primary">
              {notice}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <LoaderCircle className="animate-spin" />}
            {resetMode ? "Send reset link" : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-sm">
          <button
            type="button"
            className="block text-primary hover:underline"
            onClick={() => {
              setResetMode(!resetMode);
              setError(null);
              setNotice(null);
            }}
          >
            {resetMode ? "Back to sign in" : "Forgot password?"}
          </button>

          <Link
            to="/"
            className="block text-muted-foreground hover:text-primary"
          >
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
