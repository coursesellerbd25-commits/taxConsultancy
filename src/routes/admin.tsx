
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
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  {
    label: "Overview",
    description: "Dashboard summary",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Customer Enquiries",
    description: "Manage customer requests",
    href: "/admin/inquiries",
    icon: ClipboardList,
    showBadge: true,
  },
  {
    label: "Website Content",
    description: "Manage website pages",
    href: "/admin/content",
    icon: FileText,
  },
  {
    label: "Website Settings",
    description: "Business information",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    label: "Team Management",
    description: "Manage administrators",
    href: "/admin/team",
    icon: Users,
  },
];

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

function AdminLayout() {
  const { session, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [newInquiryCount, setNewInquiryCount] = useState(0);

  // Authentication and authorization
  useEffect(() => {
    if (loading) return;

    if (!session) {
      navigate({ to: "/login", replace: true });
    }
  }, [session, loading, navigate]);

  // Load and monitor new enquiries
  useEffect(() => {
    if (!session || !isAdmin) return;

    let mounted = true;

    const fetchNewInquiries = async () => {
      const { count, error } = await supabase
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("status", "new");

      if (!error && mounted) {
        setNewInquiryCount(count ?? 0);
      }
    };

    fetchNewInquiries();

    const channel = supabase
      .channel("admin-inquiry-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inquiries",
        },
        () => {
          fetchNewInquiries();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [session, isAdmin]);

  // Close mobile sidebar after navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (!error) {
      navigate({ to: "/login", replace: true });
    }
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }

    return (
      location.pathname === href ||
      location.pathname.startsWith(`${href}/`)
    );
  };

  const currentPage =
    navigation.find((item) => isActive(item.href))?.label ??
    "Admin Dashboard";

  if (loading || (!session && !isAdmin)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#243653] border-t-transparent" />
          <p className="text-sm text-slate-500">
            Checking administrator access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <ShieldCheck className="h-7 w-7 text-red-600" />
          </div>

          <h1 className="text-xl font-bold text-[#243653]">
            Access Restricted
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your account does not have administrator permissions to access
            this dashboard.
          </p>

          <button
            onClick={handleSignOut}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#243653] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1b2940]"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
          sidebarCollapsed ? "w-[76px]" : "w-[260px]"
        } ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo / Brand */}
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-5">
          <Link
            to="/admin"
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#243653] text-lg font-bold text-[#D9AA63]">
              T
            </div>

            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-sm font-bold text-[#243653]">
                  Corporate Tax
                </h1>
                <p className="text-[11px] font-medium tracking-wide text-slate-400">
                  ADMINISTRATION
                </p>
              </div>
            )}
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          {!sidebarCollapsed && (
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
              Workspace
            </p>
          )}

          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                    active
                      ? "bg-[#243653] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#243653]"
                  }`}
                >
                  <Icon
                    size={19}
                    className={`shrink-0 ${
                      active
                        ? "text-[#D9AA63]"
                        : "text-slate-400 group-hover:text-[#243653]"
                    }`}
                  />

                  {!sidebarCollapsed && (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold">
                          {item.label}
                        </p>
                        <p
                          className={`mt-0.5 truncate text-[10px] ${
                            active
                              ? "text-slate-300"
                              : "text-slate-400"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>

                      {item.showBadge && newInquiryCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B7792B] px-1.5 text-[10px] font-bold text-white">
                          {newInquiryCount > 99
                            ? "99+"
                            : newInquiryCount}
                        </span>
                      )}
                    </>
                  )}

                  {sidebarCollapsed &&
                    item.showBadge &&
                    newInquiryCount > 0 && (
                      <span className="absolute left-[57px] top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#B7792B]" />
                    )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-slate-100 p-3">
          <button
            onClick={handleSignOut}
            title={sidebarCollapsed ? "Sign out" : undefined}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} className="shrink-0" />

            {!sidebarCollapsed && (
              <span className="text-sm font-semibold">
                Sign out
              </span>
            )}
          </button>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="mt-2 hidden w-full items-center justify-center rounded-lg border border-slate-200 py-2 text-slate-400 transition hover:bg-slate-50 hover:text-[#243653] lg:flex"
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {sidebarCollapsed ? (
              <ChevronRight size={17} />
            ) : (
              <ChevronLeft size={17} />
            )}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-[#243653] sm:text-lg">
                {currentPage}
              </h2>
              <p className="hidden text-xs text-slate-400 sm:block">
                Corporate Tax Bangladesh / Administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              to="/admin/inquiries"
              className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-[#243653]"
              aria-label="View customer enquiries"
            >
              <Bell size={19} />

              {newInquiryCount > 0 && (
                <span className="absolute right-1 top-1 flex h-2.5 w-2.5 rounded-full border-2 border-white bg-[#B7792B]" />
              )}
            </Link>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#243653] text-sm font-bold text-[#D9AA63]">
                A
              </div>

              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-[#243653]">
                  Administrator
                </p>
                <p className="text-[10px] text-slate-400">
                  System access
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Child route content */}
        <main className="min-h-[calc(100vh-76px)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
