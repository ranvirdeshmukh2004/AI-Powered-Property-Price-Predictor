import { GitCompare } from 'lucide-react';
import PredictionForm from '../components/PredictionForm';
import { useState, useEffect } from 'react';
import { fetchMeta, predictPrice } from '../api';

export default function ComparePage() {
  const [meta, setMeta] = useState(null);
  const [corridorA, setCorridorA] = useState('dehu_solapur');
  const [corridorB, setCorridorB] = useState('kolhapur_nashik');
  
  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  
  const [isLoadingA, setIsLoadingA] = useState(false);
  const [isLoadingB, setIsLoadingB] = useState(false);

  useEffect(() => {
    fetchMeta().then(setMeta).catch(console.error);
  }, []);

  const handlePredictA = async (data) => {
    setIsLoadingA(true);
    try {
      const pred = await predictPrice(data);
      setResultA(pred);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingA(false);
    }
  };

  const handlePredictB = async (data) => {
    setIsLoadingB(true);
    try {
      const pred = await predictPrice(data);
      setResultB(pred);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingB(false);
    }
  };

  const localitiesA = meta?.localities?.[corridorA] || [];
  const localitiesB = meta?.localities?.[corridorB] || [];

  return (
    <div className="animate-fade-in pb-16">
      <div className="mb-6">
        <h2 className="section-title flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-brand-400" />
          Compare Properties
        </h2>
        <p className="section-subtitle">
          Configure two different properties across any location and compare their valuations side-by-side.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {/* VS Badge */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-surface-900 border border-white/10 rounded-full items-center justify-center font-bold text-brand-400 z-10 shadow-xl">
          VS
        </div>

        {/* Property A */}
        <div className="space-y-6">
          <div className="glass-card p-4 flex items-center justify-between border-b-4 border-b-brand-500">
            <h3 className="font-bold">Property A</h3>
            <select 
              value={corridorA}
              onChange={(e) => setCorridorA(e.target.value)}
              className="bg-surface-800 text-xs px-2 py-1 rounded border border-white/10"
            >
              <option value="dehu_solapur">Dehu → Solapur</option>
              <option value="kolhapur_nashik">Kolhapur → Nashik</option>
            </select>
          </div>
          
          <PredictionForm
            corridor={corridorA}
            localities={localitiesA}
            onPredict={handlePredictA}
            isLoading={isLoadingA}
          />
          
          {resultA && (
             <div className="glass-card p-6 animate-fade-in-up border border-brand-500/30">
               <div className="text-surface-400 text-sm mb-1">{resultA.locality}</div>
               <div className="text-3xl font-bold text-white mb-2">₹ {resultA.predicted_price_lakhs} <span className="text-base text-surface-400">Lakhs</span></div>
               <div className="flex gap-4 text-xs font-medium">
                 <div className="bg-surface-800 px-2 py-1 rounded">₹{resultA.price_per_sqft}/sq.ft</div>
                 <div className="bg-brand-500/10 text-brand-400 px-2 py-1 rounded">{resultA.confidence_band.low}L - {resultA.confidence_band.high}L</div>
               </div>
             </div>
          )}
        </div>

        {/* Property B */}
        <div className="space-y-6">
          <div className="glass-card p-4 flex items-center justify-between border-b-4 border-b-accent-500">
            <h3 className="font-bold">Property B</h3>
            <select 
              value={corridorB}
              onChange={(e) => setCorridorB(e.target.value)}
              className="bg-surface-800 text-xs px-2 py-1 rounded border border-white/10"
            >
               <option value="dehu_solapur">Dehu → Solapur</option>
              <option value="kolhapur_nashik">Kolhapur → Nashik</option>
            </select>
          </div>
          
          <PredictionForm
            corridor={corridorB}
            localities={localitiesB}
            onPredict={handlePredictB}
            isLoading={isLoadingB}
          />
          
          {resultB && (
             <div className="glass-card p-6 animate-fade-in-up border border-accent-500/30">
               <div className="text-surface-400 text-sm mb-1">{resultB.locality}</div>
               <div className="text-3xl font-bold text-white mb-2">₹ {resultB.predicted_price_lakhs} <span className="text-base text-surface-400">Lakhs</span></div>
               <div className="flex gap-4 text-xs font-medium">
                 <div className="bg-surface-800 px-2 py-1 rounded">₹{resultB.price_per_sqft}/sq.ft</div>
                 <div className="bg-accent-500/10 text-accent-400 px-2 py-1 rounded">{resultB.confidence_band.low}L - {resultB.confidence_band.high}L</div>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
