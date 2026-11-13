
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Inbox,
  Mail,
  Phone,
  MessageCircle,
  CalendarDays,
  Clock3,
  UserRound,
  FileText,
  Globe,
  MapPin,
  X,
  Loader2,
  RefreshCw,
  ChevronRight,
  Save,
  Filter,
  ArrowUpRight,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/inquiries")({
  component: AdminInquiriesPage,
});

type InquiryStatus = "new" | "contacted" | "in_progress" | "closed";

type Inquiry = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  preferred_contact_method: string | null;
  client_category: string | null;
  service_slug: string | null;
  preferred_time: string | null;
  preferred_date: string | null;
  message: string | null;
  preferred_language: string | null;
  country: string | null;
  status: InquiryStatus;
  internal_notes: string | null;
  consent_at: string | null;
  created_at: string;
  updated_at: string | null;
};

type StatusFilter = "all" | InquiryStatus;

const statusOptions: {
  value: InquiryStatus;
  label: string;
}[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
];

const statusStyles: Record<InquiryStatus, string> = {
  new: "border-blue-200 bg-blue-50 text-blue-700",
  contacted: "border-violet-200 bg-violet-50 text-violet-700",
  in_progress: "border-amber-200 bg-amber-50 text-amber-700",
  closed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatLabel(value: string | null | undefined) {
  if (!value) return "Not specified";

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function StatusBadge({ status }: { status: InquiryStatus }) {
  const label =
    statusOptions.find((option) => option.value === status)?.label ?? status;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {label}
    </span>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-slate-700">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}
        >
          <Icon size={17} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums text-[#243653]">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function AdminInquiriesPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  const inquiriesQuery = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []) as Inquiry[];
    },
  });

  const inquiries = inquiriesQuery.data ?? [];

  const selectedInquiry = useMemo(
    () => inquiries.find((inquiry) => inquiry.id === selectedId) ?? null,
    [inquiries, selectedId],
  );

  const filteredInquiries = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return inquiries.filter((inquiry) => {
      const matchesStatus =
        statusFilter === "all" || inquiry.status === statusFilter;

      const searchableText = [
        inquiry.full_name,
        inquiry.email,
        inquiry.phone,
        inquiry.service_slug,
        inquiry.client_category,
        inquiry.country,
        inquiry.message,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [inquiries, search, statusFilter]);

  const counts = useMemo(
    () => ({
      total: inquiries.length,
      new: inquiries.filter((item) => item.status === "new").length,
      contacted: inquiries.filter((item) => item.status === "contacted").length,
      inProgress: inquiries.filter((item) => item.status === "in_progress")
        .length,
      closed: inquiries.filter((item) => item.status === "closed").length,
    }),
    [inquiries],
  );

  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: InquiryStatus;
    }) => {
      const { error } = await supabase
        .from("inquiries")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-inquiries"],
      });

      toast.success("Enquiry status updated.");
    },
    onError: (error) => {
      toast.error(error.message || "Could not update enquiry status.");
    },
  });

  const notesMutation = useMutation({
    mutationFn: async ({
      id,
      notes,
    }: {
      id: string;
      notes: string;
    }) => {
      const { error } = await supabase
        .from("inquiries")
        .update({
          internal_notes: notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-inquiries"],
      });

      toast.success("Internal notes saved.");
    },
    onError: (error) => {
      toast.error(error.message || "Could not save internal notes.");
    },
  });

  const openInquiry = (inquiry: Inquiry) => {
    setSelectedId(inquiry.id);
    setNotesDraft(inquiry.internal_notes ?? "");
  };

  const closeInquiry = () => {
    setSelectedId(null);
    setNotesDraft("");
  };

  const handleStatusChange = (status: InquiryStatus) => {
    if (!selectedInquiry || selectedInquiry.status === status) return;

    statusMutation.mutate({
      id: selectedInquiry.id,
      status,
    });
  };

  const handleSaveNotes = () => {
    if (!selectedInquiry) return;

    notesMutation.mutate({
      id: selectedInquiry.id,
      notes: notesDraft,
    });
  };

  const whatsappNumber = selectedInquiry?.phone?.replace(/\D/g, "");

  if (inquiriesQuery.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 size={20} className="animate-spin" />
          Loading customer enquiries...
        </div>
      </div>
    );
  }

  if (inquiriesQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Could not load customer enquiries
        </h2>
        <p className="mt-2 text-sm text-red-700">
          {inquiriesQuery.error.message}
        </p>
        <Button
          variant="outline"
          className="mt-4 border-red-200 bg-white text-red-700 hover:bg-red-100"
          onClick={() => inquiriesQuery.refetch()}
        >
          <RefreshCw size={15} className="mr-2" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 pb-10">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#B7792B]">
            <Inbox size={14} />
            Customer management
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">
            Customer Enquiries
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Review customer submissions, manage follow-ups and keep track of
            every enquiry received through your website.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => inquiriesQuery.refetch()}
          disabled={inquiriesQuery.isFetching}
          className="h-10 border-slate-200 bg-white text-slate-600"
        >
          <RefreshCw
            size={15}
            className={`mr-2 ${inquiriesQuery.isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="Total enquiries"
          value={counts.total}
          icon={Inbox}
          color="bg-slate-100 text-slate-600"
        />
        <StatCard
          label="New"
          value={counts.new}
          icon={MessageCircle}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Contacted"
          value={counts.contacted}
          icon={Phone}
          color="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="In progress"
          value={counts.inProgress}
          icon={Clock3}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Closed"
          value={counts.closed}
          icon={CheckCircle2}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Main enquiry list */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-semibold text-[#243653]">
                All submissions
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {filteredInquiries.length} of {inquiries.length} enquiries
                displayed
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 sm:w-72">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email, phone..."
                  className="h-10 border-slate-200 pl-9 text-sm"
                />
              </div>

              <div className="relative sm:w-44">
                <Filter
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#B7792B]/30"
                  aria-label="Filter enquiries by status"
                >
                  <option value="all">All statuses</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredInquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ClipboardList size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-[#243653]">
              {inquiries.length === 0
                ? "No enquiries received yet"
                : "No matching enquiries"}
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              {inquiries.length === 0
                ? "Customer submissions from your website will appear here."
                : "Try changing your search term or selecting another status filter."}
            </p>

            {(search || statusFilter !== "all") && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Customer
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Service
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Received
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Details
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredInquiries.map((inquiry) => (
                    <tr
                      key={inquiry.id}
                      onClick={() => openInquiry(inquiry)}
                      className="cursor-pointer transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#243653]/[0.07] text-sm font-semibold text-[#243653]">
                            {inquiry.full_name?.charAt(0)?.toUpperCase() || "?"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#243653]">
                              {inquiry.full_name}
                            </p>
                            <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                              {inquiry.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {formatLabel(inquiry.service_slug)}
                        </p>
                        {inquiry.client_category && (
                          <p className="mt-1 text-xs text-slate-400">
                            {formatLabel(inquiry.client_category)}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-600">
                          {formatDate(inquiry.created_at)}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(inquiry.created_at).toLocaleTimeString(
                            "en-BD",
                            { hour: "numeric", minute: "2-digit" },
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={inquiry.status} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors group-hover:text-[#243653]">
                          <ChevronRight size={17} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredInquiries.map((inquiry) => (
                <button
                  key={inquiry.id}
                  type="button"
                  onClick={() => openInquiry(inquiry)}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#243653]/[0.07] text-sm font-semibold text-[#243653]">
                    {inquiry.full_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[#243653]">
                        {inquiry.full_name}
                      </p>
                      <StatusBadge status={inquiry.status} />
                    </div>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {inquiry.email}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span>{formatLabel(inquiry.service_slug)}</span>
                      <span>{formatDate(inquiry.created_at)}</span>
                    </div>
                  </div>

                  <ChevronRight
                    size={17}
                    className="shrink-0 text-slate-400"
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Enquiry detail drawer */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close enquiry details"
            onClick={closeInquiry}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
          />

          <aside className="relative flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#B7792B]">
                  Enquiry details
                </p>

                <h2 className="mt-2 truncate text-xl font-bold text-[#243653]">
                  {selectedInquiry.full_name}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Received {formatDateTime(selectedInquiry.created_at)}
                </p>
              </div>

              <button
                type="button"
                onClick={closeInquiry}
                aria-label="Close details"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100"
              >
                <X size={17} />
              </button>
            </div>

            {/* Drawer content */}
            <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
              {/* Status management */}
              <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#243653]">
                      Enquiry status
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Update the current follow-up stage.
                    </p>
                  </div>

                  <StatusBadge status={selectedInquiry.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {statusOptions.map((option) => {
                    const active = selectedInquiry.status === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={
                          active ||
                          statusMutation.isPending ||
                          notesMutation.isPending
                        }
                        onClick={() => handleStatusChange(option.value)}
                        className={`flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
                          active
                            ? "border-[#243653] bg-[#243653] text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-[#B7792B] hover:text-[#243653]"
                        }`}
                      >
                        {statusMutation.isPending &&
                        statusMutation.variables?.status === option.value ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : active ? (
                          <CheckCircle2 size={13} />
                        ) : null}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Contact actions */}
              <section>
                <h3 className="mb-3 text-sm font-semibold text-[#243653]">
                  Contact customer
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Mail size={15} />
                    Send email
                    <ArrowUpRight size={13} />
                  </a>

                  {selectedInquiry.phone ? (
                    <a
                      href={`tel:${selectedInquiry.phone}`}
                      className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Phone size={15} />
                      Call customer
                      <ArrowUpRight size={13} />
                    </a>
                  ) : (
                    <div className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-100 bg-slate-50 text-xs text-slate-400">
                      <Phone size={15} />
                      No phone number
                    </div>
                  )}

                  {whatsappNumber ? (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="col-span-2 flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                    >
                      <MessageCircle size={15} />
                      Contact through WhatsApp
                      <ArrowUpRight size={13} />
                    </a>
                  ) : null}
                </div>
              </section>

              {/* Customer information */}
              <section>
                <h3 className="mb-4 text-sm font-semibold text-[#243653]">
                  Customer information
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    icon={UserRound}
                    label="Full name"
                    value={selectedInquiry.full_name}
                  />

                  <InfoItem
                    icon={Mail}
                    label="Email address"
                    value={selectedInquiry.email}
                  />

                  <InfoItem
                    icon={Phone}
                    label="Phone number"
                    value={selectedInquiry.phone}
                  />

                  <InfoItem
                    icon={MessageCircle}
                    label="Preferred contact method"
                    value={formatLabel(
                      selectedInquiry.preferred_contact_method,
                    )}
                  />

                  <InfoItem
                    icon={UserRound}
                    label="Client category"
                    value={formatLabel(selectedInquiry.client_category)}
                  />

                  <InfoItem
                    icon={Globe}
                    label="Country"
                    value={selectedInquiry.country}
                  />

                  <InfoItem
                    icon={Globe}
                    label="Preferred language"
                    value={formatLabel(selectedInquiry.preferred_language)}
                  />

                  <InfoItem
                    icon={FileText}
                    label="Requested service"
                    value={formatLabel(selectedInquiry.service_slug)}
                  />
                </div>
              </section>

              {/* Appointment preferences */}
              <section>
                <h3 className="mb-4 text-sm font-semibold text-[#243653]">
                  Preferred consultation time
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    icon={CalendarDays}
                    label="Preferred date"
                    value={formatDate(selectedInquiry.preferred_date)}
                  />

                  <InfoItem
                    icon={Clock3}
                    label="Preferred time"
                    value={selectedInquiry.preferred_time}
                  />
                </div>
              </section>

              {/* Customer message */}
              <section>
                <h3 className="mb-3 text-sm font-semibold text-[#243653]">
                  Customer message
                </h3>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                    {selectedInquiry.message?.trim() ||
                      "No additional message was provided."}
                  </p>
                </div>
              </section>

              {/* Internal notes */}
              <section>
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-[#243653]">
                    Internal notes
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Private notes for administrators. These are not displayed
                    to customers.
                  </p>
                </div>

                <Textarea
                  value={notesDraft}
                  onChange={(event) => setNotesDraft(event.target.value)}
                  placeholder="Record follow-up details, discussion points or next steps..."
                  maxLength={5000}
                  className="min-h-[125px] resize-y border-slate-200 text-sm leading-relaxed focus-visible:ring-[#B7792B]/30"
                />

                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">
                    {notesDraft.length.toLocaleString()} / 5,000 characters
                  </span>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={
                      notesMutation.isPending ||
                      notesDraft === (selectedInquiry.internal_notes ?? "")
                    }
                    className="bg-[#243653] text-white hover:bg-[#1b2940]"
                  >
                    {notesMutation.isPending ? (
                      <Loader2 size={14} className="mr-2 animate-spin" />
                    ) : (
                      <Save size={14} className="mr-2" />
                    )}
                    Save notes
                  </Button>
                </div>
              </section>

              {/* Submission metadata */}
              <section className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Submission information
                </h3>

                <div className="mt-3 space-y-2 text-xs text-slate-500">
                  <p>
                    <span className="font-medium text-slate-600">
                      Submitted:
                    </span>{" "}
                    {formatDateTime(selectedInquiry.created_at)}
                  </p>

                  <p>
                    <span className="font-medium text-slate-600">
                      Last updated:
                    </span>{" "}
                    {formatDateTime(selectedInquiry.updated_at)}
                  </p>

                  <p>
                    <span className="font-medium text-slate-600">
                      Consent recorded:
                    </span>{" "}
                    {selectedInquiry.consent_at
                      ? formatDateTime(selectedInquiry.consent_at)
                      : "Not recorded"}
                  </p>

                  <p className="break-all">
                    <span className="font-medium text-slate-600">
                      Enquiry ID:
                    </span>{" "}
                    {selectedInquiry.id}
                  </p>
                </div>
              </section>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
