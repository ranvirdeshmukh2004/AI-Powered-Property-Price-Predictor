import { ExternalLink, Cpu, Database, BarChart3 } from 'lucide-react';

const REPO_URL = 'https://github.com/ranvirdeshmukh2004/AI-Powered-Property-Price-Predictor';

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
          {/* Left — Disclaimer */}
          <div className="text-center md:text-left">
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

          {/* Right — GitHub CTA + Copyright */}
          <div className="flex items-center gap-4">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-800/60 border border-surface-700 hover:border-brand-500/50 hover:bg-surface-700/60 text-surface-300 hover:text-brand-400 transition-all duration-300 text-xs font-medium group"
            >
              <ExternalLink className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              Check out the entire repo →
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
