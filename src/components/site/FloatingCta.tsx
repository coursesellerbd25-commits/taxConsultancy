import { Link, useLocation } from "@tanstack/react-router";
import { MessageSquareText } from "lucide-react";

export function FloatingCta() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/consultation")) return null;
  return (
    <Link to="/consultation" className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-navy-deep shadow-lg transition-transform hover:-translate-y-0.5 motion-reduce:transition-none">
      <MessageSquareText className="h-4 w-4" aria-hidden /> Get a consultation
    </Link>
  );
}
