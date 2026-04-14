import { Building2, Activity } from 'lucide-react';

const CORRIDOR_LABELS = {
  dehu_solapur: 'Dehu Rd → Solapur Rd',
  kolhapur_nashik: 'Kolhapur Rd → Nashik Rd',
};

export default function Header() {
  return (
    <header className="relative z-20">
      {/* Top gradient line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-brand-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5">
          {/* Logo */}
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-neon group-hover:shadow-lg transition-shadow duration-300">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-500 border-2 border-surface-950 animate-pulse" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight">
                <span className="text-white">Pune </span>
                <span className="gradient-text-brand">EstateLens</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-surface-500 font-medium flex items-center gap-1">
                <Activity className="w-2.5 h-2.5" />
                AI-Powered Valuations
              </p>
            </div>
          </div>

          {/* Removed Corridor Toggle here */}
        </div>
      </div>

      {/* Bottom subtle border */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </header>
  );
}
