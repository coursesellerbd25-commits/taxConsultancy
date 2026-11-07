import { Building2, Calculator, FileBadge, Globe2, Percent, Receipt, Scale, ShieldCheck } from "lucide-react";
import type { Category } from "@/content/catalog";

const map = { receipt: Receipt, percent: Percent, building: Building2, calculator: Calculator, shield: ShieldCheck, globe: Globe2, file: FileBadge, scale: Scale };

export function CategoryIcon({ icon, className }: { icon: Category["icon"]; className?: string }) {
  const Icon = map[icon];
  return <Icon className={className} aria-hidden />;
}
