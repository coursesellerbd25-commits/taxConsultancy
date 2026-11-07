export type ProfessionalStatistic = {
  id: "experience" | "clients" | "filings" | "areas";
  label: string;
  /** Set only after the owner confirms the statistic; null shows a placeholder. */
  value: number | null;
};

export const professionalStatistics: ProfessionalStatistic[] = [
  { id: "experience", label: "Years of Professional Experience", value: null },
  { id: "clients", label: "Clients Served", value: null },
  { id: "filings", label: "Tax Returns & Compliance Filings", value: null },
  { id: "areas", label: "Professional Service Areas", value: null },
];

/** Invalid or unconfirmed values must never appear as achievements. */
export function verifiedStatisticValue(value: number | null): number | null {
  return value !== null && Number.isSafeInteger(value) && value >= 0 ? value : null;
}