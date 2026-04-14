import { useState, useEffect } from 'react';
import PredictionForm from '../components/PredictionForm';
import PredictionResult from '../components/PredictionResult';
import Dashboard from '../components/Dashboard';
import { fetchMeta, predictPrice } from '../api';
import { AlertTriangle, RefreshCw, Wifi } from 'lucide-react';

export default function PredictPage() {
  const queryParams = new URLSearchParams(window.location.search);
  const initialCorridor = queryParams.get('corridor') || 'dehu_solapur';
  
  const [corridor, setCorridor] = useState(initialCorridor);
  const [meta, setMeta] = useState(null);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('loading'); // 'loading' | 'connected' | 'error'

  // Load model metadata on mount
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const data = await fetchMeta();
        setMeta(data);
        setServerStatus('connected');
      } catch (err) {
        console.error('Failed to load metadata:', err);
        setServerStatus('error');
        setError('Cannot connect to the prediction server. Please start the backend.');
      }
    };
    loadMeta();
  }, []);

  const handlePredict = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const prediction = await predictPrice(data);
      setResult(prediction);
      setFormData(data);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const localities = meta?.localities?.[corridor] || [];

  return (
    <div className="w-full flex-1">
      {/* Connection Status Banner */}
      {serverStatus === 'error' && (
        <div className="mb-6 glass-card border-red-500/20 p-4 flex items-center gap-3 animate-fade-in-down">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-300 text-sm font-medium">Backend not connected</p>
            <p className="text-surface-400 text-xs mt-0.5">
              Run <code className="text-brand-300 bg-surface-800 px-1.5 py-0.5 rounded text-[11px]">cd backend && uvicorn main:app --reload</code> to start the server
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary py-1.5 px-3 text-xs gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {serverStatus === 'connected' && (
        <div className="mb-6 flex items-center gap-2 animate-fade-in">
          <Wifi className="w-3.5 h-3.5 text-accent-500" />
          <span className="text-xs text-accent-400 font-medium">AI Engine Connected</span>
          <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Property Configuration</h2>
          <p className="text-surface-400 text-sm">Select a growth corridor to begin valuation.</p>
        </div>
        
        {/* Corridor Toggle */}
        <div className="glass-card p-1.5 flex gap-1 rounded-xl">
          <button
            onClick={() => setCorridor('dehu_solapur')}
            className={`
              relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
              ${corridor === 'dehu_solapur'
                ? 'bg-brand-600 text-white shadow-[0_0_15px_rgba(239,171,15,0.2)]'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
              }
            `}
          >
            {corridor === 'dehu_solapur' && <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 -z-10" />}
            Dehu Rd → Solapur Rd
          </button>
          <button
            onClick={() => setCorridor('kolhapur_nashik')}
            className={`
              relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
              ${corridor === 'kolhapur_nashik'
                ? 'bg-brand-600 text-white shadow-[0_0_15px_rgba(239,171,15,0.2)]'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
              }
            `}
          >
            {corridor === 'kolhapur_nashik' && <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 -z-10" />}
            Kolhapur Rd → Nashik Rd
          </button>
        </div>
      </div>

      {/* Main Grid — Form + Results */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
        <PredictionForm
          corridor={corridor}
          localities={localities}
          onPredict={handlePredict}
          isLoading={isLoading}
        />

        <div>
          {/* Error display */}
          {error && !result && (
            <div className="glass-card border-red-500/20 p-6 animate-fade-in">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <p className="font-semibold text-sm">Prediction Error</p>
              </div>
              <p className="text-surface-400 text-sm">{error}</p>
            </div>
          )}

          {/* Placeholder when no result */}
          {!result && !error && (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-full min-h-[300px] animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 animate-float">
                <svg className="w-8 h-8 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-surface-300 font-medium mb-1">Configure your property</p>
              <p className="text-surface-500 text-sm max-w-xs">
                Fill in the property details on the left and click
                <span className="text-brand-400"> &quot;Get AI Valuation&quot; </span>
                to see the predicted price.
              </p>
            </div>
          )}

          {/* Result */}
          {result && (
            <PredictionResult result={result} formData={formData} />
          )}
        </div>
      </section>

      {/* Dashboard Section */}
      {serverStatus === 'connected' && (
        <section id="dashboard-section" className="mb-16">
          <Dashboard />
        </section>
      )}


    </div>
  );
}
