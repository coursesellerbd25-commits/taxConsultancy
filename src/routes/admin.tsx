
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  ShieldCheck,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Corporate Tax Bangladesh" },
      {
        name: "description",
        content:
          "Manage Corporate Tax Bangladesh enquiries, services and website information.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const navigation = [
  {
    to: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    to: "/admin/inquiries",
    label: "Customer enquiries",
    icon: ClipboardList,
    exact: false,
  },
  {
    to: "/admin/services",
    label: "Services",
    icon: BriefcaseBusiness,
    exact: false,
  },
  {
    to: "/admin/settings",
    label: "Website settings",
    icon: Settings2,
    exact: false,
  },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loading, isAdmin } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [newCount, setNewCount] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/login" });
    }
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    let active = true;

    const loadCount = async () => {
      const { count, error } = await supabase
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("status", "new");

      if (!active) return;

      if (error) {
        console.error("Could not load enquiry count:", error);
        return;
      }

      setNewCount(count ?? 0);
    };

    void loadCount();

    const channel = supabase
      .channel("admin-inquiry-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inquiries",
        },
        () => {
          void loadCount();
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out failed:", error);
      return;
    }

    navigate({ to: "/login" });
  };

  if (loading || !session || isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">
        <div
          className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#dce2eb] border-t-[#243653]"
          aria-label="Loading admin account"
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f0e8] text-[#a36d25]">
            <ShieldCheck size={28} />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-slate-900">
            Administrator access required
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This account ({session.user.email}) does not have permission to
            access the admin dashboard.
          </p>

          <Button
            variant="outline"
            className="mt-6"
            onClick={signOut}
          >
            <LogOut size={16} className="mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  const pageTitle =
    navigation.find((item) =>
      item.exact
        ? location.pathname === item.to
        : location.pathname.startsWith(item.to),
    )?.label ?? "Admin";

  const initials = (session.user.email ?? "A")
    .slice(0, 1)
    .toUpperCase();

  const sidebar = (
    <aside
      className={`flex h-full flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ${
        collapsed ? "w-[76px]" : "w-[258px]"
      }`}
    >
      <div
        className={`flex h-[76px] shrink-0 items-center border-b border-slate-100 ${
          collapsed ? "justify-center px-2" : "gap-3 px-5"
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#243653] text-sm font-bold tracking-tight text-white shadow-sm">
          CT
        </div>

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold tracking-tight text-[#243653]">
              Corporate Tax
            </p>
            <p className="text-[11px] font-medium text-slate-500">
              Bangladesh · Admin
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="ml-auto hidden rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:block"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </div>

      <div className="px-3 pt-7">
        <p
          className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400 ${
            collapsed ? "sr-only" : ""
          }`}
        >
          Workspace
        </p>

        <nav className="space-y-1" aria-label="Admin navigation">
          {navigation.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className="group flex h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#243653] data-[status=active]:bg-[#edf1f7] data-[status=active]:font-semibold data-[status=active]:text-[#243653]"
            >
              <Icon size={18} strokeWidth={1.8} className="shrink-0" />

              <span className={collapsed ? "sr-only" : "flex-1"}>
                {label}
              </span>

              {to === "/admin/inquiries" && !!newCount && (
                <span className="rounded-full bg-[#b7792b] px-2 py-0.5 text-[10px] font-bold text-white">
                  {newCount > 99 ? "99+" : newCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-100 p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className={`mb-2 flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "View public website" : undefined}
        >
          <ExternalLink size={17} />
          {!collapsed && "View public website"}
        </a>

        <button
          type="button"
          onClick={signOut}
          title={collapsed ? "Sign out" : undefined}
          className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-[13px] font-medium text-rose-600 transition hover:bg-rose-50 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={17} />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-800">
      {/* Desktop sidebar */}
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        {sidebar}
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />

          <div className="relative h-full w-[280px] max-w-[85vw]">
            {sidebar}

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-5 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div
        className={`min-h-screen transition-[padding] duration-200 ${
          collapsed ? "lg:pl-[76px]" : "lg:pl-[258px]"
        }`}
      >
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <div className="hidden items-center gap-2 text-[11px] text-slate-400 sm:flex">
                <span>Corporate Tax Bangladesh</span>
                <span>/</span>
                <span>Workspace</span>
                <span>/</span>
                <span className="text-slate-600">{pageTitle}</span>
              </div>

              <h1 className="truncate text-[17px] font-semibold tracking-tight text-slate-900">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Link
              to="/admin/inquiries"
              aria-label={`${newCount ?? 0} new enquiries`}
              className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-[#243653]"
            >
              <Bell size={19} />

              {!!newCount && (
                <>
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#b7792b]" />
                  <span className="sr-only">
                    {newCount} new enquiries
                  </span>
                </>
              )}
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50"
                aria-expanded={profileOpen}
                aria-label="Open administrator profile menu"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9edf4] text-xs font-bold text-[#243653]">
                  {initials}
                </span>

                <span className="hidden max-w-[180px] text-left sm:block">
                  <span className="block truncate text-xs font-semibold text-slate-800">
                    {session.user.email}
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    Administrator
                  </span>
                </span>

                <ChevronDown
                  size={15}
                  className="hidden text-slate-400 sm:block"
                />
              </button>

              {profileOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10 cursor-default"
                    aria-label="Close profile menu"
                    onClick={() => setProfileOpen(false)}
                  />

                  <div className="absolute right-0 top-12 z-20 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <div className="border-b border-slate-100 px-3 py-3">
                      <p className="text-xs font-semibold text-slate-800">
                        Signed in as
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {session.user.email}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={signOut}
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto min-h-[calc(100vh-140px)] w-full max-w-[1600px] px-4 py-7 sm:px-7 lg:px-9">
          <Outlet />
        </main>

        <footer className="px-4 pb-6 text-center text-[11px] text-slate-400 sm:px-7">
          Corporate Tax Bangladesh · Private administration workspace
        </footer>
      </div>
    </div>
  );
}
