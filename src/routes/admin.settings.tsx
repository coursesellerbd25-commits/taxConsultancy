import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { siteDataQuery } from "@/lib/site-data";

export const Route = createFileRoute("/admin/settings")({ component: Settings });

const FIELDS = [
  { key: "business_name", label: "Business name", max: 120 },
  { key: "tagline", label: "Tagline", max: 120 },
  { key: "consultant_name", label: "Consultant name", max: 120 },
  { key: "contact_email", label: "Contact email", max: 255, type: "email" },
  { key: "contact_phone", label: "Contact phone", max: 30, type: "tel" },
  { key: "whatsapp_number", label: "WhatsApp number (digits with country code, e.g. 8801XXXXXXXXX)", max: 15 },
  { key: "whatsapp_message", label: "WhatsApp greeting message", max: 300 },
  { key: "office_address", label: "Office address", max: 300 },
  { key: "business_hours", label: "Business hours", max: 200 },
  { key: "biography", label: "Professional biography", max: 4000, multiline: true },
] as const;
type Key = (typeof FIELDS)[number]["key"];
type Values = Record<Key, string>;

function Settings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => (await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()).data,
  });
  const [values, setValues] = useState<Values | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (data !== undefined && !values) {
      setValues(Object.fromEntries(FIELDS.map((f) => [f.key, (data?.[f.key] as string | null) ?? ""])) as Values);
    }
  }, [data, values]);

  const save = useMutation({
    mutationFn: async (v: Values) => {
      const row = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x.trim() || null])) as Record<Key, string | null>;
      if (row.whatsapp_number) row.whatsapp_number = row.whatsapp_number.replace(/\D/g, "");
      if (row.whatsapp_number && !/^[0-9]{8,15}$/.test(row.whatsapp_number)) throw new Error("WhatsApp number must be 8–15 digits including the country code.");
      if (row.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.contact_email)) throw new Error("Enter a valid contact email.");
      const { error } = await supabase.from("site_settings").upsert({ id: 1, ...row, updated_at: new Date().toISOString() });
      if (error) throw new Error("Settings could not be saved. Please try again.");
    },
    onSuccess: () => { setError(null); toast.success("Website settings saved"); qc.invalidateQueries({ queryKey: siteDataQuery.queryKey }); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
    onError: (e: Error) => setError(e.message),
  });

  if (isLoading || !values) return <div className="flex justify-center p-10"><LoaderCircle className="animate-spin text-primary" aria-label="Loading" /></div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Website settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Leave a field empty to hide it on the website. Only enter confirmed details.</p>
      <form className="mt-6 space-y-5 rounded-md border bg-card p-6" onSubmit={(e) => { e.preventDefault(); save.mutate(values); }}>
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-2">
            <Label htmlFor={f.key}>{f.label}</Label>
            {"multiline" in f ? (
              <Textarea id={f.key} rows={6} maxLength={f.max} value={values[f.key]} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
            ) : (
              <Input id={f.key} type={"type" in f ? f.type : "text"} maxLength={f.max} value={values[f.key]} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
            )}
          </div>
        ))}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={save.isPending}>{save.isPending && <LoaderCircle className="animate-spin" />} Save settings</Button>
      </form>
    </div>
  );
}
