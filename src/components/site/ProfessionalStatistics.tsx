import { useEffect, useRef, useState } from "react";
import { BriefcaseBusiness, CalendarCheck, Files, UsersRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { professionalStatistics, verifiedStatisticValue } from "@/content/statistics";

const icons = {
  experience: CalendarCheck,
  clients: UsersRound,
  filings: Files,
  areas: BriefcaseBusiness,
};

function StatisticValue({ value, entered }: { value: number | null; entered: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === null || !entered) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    let started: number | undefined;
    const tick = (time: number) => {
      started ??= time;
      const progress = Math.min((time - started) / 1100, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, entered]);

  return (
    <div className="flex h-16 items-center justify-center font-serif text-4xl font-semibold tabular-nums text-primary md:text-5xl">
      <span aria-hidden="true">{value === null ? "—" : display.toLocaleString("en-US")}</span>
      <span className="sr-only">{value === null ? "Awaiting verified figure" : value.toLocaleString("en-US")}</span>
    </div>
  );
}

export function ProfessionalStatistics() {
  const sectionRef = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (!("IntersectionObserver" in window)) {
      setEntered(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setEntered(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} aria-label="Professional statistics and achievements" className="border-b bg-surface py-8 md:py-10">
      <div className="container-page grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {professionalStatistics.map((statistic) => {
          const Icon = icons[statistic.id];
          const value = verifiedStatisticValue(statistic.value);
          return (
            <Card key={statistic.id} className="flex flex-col items-center rounded-md border-t-2 border-t-gold px-3 py-5 text-center shadow-sm md:px-5 md:py-6">
              <Icon className="mb-3 h-6 w-6 text-gold" strokeWidth={1.5} aria-hidden="true" />
              <StatisticValue value={value} entered={entered} />
              <p className="mt-2 flex min-h-14 items-center justify-center text-sm font-medium leading-5 text-primary">{statistic.label}</p>
              {value === null && <p className="mt-2 text-xs text-muted-foreground">Awaiting verified figure</p>}
            </Card>
          );
        })}
      </div>
    </section>
  );
}