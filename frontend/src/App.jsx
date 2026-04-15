import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Map, GitCompare, Database, History } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import PredictPage from './pages/PredictPage';
import MapPage from './pages/MapPage';
import ComparePage from './pages/ComparePage';
import AdminPage from './pages/AdminPage';

import HistoryPage from './pages/HistoryPage';

function Navigation() {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Valuation', icon: Home },
    { path: '/map', label: 'Map View', icon: Map },

    { path: '/compare', label: 'Compare', icon: GitCompare },
    { path: '/history', label: 'History', icon: History },
    { path: '/admin', label: 'Data & Model', icon: Database },
  ];

  return (
    <div className="flex justify-center mb-8 animate-fade-in">
      <nav className="glass-card p-1.5 flex gap-2 rounded-2xl">
        {links.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
              ${location.pathname === path 
                ? 'bg-brand-500/15 text-brand-400 shadow-[0_0_15px_rgba(239,171,15,0.15)] border border-brand-500/30' 
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50 border border-transparent'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function Hero() {
  const scrollToContent = () => {
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: '🧠',
      title: 'XGBoost ML Engine',
      desc: 'Trained on 2,000+ Pune property records with 13 features — delivers R² 0.90 accuracy in under 50ms.',
    },
    {
      icon: '📍',
      title: '13 Localities Covered',
      desc: 'Spanning two major growth corridors — Dehu Road to Solapur Road & Kolhapur Road to Nashik Road.',
    },
    {
      icon: '📊',
      title: 'Market Intelligence',
      desc: 'Interactive charts, amenity impact analysis, corridor comparisons, and historical prediction tracking.',
    },
    {
      icon: '☁️',
      title: 'Cloud-Native Stack',
      desc: 'FastAPI backend on Render, React frontend on Vercel, predictions persisted to MongoDB Atlas.',
    },
  ];

  const stats = [
    { value: '2,000+', label: 'Training Records' },
    { value: '13', label: 'Localities' },
    { value: '90%', label: 'Model Accuracy (R²)' },
    { value: '<50ms', label: 'Prediction Latency' },
  ];

  const steps = [
    { num: '01', title: 'Select Location', desc: 'Choose a growth corridor and locality from Pune\'s key investment zones.' },
    { num: '02', title: 'Configure Property', desc: 'Set BHK, area, floor, bathrooms, and toggle amenities like gym, parking, pool.' },
    { num: '03', title: 'Get AI Valuation', desc: 'Receive an instant price prediction in ₹ Lakhs with a confidence interval.' },
  ];

  return (
    <div className="relative w-full overflow-hidden">
      {/* ── Section 1: Hero Banner ── */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: 'url(/hero-bg.png)' }}
        >
          <div className="absolute inset-0 bg-surface-950/85 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-surface-950 via-transparent to-transparent opacity-80"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center py-20">
          <div className="inline-block mb-5 px-4 py-1.5 rounded-full border border-brand-500/25 bg-brand-500/8 backdrop-blur-sm">
            <span className="text-brand-400 text-xs font-semibold tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>AI-Powered Property Intelligence</span>
          </div>
          
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Know What Your Property <br className="hidden sm:block" />
            Is <span className="gradient-text-brand">Actually Worth</span>
          </h1>
          
          <p className="text-surface-300 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-4" style={{ fontWeight: 400 }}>
            Pune EstateLens uses a production-grade XGBoost machine learning model to deliver instant, 
            data-driven property valuations across Pune's two fastest-growing real estate corridors.
          </p>
          
          <p className="text-surface-500 text-sm max-w-2xl mx-auto leading-relaxed mb-10">
            Built as a full-stack AI product — from synthetic data generation and model training 
            to cloud deployment with MongoDB persistence and interactive data visualization.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button 
              onClick={scrollToContent} 
              className="btn-primary text-base px-8 py-4 gap-2 rounded-2xl"
            >
              Start Valuation
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
            <a 
              href="https://estatelens-backend.onrender.com/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary text-sm px-6 py-3.5 rounded-2xl gap-2"
            >
              View API Docs
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">{value}</div>
                <div className="text-[11px] uppercase tracking-widest text-surface-500 mt-1 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <button 
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-surface-500 hover:text-brand-400 transition-colors flex flex-col items-center cursor-pointer group"
        >
          <span className="text-[9px] uppercase tracking-[0.2em] font-semibold mb-2 opacity-50 group-hover:opacity-100 transition-opacity">Scroll</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </button>
      </div>

      {/* ── Section 2: What It Does ── */}
      <div className="relative z-10 bg-surface-950 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-brand-400 text-xs font-semibold tracking-widest uppercase mb-3" style={{ letterSpacing: '0.15em' }}>Platform Capabilities</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              End-to-End Property Intelligence
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto text-base leading-relaxed">
              More than a price predictor — EstateLens is a complete analytics platform 
              for understanding Pune's real estate market dynamics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon, title, desc }) => (
              <div 
                key={title} 
                className="group p-6 rounded-2xl border border-white/[0.06] bg-surface-900/40 hover:bg-surface-900/70 hover:border-white/[0.1] transition-all duration-300"
              >
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-display text-base font-bold text-white mb-2 tracking-tight">{title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 3: How It Works ── */}
      <div className="relative z-10 bg-surface-950 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-brand-400 text-xs font-semibold tracking-widest uppercase mb-3" style={{ letterSpacing: '0.15em' }}>How It Works</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Three Steps to a Valuation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ num, title, desc }, i) => (
              <div key={num} className="relative">
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%+1rem)] w-[calc(100%-2rem)] h-px bg-gradient-to-r from-brand-500/30 to-transparent" style={{ left: 'calc(50% + 2rem)', width: 'calc(100% - 4rem)' }}></div>
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-5">
                    <span className="font-display text-2xl font-bold text-brand-400">{num}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-surface-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <button 
              onClick={scrollToContent} 
              className="btn-primary text-sm px-8 py-3.5 rounded-2xl gap-2"
            >
              Try It Now — Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-mesh flex flex-col relative w-full">
      {isHome && <Hero />}
      
      {/* 
        If it is the home page, the user has to scroll down to see this part. 
        If it's not the home page, this is just at the top of the screen.
      */}
      <div id="main-content" className="flex flex-col min-h-screen w-full relative z-10 bg-mesh">
        <div className="sticky top-0 z-50 bg-surface-950/90 backdrop-blur-xl shadow-2xl pb-2">
          <Header />
        </div>
        
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
          <Navigation />
          
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<PredictPage />} />
              <Route path="/map" element={<MapPage />} />

              <Route path="/compare" element={<ComparePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
