
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  UserPlus,
  Users,
  Mail,
  LockKeyhole,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/team")({
  component: AdminTeamPage,
});

type AdminMember = {
  id: string;
  email: string;
  role: "main_admin" | "admin";
  created_at: string | null;
  last_sign_in_at: string | null;
};

type TeamResponse = {
  members?: AdminMember[];
  member?: AdminMember;
  error?: string;
};

function formatDate(value: string | null) {
  if (!value) return "Never";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getFunctionError(
  error: { message?: string } | null,
  data: TeamResponse | null,
) {
  return data?.error || error?.message || "Something went wrong.";
}

function AdminRoleBadge({ role }: { role: AdminMember["role"] }) {
  const isMainAdmin = role === "main_admin";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        isMainAdmin
          ? "border-[#B7792B]/30 bg-[#B7792B]/10 text-[#94601E]"
          : "border-blue-200 bg-blue-50 text-blue-700"
      }`}
    >
      <Shield size={12} />
      {isMainAdmin ? "Main administrator" : "Administrator"}
    </span>
  );
}

function AdminTeamPage() {
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const teamQuery = useQuery({
    queryKey: ["admin-team"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<TeamResponse>(
        "admin-team",
        {
          body: { action: "list" },
        },
      );

      if (error || data?.error) {
        throw new Error(getFunctionError(error, data));
      }

      return data?.members ?? [];
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      const { data, error } = await supabase.functions.invoke<TeamResponse>(
        "admin-team",
        {
          body: {
            action: "create",
            email: values.email,
            password: values.password,
          },
        },
      );

      if (error || data?.error) {
        throw new Error(getFunctionError(error, data));
      }

      if (!data?.member) {
        throw new Error("The server did not return the created administrator.");
      }

      return data.member;
    },

    onSuccess: async (member) => {
      setEmail("");
      setPassword("");
      setShowPassword(false);

      await queryClient.invalidateQueries({
        queryKey: ["admin-team"],
      });

      toast.success(`Administrator account created for ${member.email}.`);
    },

    onError: (error) => {
      toast.error(error.message || "Could not create administrator account.");
    },
  });

  const handleCreateAdmin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Please enter an email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      toast.error("The password must contain at least 8 characters.");
      return;
    }

    createAdminMutation.mutate({
      email: normalizedEmail,
      password,
    });
  };

  const members = teamQuery.data ?? [];

  if (teamQuery.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 size={20} className="animate-spin" />
          Loading administrator team...
        </div>
      </div>
    );
  }

  if (teamQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />

          <div>
            <h2 className="font-semibold text-red-800">
              Could not load the administrator team
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-red-700">
              {teamQuery.error.message}
            </p>

            <p className="mt-2 text-xs leading-relaxed text-red-600">
              Make sure the admin-team Edge Function is deployed and that your
              signed-in account has permission to manage administrators.
            </p>

            <Button
              variant="outline"
              className="mt-4 border-red-200 bg-white text-red-700 hover:bg-red-100"
              onClick={() => teamQuery.refetch()}
            >
              <RefreshCw size={15} className="mr-2" />
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#B7792B]">
            <ShieldCheck size={14} />
            Access management
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#243653] sm:text-3xl">
            Team Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Manage the people who have administrative access to Corporate Tax
            Bangladesh.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => teamQuery.refetch()}
          disabled={teamQuery.isFetching}
          className="h-10 border-slate-200 bg-white text-slate-600"
        >
          <RefreshCw
            size={15}
            className={`mr-2 ${teamQuery.isFetching ? "animate-spin" : ""}`}
          />
          Refresh team
        </Button>
      </div>

      {/* Access notice */}
      <div className="flex items-start gap-3 rounded-xl border border-[#B7792B]/20 bg-[#B7792B]/[0.06] p-4">
        <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#B7792B]" />

        <div>
          <h2 className="text-sm font-semibold text-[#243653]">
            Administrator-only access
          </h2>

          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Only an authorized main administrator should be able to create
            additional administrator accounts. New administrators receive
            access to the admin dashboard, subject to the permissions enforced
            by your backend.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total administrators
            </p>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#243653]/[0.07] text-[#243653]">
              <Users size={19} />
            </div>
          </div>

          <p className="mt-3 text-3xl font-bold tabular-nums text-[#243653]">
            {members.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Accounts with administrative access
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Main administrators
            </p>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#B7792B]/10 text-[#B7792B]">
              <ShieldCheck size={19} />
            </div>
          </div>

          <p className="mt-3 text-3xl font-bold tabular-nums text-[#243653]">
            {members.filter((member) => member.role === "main_admin").length}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Accounts authorized to manage the team
          </p>
        </div>
      </div>

      {/* Create administrator */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#243653]/[0.07] text-[#243653]">
            <UserPlus size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-[#243653]">
              Add an administrator
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create a new account for someone who needs access to the admin
              dashboard.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateAdmin} className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="admin-email"
                className="text-sm font-medium text-slate-700"
              >
                Administrator email
              </Label>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  maxLength={255}
                  required
                  className="h-11 border-slate-200 pl-9 text-sm focus-visible:ring-[#B7792B]/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="admin-password"
                className="text-sm font-medium text-slate-700"
              >
                Temporary password
              </Label>

              <div className="relative">
                <LockKeyhole
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  maxLength={72}
                  required
                  className="h-11 border-slate-200 px-9 pr-10 text-sm focus-visible:ring-[#B7792B]/30"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Use a unique password. Share it securely with the new
                administrator.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0 text-[#B7792B]"
              />
              <span>
                The new account will be created with the Administrator role,
                not Main administrator.
              </span>
            </div>

            <Button
              type="submit"
              disabled={
                createAdminMutation.isPending ||
                !email.trim() ||
                password.length < 8
              }
              className="h-10 shrink-0 bg-[#243653] px-5 text-white hover:bg-[#1b2940]"
            >
              {createAdminMutation.isPending ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <UserPlus size={16} className="mr-2" />
              )}
              Create administrator
            </Button>
          </div>
        </form>
      </section>

      {/* Team member list */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-semibold text-[#243653]">
              Administrator accounts
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Accounts currently registered for dashboard access.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
            <Users size={14} />
            {members.length} members
          </span>
        </div>

        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Users size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-[#243653]">
              No administrator accounts found
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              Once administrator accounts are registered, they will appear
              here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col justify-between gap-4 px-5 py-4 sm:flex-row sm:items-center sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#243653]/[0.07] text-sm font-semibold uppercase text-[#243653]">
                    {member.email?.charAt(0) || "A"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#243653]">
                      {member.email}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <AdminRoleBadge role={member.role} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 pl-14 text-xs text-slate-500 sm:pl-0">
                  <div>
                    <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                      <CalendarDays size={13} />
                      Created
                    </div>
                    <p className="font-medium text-slate-600">
                      {formatDate(member.created_at)}
                    </p>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                      <CheckCircle2 size={13} />
                      Last sign-in
                    </div>
                    <p className="font-medium text-slate-600">
                      {formatDate(member.last_sign_in_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Security footer */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-slate-500" />

        <div>
          <h3 className="text-sm font-semibold text-[#243653]">
            Security and account permissions
          </h3>

          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Administrator creation and team listing must be authorized by the
            server. Never expose your Supabase service-role key in frontend
            code. Only your designated main administrator should be allowed
            to create additional administrators.
          </p>
        </div>
      </div>
    </div>
  );
}
