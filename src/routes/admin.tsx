import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell, ChevronDown, ChevronLeft, ChevronRight, ClipboardList,
  ExternalLink, LayoutDashboard, LogOut, Menu, Settings2, ShieldCheck,
  BriefcaseBusiness, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Corporate Tax Bangladesh" },
      { name: "description", content: "Manage Corporate Tax Bangladesh enquiries, services and website information." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const navigation = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/inquiries", label: "Customer enquiries", icon: ClipboardList, exact: false },
  { to: "/admin/services", label: "Services", icon: BriefcaseBusiness, exact: false },
  { to: "/admin/settings", label: "Website settings", icon: Settings2, exact: false },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loading, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [newCount, setNewCount] = useState<number | null>(null);

  useEffect(() => { if (!loading && !session) navigate({ to: "/login" }); }, [loading, session, navigate]);
  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    const load = async () => {
      const { count } = await supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new");
      if (active) setNewCount(count ?? 0);
    };
    void load();
    const channel = supabase.channel("admin-inquiry-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "inquiries" }, () => { void load(); })
      .subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [isAdmin]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  if (loading || !session || isAdmin === null) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d9dee8] border-t-[#243653]" aria-label="Loading admin account" /></div>;
  }
  if (!isAdmin) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5"><div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm"><ShieldCheck className="mx-auto h-10 w-10 text-[#a36d25]"/><h1 className="mt-4 text-2xl font-semibold">Administrator access required</h1><p className="mt-2 text-sm text-slate-500">This account ({session.user.email}) does not have permission to access the admin dashboard.</p><Button variant="outline" className="mt-6" onClick={signOut}>Sign out</Button></div></div>;
  }

  const pageTitle = navigation.find((item) => item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to))?.label ?? "Admin";
  const initials = (session.user.email ?? "A").slice(0, 1).toUpperCase();

  const sidebar = <aside className={`flex h-full flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ${collapsed ? "w-[76px]" : "w-[258px]"}`}>
    <div className={`flex h-[76px] items-center border-b border-slate-100 ${collapsed ? "justify-center px-2" : "gap-3 px-6"}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#243653] text-sm font-bold tracking-tight text-white">TC</div>
      {!collapsed && <div className="min-w-0"><p className="truncate text-[15px] font-semibold text-slate-900">Corporate Tax Bangladesh</p><p className="text-xs text-slate-500">Administration</p></div>}
      <button onClick={() => setCollapsed(!collapsed)} className="ml-auto hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:block" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <ChevronRight size={17}/> : <ChevronLeft size={17}/>}</button>
    </div>
    <div className="px-3 pt-6"><p className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400 ${collapsed ? "sr-only" : ""}`}>Workspace</p><nav className="space-y-1" aria-label="Admin navigation">{navigation.map(({to,label,icon:Icon,exact}) => <Link key={to} to={to} activeOptions={{exact}} onClick={() => setMobileOpen(false)} title={collapsed ? label : undefined} className="group flex h-11 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 data-[status=active]:bg-[#edf1f7] data-[status=active]:text-[#243653]"><Icon size={18} strokeWidth={1.8} className="shrink-0"/><span className={collapsed ? "sr-only" : "flex-1"}>{label}</span>{to === "/admin/inquiries" && !!newCount && <span className="rounded-full bg-[#b7792b] px-2 py-0.5 text-[10px] font-semibold text-white">{newCount}</span>}</Link>)}</nav></div>
    <div className="mt-auto border-t border-slate-100 p-3"><a href="/" target="_blank" rel="noreferrer" className={`mb-2 flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 ${collapsed ? "justify-center" : ""}`}><ExternalLink size={17}/>{!collapsed && "View public website"}</a><button onClick={signOut} title={collapsed ? "Sign out" : undefined} className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-rose-600 hover:bg-rose-50 ${collapsed ? "justify-center" : ""}`}><LogOut size={17}/>{!collapsed && "Sign out"}</button></div>
  </aside>;

  return <div className="min-h-screen bg-[#f7f8fa] text-slate-800">
    <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/35" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/><div className="relative h-full w-[280px] max-w-[85vw]">{sidebar}<button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="absolute right-3 top-5 rounded-md p-2 text-slate-500"><X size={18}/></button></div></div>}
    <div className={`min-h-screen transition-[padding] duration-200 ${collapsed ? "lg:pl-[76px]" : "lg:pl-[258px]"}`}>
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-7">
        <div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open navigation"><Menu size={20}/></button><div><div className="hidden items-center gap-2 text-[11px] text-slate-400 sm:flex"><span>Corporate Tax Bangladesh</span><span>/</span><span>Workspace</span><span>/</span><span className="text-slate-600">{pageTitle}</span></div><h1 className="text-[17px] font-semibold tracking-tight text-slate-900">{pageTitle}</h1></div></div>
        <div className="flex items-center gap-2 sm:gap-4"><Link to="/admin/inquiries" aria-label={`${newCount ?? 0} new enquiries`} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Bell size={19}/>{!!newCount && <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-white bg-amber-500"/>}</Link><div className="relative"><button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9edf4] text-xs font-semibold text-[#243653]">{initials}</span><span className="hidden max-w-[180px] text-left sm:block"><span className="block truncate text-xs font-semibold text-slate-800">{session.user.email}</span><span className="block text-[10px] text-slate-500">Administrator</span></span><ChevronDown size={15} className="hidden text-slate-400 sm:block"/></button>{profileOpen && <><button className="fixed inset-0 z-10 cursor-default" aria-label="Close profile menu" onClick={() => setProfileOpen(false)}/><div className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"><div className="border-b border-slate-100 px-3 py-2"><p className="text-xs font-semibold">Signed in as</p><p className="mt-1 truncate text-xs text-slate-500">{session.user.email}</p></div><button onClick={signOut} className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"><LogOut size={15}/> Sign out</button></div></>}</div></div>
      </header>
      <main className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-7 lg:px-9"><Outlet/></main>
      <footer className="px-7 pb-6 text-center text-[11px] text-slate-400">Corporate Tax Bangladesh · Private administration workspace</footer>
    </div>
  </div>;
}
