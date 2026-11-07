import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCatalog } from "@/lib/catalog-data";
import { courses, COURSE_PREFIX } from "@/content/catalog";
import { makeInquirySchema, type InquiryInput } from "@/lib/inquiry-schema";
import { submitInquiry } from "@/lib/inquiry.functions";

const TRAINING = "training";

export function InquiryForm({ defaultService = "", title = "Your consultation request" }: { defaultService?: string; title?: string }) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef<string | null>(null);
  const send = useServerFn(submitInquiry);
  const catalog = useCatalog();

  const groups = useMemo(() => [
    ...catalog.map((c) => ({ value: c.slug, label: c.title, options: c.services.map((s) => ({ value: s.slug, label: s.title })) })),
    { value: TRAINING, label: "Training & Courses", options: courses.map((c) => ({ value: COURSE_PREFIX + c.slug, label: c.title })) },
  ], [catalog]);
  const allowed = groups.flatMap((g) => g.options.map((o) => o.value));
  const initialGroup = groups.find((g) => g.options.some((o) => o.value === defaultService))?.value ?? "";
  const [group, setGroup] = useState(initialGroup);

  const form = useForm<InquiryInput>({ resolver: zodResolver(makeInquirySchema(allowed)), defaultValues: {
    fullName: "", email: "", phone: "", country: "Bangladesh", contactMethod: "email", clientCategory: "individual",
    serviceSlug: initialGroup ? defaultService : "", preferredTime: "", preferredDate: "", message: "", language: "english", consent: false, website: "",
  } });

  async function onSubmit(values: InquiryInput) {
    setError(null);
    requestId.current ??= crypto.randomUUID();
    try {
      const result = await send({ data: { ...values, id: requestId.current } });
      if (!result.success) { setError(result.message); return; }
      setSuccess(true);
      form.reset();
    } catch {
      setError("Your request could not be confirmed. Please try again. Your details are still here.");
    }
  }

  if (success) return (
    <div role="status" className="space-y-5 py-6">
      <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden />
      <h2 className="text-2xl font-semibold">Your request has been received</h2>
      <p className="text-muted-foreground">Your enquiry has been saved for review. A consultation or enrolment is not confirmed until separately agreed.</p>
      <Button variant="outline" onClick={() => { requestId.current = null; setSuccess(false); }}>Send another enquiry</Button>
    </div>
  );

  const options = groups.find((g) => g.value === group)?.options ?? [];
  const selectCls = "h-auto min-h-11 whitespace-normal text-left [&>span]:line-clamp-none";
  const simpleSelects = [
    { name: "clientCategory" as const, label: "Individual or business", options: [{ value: "individual", label: "Individual" }, { value: "business", label: "Business" }, { value: "other", label: "Other" }] },
    { name: "contactMethod" as const, label: "Preferred contact method", options: [{ value: "email", label: "Email" }, { value: "phone", label: "Phone" }, { value: "whatsapp", label: "WhatsApp" }] },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-8">
        <div className="border-b pb-5">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">All fields are required except the preferred consultation date.</p>
        </div>
        <fieldset disabled={form.formState.isSubmitting} className="grid min-w-0 gap-6 sm:grid-cols-2">
          {([{ name: "fullName", label: "Full name", type: "text", autoComplete: "name", max: 100 }, { name: "email", label: "Email address", type: "email", autoComplete: "email", max: 255 }, { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel", max: 30 }, { name: "country", label: "Country", type: "text", autoComplete: "country-name", max: 80 }] as const).map((item) => (
            <FormField key={item.name} control={form.control} name={item.name} render={({ field }) => <FormItem className={item.name === "fullName" ? "sm:col-span-2" : ""}><FormLabel>{item.label}</FormLabel><FormControl><Input {...field} type={item.type} autoComplete={item.autoComplete} maxLength={item.max} className="h-11" /></FormControl><FormMessage /></FormItem>} />
          ))}
          <div className="min-w-0 space-y-2">
            <Label htmlFor="service-category">Service category</Label>
            <Select value={group} onValueChange={(v) => { setGroup(v); form.setValue("serviceSlug", ""); }} disabled={form.formState.isSubmitting}>
              <SelectTrigger id="service-category" className={selectCls}><SelectValue placeholder="Choose a category" /></SelectTrigger>
              <SelectContent>{groups.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <FormField control={form.control} name="serviceSlug" render={({ field }) => (
            <FormItem className="min-w-0"><FormLabel>Specific service</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!group || form.formState.isSubmitting}><FormControl><SelectTrigger className={selectCls}><SelectValue placeholder={group ? "Choose a service" : "Choose a category first"} /></SelectTrigger></FormControl><SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
          )} />
          {simpleSelects.map((item) => <FormField key={item.name} control={form.control} name={item.name} render={({ field }) => (
            <FormItem className="min-w-0"><FormLabel>{item.label}</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={form.formState.isSubmitting}><FormControl><SelectTrigger className={selectCls}><SelectValue /></SelectTrigger></FormControl><SelectContent>{item.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
          )} />)}
          <FormField control={form.control} name="preferredDate" render={({ field }) => <FormItem><FormLabel>Preferred consultation date (optional)</FormLabel><FormControl><Input {...field} type="date" min={new Date().toISOString().slice(0, 10)} className="h-11" /></FormControl><FormMessage /></FormItem>} />
          <FormField control={form.control} name="message" render={({ field }) => <FormItem className="sm:col-span-2"><FormLabel>Message</FormLabel><FormControl><Textarea {...field} maxLength={1500} rows={5} /></FormControl><p className="text-sm text-muted-foreground">Do not include national ID numbers, bank details, tax documents, or passwords.</p><FormMessage /></FormItem>} />
          <div hidden aria-hidden><label htmlFor="inquiry-website">Website</label><input id="inquiry-website" tabIndex={-1} autoComplete="off" {...form.register("website")} /></div>
          <FormField control={form.control} name="consent" render={({ field }) => <FormItem className="sm:col-span-2"><div className="flex items-start gap-3"><FormControl><Checkbox checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} className="mt-1" /></FormControl><FormLabel className="font-normal leading-relaxed">I agree to be contacted about this enquiry and have read the <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>.</FormLabel></div><FormMessage /></FormItem>} />
        </fieldset>
        {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}
        <div className="space-y-4 border-t pt-6">
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="h-12 w-full sm:w-auto">{form.formState.isSubmitting ? <><LoaderCircle className="animate-spin motion-reduce:animate-none" /> Sending…</> : <>Submit enquiry <ArrowRight /></>}</Button>
          <p className="flex gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-5 w-5 shrink-0 text-gold" aria-hidden />No financial documents or uploads are requested.</p>
        </div>
      </form>
    </Form>
  );
}
