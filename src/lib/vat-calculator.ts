export type VatMode = "exclusive" | "inclusive";

/** Arithmetic estimate only: the caller supplies the applicable VAT rate. */
export function calculateVat(amount: number, rate: number, mode: VatMode) {
  if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(rate) || rate < 0 || rate > 100) {
    throw new Error("Enter a valid amount and a VAT rate between 0 and 100.");
  }
  const net = mode === "inclusive" ? amount / (1 + rate / 100) : amount;
  const total = mode === "inclusive" ? amount : amount * (1 + rate / 100);
  if (!Number.isFinite(total)) throw new Error("The amount is too large to calculate.");
  return { net, vat: total - net, total };
}