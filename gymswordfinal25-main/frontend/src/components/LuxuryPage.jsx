import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function LuxuryPage({ title, breadcrumbs, children }) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-14 py-8 md:py-14">
      {breadcrumbs && (
        <nav className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-black/40 mb-6">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {b.to ? <Link to={b.to} className="hover:text-black transition-colors">{b.label}</Link> : <span className="text-black font-semibold">{b.label}</span>}
              {i < breadcrumbs.length - 1 && <ChevronRight size={9} />}
            </span>
          ))}
        </nav>
      )}
      <h1 className="font-display uppercase font-black text-3xl sm:text-4xl mb-8">{title}</h1>
      {children}
    </div>
  );
}
