import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Map, GitCompare, Database, Camera, History } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import PredictPage from './pages/PredictPage';
import MapPage from './pages/MapPage';
import ComparePage from './pages/ComparePage';
import AdminPage from './pages/AdminPage';
import AestheticsPage from './pages/AestheticsPage';
import HistoryPage from './pages/HistoryPage';

function Navigation() {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Valuation', icon: Home },
    { path: '/map', label: 'Map View', icon: Map },
    { path: '/aesthetics', label: 'Aesthetics', icon: Camera },
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

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url(/hero-bg.png)' }}
      >
        <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950 via-transparent to-transparent opacity-80"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 animate-fade-in-up">
        <div className="inline-block mb-3 px-3 py-1 rounded-full border border-brand-500/30 bg-brand-500/10 backdrop-blur-sm shadow-[0_0_15px_rgba(239,171,15,0.15)]">
          <span className="text-brand-400 text-xs font-bold tracking-wider uppercase">Enterprise Grade Valuation Engine</span>
        </div>
        <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight mb-4 drop-shadow-2xl">
          Pune <span className="gradient-text-brand">EstateLens</span>
        </h2>
        <p className="text-surface-300 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed drop-shadow-md">
          Prop-tech artificial intelligence powered by over 2,000 real-world metrics to calculate exact property values across Pune's rapidly expanding corridors.
        </p>
      </div>

      {/* Scroll Down Indicator */}
      <button 
        onClick={scrollToContent}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-surface-400 hover:text-brand-400 transition-colors flex flex-col items-center animate-bounce cursor-pointer group"
      >
        <span className="text-[10px] uppercase tracking-widest font-semibold mb-2 opacity-60 group-hover:opacity-100 transition-opacity">Explore Tools</span>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
      </button>
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
              <Route path="/aesthetics" element={<AestheticsPage />} />
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
