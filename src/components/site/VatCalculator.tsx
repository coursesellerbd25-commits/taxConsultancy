import { useState, type FormEvent } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateVat, type VatMode } from "@/lib/vat-calculator";

const money = (value: number) => new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", currencyDisplay: "code" }).format(value);

export function VatCalculator() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [mode, setMode] = useState<VatMode>("exclusive");
  const [result, setResult] = useState<ReturnType<typeof calculateVat> | null>(null);
  const [error, setError] = useState("");
  function calculate(event: FormEvent) {
    event.preventDefault();
    try {
      if (!amount.trim() || !rate.trim()) throw new Error("Enter an amount and VAT rate.");
      setResult(calculateVat(Number(amount), Number(rate), mode));
      setError("");
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Please check your inputs.");
    }
  }
  function clearResult() { setResult(null); setError(""); }
  return (
    <section id="vat-calculator" className="scroll-mt-40 border-b bg-surface py-14 md:py-16">
      <div className="container-page grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <Calculator className="h-8 w-8 text-gold" aria-hidden />
          <p className="eyebrow mt-5">VAT estimate</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">VAT Calculator</h2>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">Estimates only, not tax advice. VAT rates vary by goods, services and applicable rules. Confirm your rate with NBR or a qualified adviser.</p>
        </div>
        <div className="rounded-md border bg-card p-5 md:p-8">
          <Tabs value={mode} onValueChange={(value) => { if (value === "inclusive" || value === "exclusive") { setMode(value); clearResult(); } }}>
            <TabsList className="grid h-10 w-full grid-cols-2">
              <TabsTrigger value="exclusive">Add VAT</TabsTrigger>
              <TabsTrigger value="inclusive">VAT included</TabsTrigger>
            </TabsList>
          </Tabs>
          <form onSubmit={calculate} className="mt-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vat-amount">{mode === "inclusive" ? "Total including VAT (BDT)" : "Amount before VAT (BDT)"}</Label>
                <Input id="vat-amount" type="number" inputMode="decimal" min="0" step="0.01" required placeholder="Enter amount" value={amount} onChange={(e) => { setAmount(e.target.value); clearResult(); }} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat-rate">VAT rate (%)</Label>
                <Input id="vat-rate" type="number" inputMode="decimal" min="0" max="100" step="any" required placeholder="Enter applicable rate" value={rate} onChange={(e) => { setRate(e.target.value); clearResult(); }} className="h-11" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button type="submit"><Calculator className="h-4 w-4" />Calculate</Button>
              <Button type="button" variant="outline" onClick={() => { setAmount(""); setRate(""); setMode("exclusive"); clearResult(); }}><RotateCcw className="h-4 w-4" />Reset</Button>
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
          </form>
          <div aria-live="polite" aria-atomic="true" className="mt-6 min-h-24 border-t pt-5">
            <dl className="grid gap-4 sm:grid-cols-3">
              {([["Net amount", result?.net], ["VAT amount", result?.vat], ["Total including VAT", result?.total]] as const).map(([label, value]) => (
                <div key={label} className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-2 break-words text-lg font-semibold text-primary">{value === undefined ? "—" : money(value)}</dd></div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}