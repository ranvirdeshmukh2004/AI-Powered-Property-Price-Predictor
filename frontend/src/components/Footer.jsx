import { ExternalLink, Heart, Cpu, Database, BarChart3 } from 'lucide-react';

export default function Footer() {
  const techStack = [
    { icon: Cpu, label: 'XGBoost ML' },
    { icon: Database, label: 'FastAPI' },
    { icon: BarChart3, label: 'React + Vite' },
  ];

  return (
    <footer className="relative mt-20">
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left — Branding */}
          <div className="text-center md:text-left">
            <p className="text-surface-500 text-sm">
              Built with{' '}
              <Heart className="w-3.5 h-3.5 inline text-red-400 fill-red-400 mx-0.5" />{' '}
              for Pune&apos;s real estate market
            </p>
            <p className="text-surface-600 text-xs mt-1">
              Predictions are AI-generated estimates. Always consult a professional for investment decisions.
            </p>
          </div>

          {/* Center — Tech Stack */}
          <div className="flex items-center gap-4">
            {techStack.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-surface-500 text-xs"
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Right — Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-surface-500 hover:text-brand-400 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <span className="text-surface-600 text-xs">
              © {new Date().getFullYear()} EstateLens
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
