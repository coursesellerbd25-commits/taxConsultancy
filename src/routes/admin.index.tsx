
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfDay } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  Inbox,
  MessageSquareText,
  Plus,
  Settings2,
  ShieldCheck,
  TrendingUp,
  Users,
  Eye,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/")({
  component: DashboardOverview,
});

type Inquiry = Tables<"inquiries">;
type Service = Tables<"services">;

const COLORS = [
  "#263a59",
  "#c18a43",
  "#6c829f",
  "#9ba9b9",
];

const dateLabel = (value: string) =>
  format(new Date(value), "dd MMM yyyy, HH:mm");

function DashboardOverview() {
  // Customer enquiries
  const inquiriesQuery = useQuery({
    queryKey: ["admin-dashboard-inquiries"],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;

      return data as Inquiry[];
    },

    refetchInterval: 60000,
  });

  // Website services
  const servicesQuery = useQuery({
    queryKey: ["admin-dashboard-services"],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return data as Service[];
    },

    refetchInterval: 60000,
  });

  const inquiries = inquiriesQuery.data ?? [];
  const services = servicesQuery.data ?? [];

  const loading =
    inquiriesQuery.isLoading || servicesQuery.isLoading;

  const failed =
    inquiriesQuery.isError || servicesQuery.isError;

  // Dashboard statistics
  const stats = useMemo(() => ({
    totalInquiries: inquiries.length,

    newInquiries: inquiries.filter(
      (i) => i.status === "new"
    ).length,

    pending: inquiries.filter(
      (i) => ["contacted", "in_progress"].includes(i.status)
    ).length,

    resolved: inquiries.filter(
      (i) => ["closed", "resolved"].includes(i.status)
    ).length,

    totalServices: services.length,

    activeServices: services.filter(
      (s) => s.enabled
    ).length,
  }), [inquiries, services]);

  // Last seven days of enquiry activity
  const daily = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const day = startOfDay(
        subDays(new Date(), 6 - index)
      );

      const next = new Date(
        day.getTime() + 86400000
      );

      return {
        day: format(day, "EEE"),
        count: inquiries.filter((i) => {
          const date = new Date(i.created_at);
          return date >= day && date < next;
        }).length,
      };
    });
  }, [inquiries]);

  // Enquiry distribution by service
  const byService = useMemo(() => {
    const counts = new Map<string, number>();

    inquiries.forEach((inquiry) => {
      counts.set(
        inquiry.service_slug,
        (counts.get(inquiry.service_slug) ?? 0) + 1
      );
    });

    return [...counts.entries()]
      .map(([slug, count]) => ({
        name:
          services.find((s) => s.slug === slug)?.title ??
          slug.replace(/^course-/, "Course: "),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [inquiries, services]);

  // Enquiry statuses
  const statuses = useMemo(() => [
    {
      name: "New",
      value: inquiries.filter(
        (i) => i.status === "new"
      ).length,
    },
    {
      name: "Contacted",
      value: inquiries.filter(
        (i) => i.status === "contacted"
      ).length,
    },
    {
      name: "In progress",
      value: inquiries.filter(
        (i) => i.status === "in_progress"
      ).length,
    },
    {
      name: "Resolved",
      value: inquiries.filter(
        (i) => ["closed", "resolved"].includes(i.status)
      ).length,
    },
  ].filter((s) => s.value > 0), [inquiries]);

  return (
    <div className="space-y-7">

      {/* PAGE INTRODUCTION */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.15em] text-[#a97838]">
            Administration overview
          </p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your website, monitor enquiries and oversee
            your consultancy operations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock3 size={14} />
          Last refreshed: {format(new Date(), "dd MMM yyyy")}
        </div>
      </section>

      {/* ERROR MESSAGE */}
      {failed && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          Some dashboard information could not be loaded.
          Please check your Supabase connection and permissions.
        </div>
      )}

      {/* BUSINESS STATISTICS */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Business summary
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              An overview of your website's current activity.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Metric
            title="Total enquiries"
            value={stats.totalInquiries}
            detail="All received consultation requests"
            icon={Inbox}
            tone="navy"
            loading={loading}
          />

          <Metric
            title="New enquiries"
            value={stats.newInquiries}
            detail="Waiting for administrator review"
            icon={MessageSquareText}
            tone="amber"
            loading={loading}
          />

          <Metric
            title="In progress"
            value={stats.pending}
            detail="Contacted or being handled"
            icon={Clock3}
            tone="purple"
            loading={loading}
          />

          <Metric
            title="Resolved enquiries"
            value={stats.resolved}
            detail="Successfully closed requests"
            icon={CheckCircle2}
            tone="green"
            loading={loading}
          />

          <Metric
            title="Website services"
            value={stats.totalServices}
            detail="Available service records"
            icon={BriefcaseBusiness}
            tone="blue"
            loading={loading}
          />

          <Metric
            title="Published services"
            value={stats.activeServices}
            detail="Currently visible on the website"
            icon={Eye}
            tone="slate"
            loading={loading}
          />
        </div>
      </section>

      {/* WEBSITE MANAGEMENT */}
      <section>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Website management
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Manage the content and configuration of your public website.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

          <ManagementCard
            icon={FileText}
            title="Website content"
            description="Edit landing pages, headings, images, sections and website information."
            href="/admin/content"
            action="Manage content"
          />

          <ManagementCard
            icon={Inbox}
            title="Customer enquiries"
            description="Review consultation requests and manage customer follow-ups."
            href="/admin/inquiries"
            action="View enquiries"
            badge={
              stats.newInquiries > 0
                ? `${stats.newInquiries} new`
                : undefined
            }
          />

          <ManagementCard
            icon={Users}
            title="Team management"
            description="Manage administrator accounts, team access and permissions."
            href="/admin/team"
            action="Manage team"
          />

        </div>
      </section>

      {/* CHARTS */}
      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">

        {/* ENQUIRY ACTIVITY */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Enquiry activity
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Customer requests received over the last seven days.
              </p>
            </div>

            <span className="rounded-lg bg-slate-50 p-2 text-slate-500">
              <TrendingUp size={17} />
            </span>
          </div>

          <div className="mt-5 h-[245px]">
            {loading ? (
              <ChartPlaceholder />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={daily}
                  margin={{
                    top: 8,
                    right: 8,
                    left: -22,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="inquiryFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#263a59"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor="#263a59"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#edf0f4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#8993a2" }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#8993a2" }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Enquiries"
                    stroke="#263a59"
                    strokeWidth={2.5}
                    fill="url(#inquiryFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ENQUIRY STATUS */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Enquiry status
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Current customer request distribution.
            </p>
          </div>

          <div className="relative mt-3 h-[175px]">
            {loading ? (
              <ChartPlaceholder />
            ) : statuses.length ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statuses}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={53}
                      outerRadius={76}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {statuses.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-semibold text-slate-900">
                    {stats.totalInquiries}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Total
                  </span>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No enquiry data yet.
              </div>
            )}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-3">
            {["New", "Contacted", "In progress", "Resolved"].map(
              (name, index) => (
                <div
                  key={name}
                  className="flex items-center gap-2 text-[11px] text-slate-500"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: COLORS[index] }}
                  />
                  {name}

                  <strong className="ml-auto font-semibold text-slate-800">
                    {statuses.find((s) => s.name === name)?.value ?? 0}
                  </strong>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* LOWER DASHBOARD */}
      <section className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">

        {/* TOP SERVICES */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Most requested services
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Enquiry distribution by service.
              </p>
            </div>

            <Link
              to="/admin/inquiries"
              className="text-xs font-medium text-[#344c70] hover:underline"
            >
              View all <ArrowRight size={13} className="ml-1 inline" />
            </Link>
          </div>

          <div className="mt-4 h-[220px]">
            {loading ? (
              <ChartPlaceholder />
            ) : byService.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={byService}
                  layout="vertical"
                  margin={{
                    top: 4,
                    right: 12,
                    left: 8,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    stroke="#edf0f4"
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#8993a2" }}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={145}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />

                  <Bar
                    dataKey="count"
                    name="Enquiries"
                    fill="#344c70"
                    radius={[0, 5, 5, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No service enquiries yet." />
            )}
          </div>
        </div>

        {/* RECENT WEBSITE UPDATES */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Recently updated content
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Latest changes to your service catalogue.
              </p>
            </div>

            <a
              href="/admin/content"
              className="text-xs font-medium text-[#344c70] hover:underline"
            >
              Manage <ArrowRight size={13} className="ml-1 inline" />
            </a>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {loading ? (
              <ChartPlaceholder />
            ) : services.length ? (
              services.slice(0, 4).map((service) => (
                <div
                  key={service.id}
                  className="flex items-center gap-3 py-3 first:pt-0"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0f3f7] text-[#344c70]">
                    <BriefcaseBusiness size={16} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-800">
                      {service.title}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Updated{" "}
                      {format(
                        new Date(service.updated_at),
                        "dd MMM yyyy"
                      )}
                    </p>
                  </div>

                  <Badge
                    variant={service.enabled ? "default" : "secondary"}
                    className={
                      service.enabled
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                        : ""
                    }
                  >
                    {service.enabled ? "Active" : "Hidden"}
                  </Badge>
                </div>
              ))
            ) : (
              <EmptyState message="No website content found." />
            )}
          </div>
        </div>
      </section>

      {/* RECENT ENQUIRIES + QUICK ACTIONS */}
      <section className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">

        {/* RECENT ENQUIRIES */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Recent customer enquiries
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Latest requests submitted through your website.
              </p>
            </div>

            <Link
              to="/admin/inquiries"
              className="text-xs font-medium text-[#344c70] hover:underline"
            >
              View all <ArrowRight size={13} className="ml-1 inline" />
            </Link>
          </div>

          {loading ? (
            <ChartPlaceholder />
          ) : inquiries.slice(0, 5).length ? (
            <div className="divide-y divide-slate-100">
              {inquiries.slice(0, 5).map((inquiry) => (
                <Link
                  key={inquiry.id}
                  to="/admin/inquiries"
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {inquiry.full_name.slice(0, 1).toUpperCase()}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-slate-800">
                      {inquiry.full_name}
                    </span>

                    <span className="mt-1 block truncate text-[11px] text-slate-400">
                      {inquiry.email} · {inquiry.service_slug}
                    </span>
                  </span>

                  <span className="hidden text-[10px] text-slate-400 sm:block">
                    {dateLabel(inquiry.created_at)}
                  </span>

                  <Badge
                    variant={
                      inquiry.status === "new"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {inquiry.status.replaceAll("_", " ")}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <Inbox className="mx-auto h-7 w-7 text-slate-300" />
              <p className="mt-2 text-xs text-slate-500">
                No enquiries have been received yet.
              </p>
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">
            Quick actions
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Common administration tasks.
          </p>

          <div className="mt-4 space-y-2">
            <QuickAction
              href="/admin/content"
              icon={Plus}
              title="Edit website content"
              detail="Update pages and website sections"
            />

            <QuickAction
              href="/admin/inquiries"
              icon={Inbox}
              title="Review enquiries"
              detail={`${stats.newInquiries} new requests to review`}
            />

            <QuickAction
              href="/admin/team"
              icon={Users}
              title="Manage administrators"
              detail="Control team accounts and permissions"
            />

            <QuickAction
              href="/admin/settings"
              icon={Settings2}
              title="Administration settings"
              detail="Configure website and system preferences"
            />
          </div>

          <div className="mt-4 rounded-lg bg-[#f5f7fa] p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#344c70]">
              <ShieldCheck size={15} />
              Administration tip
            </div>

            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Keep website content up to date, review new enquiries
              regularly and ensure administrator access is assigned
              only to authorized team members.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

// STATISTIC CARD
function Metric({
  title,
  value,
  detail,
  icon: Icon,
  tone,
  loading,
}: {
  title: string;
  value: number;
  detail: string;
  icon: typeof Inbox;
  tone: string;
  loading: boolean;
}) {
  const tones: Record<string, string> = {
    navy: "bg-[#eef1f6] text-[#344c70]",
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-violet-50 text-violet-700",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-500">
          {title}
        </p>

        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}
        >
          <Icon size={17} />
        </span>
      </div>

      <div className="mt-3 text-[28px] font-semibold tracking-tight text-slate-900">
        {loading ? (
          <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-100" />
        ) : (
          value.toLocaleString()
        )}
      </div>

      <p className="mt-1 text-[11px] text-slate-400">
        {detail}
      </p>
    </div>
  );
}

// WEBSITE MANAGEMENT CARD
function ManagementCard({
  icon: Icon,
  title,
  description,
  href,
  action,
  badge,
}: {
  icon: typeof Inbox;
  title: string;
  description: string;
  href: string;
  action: string;
  badge?: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-[#b8c4d4] hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef1f6] text-[#344c70]">
          <Icon size={19} />
        </span>

        {badge && (
          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50">
            {badge}
          </Badge>
        )}
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 min-h-[40px] text-xs leading-relaxed text-slate-500">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#344c70]">
        {action}
        <ArrowUpRight
          size={14}
          className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </a>
  );
}

// QUICK ACTION
function QuickAction({
  href,
  icon: Icon,
  title,
  detail,
}: {
  href: string;
  icon: typeof Inbox;
  title: string;
  detail: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f3f7] text-[#344c70]">
        <Icon size={16} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-slate-800">
          {title}
        </span>

        <span className="mt-1 block truncate text-[10px] text-slate-400">
          {detail}
        </span>
      </span>

      <ArrowRight
        size={15}
        className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600"
      />
    </a>
  );
}

// LOADING PLACEHOLDER
function ChartPlaceholder() {
  return (
    <div className="flex h-full min-h-24 items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#344c70]" />
    </div>
  );
}

// EMPTY STATE
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-24 items-center justify-center text-xs text-slate-400">
      {message}
    </div>
  );
}
