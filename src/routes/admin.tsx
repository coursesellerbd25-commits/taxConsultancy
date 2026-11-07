import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LoaderCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Tax & VAT Consultancy" },
      { name: "description", content: "Manage consultation inquiries, services and website details." },
      { property: "og:title", content: "Admin Dashboard" },
      { property: "og:description", content: "Private administrator area." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Inquiries", exact: true },
  { to: "/admin/services", label: "Services", exact: false },
  { to: "/admin/settings", label: "Website settings", exact: false },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const { session, loading, isAdmin } = useAuth();

  useEffect(() => { if (!loading && !session) navigate({ to: "/login" }); }, [loading, session, navigate]);

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); };

  if (loading || !session || isAdmin === null) {
    return <div className="flex min-h-screen items-center justify-center"><LoaderCircle className="h-6 w-6 animate-spin text-primary" aria-label="Loading" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="container-page flex min-h-screen max-w-md flex-col justify-center py-16 text-center">
        <h1 className="text-2xl font-semibold">No administrator access</h1>
        <p className="mt-3 text-muted-foreground">This account ({session.user.email}) is not an administrator.</p>
        <Button variant="outline" className="mt-6" onClick={signOut}>Sign out</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b bg-primary text-primary-foreground">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <p className="font-serif text-lg">Admin dashboard</p>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/" className="text-primary-foreground/80 hover:text-gold">View website</Link>
            <Button size="sm" variant="secondary" onClick={signOut}><LogOut /> Sign out</Button>
          </div>
        </div>
        <nav aria-label="Admin" className="container-page flex gap-1 overflow-x-auto">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.exact }}
              className="whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm text-primary-foreground/80 hover:text-primary-foreground data-[status=active]:border-gold data-[status=active]:text-primary-foreground">
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="container-page py-8"><Outlet /></div>
    </div>
  );
}
