import { GitCompare, TrendingUp, TrendingDown, Minus, BarChart3, ArrowDownUp } from 'lucide-react';
import PredictionForm from '../components/PredictionForm';
import { useState, useEffect, useMemo } from 'react';
import { fetchMeta, predictPrice } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell } from 'recharts';

export default function ComparePage() {
  const [meta, setMeta] = useState(null);
  const [corridorA, setCorridorA] = useState('dehu_solapur');
  const [corridorB, setCorridorB] = useState('kolhapur_nashik');
  
  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [inputA, setInputA] = useState(null);
  const [inputB, setInputB] = useState(null);
  
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
      setInputA(data);
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
      setInputB(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingB(false);
    }
  };

  const localitiesA = meta?.localities?.[corridorA] || [];
  const localitiesB = meta?.localities?.[corridorB] || [];

  const hasBothResults = resultA && resultB;

  // Compute comparison data
  const comparisonData = useMemo(() => {
    if (!hasBothResults) return null;

    const diff = resultA.predicted_price_lakhs - resultB.predicted_price_lakhs;
    const avg = (resultA.predicted_price_lakhs + resultB.predicted_price_lakhs) / 2;
    const diffPct = avg > 0 ? ((diff / avg) * 100).toFixed(1) : 0;
    const cheaper = diff > 0 ? 'B' : diff < 0 ? 'A' : 'equal';

    return { diff: Math.abs(diff).toFixed(2), diffPct: Math.abs(diffPct), cheaper, rawDiff: diff };
  }, [resultA, resultB, hasBothResults]);

  // Bar chart data: side-by-side price comparison
  const priceBarData = useMemo(() => {
    if (!hasBothResults) return [];
    return [
      { name: 'Price (₹L)', A: resultA.predicted_price_lakhs, B: resultB.predicted_price_lakhs },
      { name: 'Per Sq.Ft (₹)', A: Math.round(resultA.price_per_sqft / 100), B: Math.round(resultB.price_per_sqft / 100) },
    ];
  }, [resultA, resultB, hasBothResults]);

  // Radar chart data: property feature comparison
  const radarData = useMemo(() => {
    if (!inputA || !inputB) return [];
    return [
      { feature: 'BHK', A: inputA.bhk, B: inputB.bhk, max: 4 },
      { feature: 'Area', A: inputA.sqft / 875, B: inputB.sqft / 875, max: 4 },
      { feature: 'Bathrooms', A: inputA.bathrooms, B: inputB.bathrooms, max: 4 },
      { feature: 'Floor', A: Math.min(inputA.floor / 6.25, 4), B: Math.min(inputB.floor / 6.25, 4), max: 4 },
      { feature: 'Amenities', A: (inputA.parking + inputA.gym + inputA.swimming_pool + inputA.garden + inputA.security + inputA.clubhouse) * (4/6), B: (inputB.parking + inputB.gym + inputB.swimming_pool + inputB.garden + inputB.security + inputB.clubhouse) * (4/6), max: 4 },
    ];
  }, [inputA, inputB]);

  // Breakdown data for the bar chart
  const breakdownData = useMemo(() => {
    if (!hasBothResults || !inputA || !inputB) return [];
    const amenitiesA = inputA.parking + inputA.gym + inputA.swimming_pool + inputA.garden + inputA.security + inputA.clubhouse;
    const amenitiesB = inputB.parking + inputB.gym + inputB.swimming_pool + inputB.garden + inputB.security + inputB.clubhouse;
    return [
      { factor: 'BHK', A: inputA.bhk, B: inputB.bhk },
      { factor: 'Area (sqft)', A: inputA.sqft, B: inputB.sqft },
      { factor: 'Floor', A: inputA.floor, B: inputB.floor },
      { factor: 'Bathrooms', A: inputA.bathrooms, B: inputB.bathrooms },
      { factor: 'Amenities', A: amenitiesA, B: amenitiesB },
    ];
  }, [hasBothResults, inputA, inputB]);

  const BRAND_COLOR = '#efab0f';
  const ACCENT_COLOR = '#10b981';

  const corridorLabel = (id) => id === 'dehu_solapur' ? 'Dehu → Solapur' : 'Kolhapur → Nashik';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-900 border border-white/10 rounded-lg p-3 shadow-xl text-xs">
          <p className="text-surface-300 font-semibold mb-1">{label}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color }} className="font-medium">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
            <h3 className="font-bold text-brand-400">Property A</h3>
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
               <div className="text-surface-400 text-sm mb-1">{resultA.locality} · {corridorLabel(corridorA)}</div>
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
            <h3 className="font-bold text-accent-400">Property B</h3>
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
               <div className="text-surface-400 text-sm mb-1">{resultB.locality} · {corridorLabel(corridorB)}</div>
               <div className="text-3xl font-bold text-white mb-2">₹ {resultB.predicted_price_lakhs} <span className="text-base text-surface-400">Lakhs</span></div>
               <div className="flex gap-4 text-xs font-medium">
                 <div className="bg-surface-800 px-2 py-1 rounded">₹{resultB.price_per_sqft}/sq.ft</div>
                 <div className="bg-accent-500/10 text-accent-400 px-2 py-1 rounded">{resultB.confidence_band.low}L - {resultB.confidence_band.high}L</div>
               </div>
             </div>
          )}
        </div>
      </div>

      {/* ── Comparison Visualizations ── */}
      {hasBothResults && comparisonData && (
        <div className="mt-12 space-y-8 animate-fade-in-up">
          
          {/* Summary Banner */}
          <div className="glass-card p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <ArrowDownUp className="w-5 h-5 text-brand-400" />
              <h3 className="font-display text-lg font-bold text-white">Comparison Summary</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price Difference */}
              <div className="bg-surface-800/50 rounded-xl p-4 text-center border border-white/5">
                <p className="text-surface-400 text-xs uppercase tracking-wider mb-2">Price Difference</p>
                <p className="text-2xl font-bold text-white">₹ {comparisonData.diff} L</p>
                <p className="text-sm mt-1" style={{ color: comparisonData.cheaper === 'A' ? BRAND_COLOR : ACCENT_COLOR }}>
                  Property {comparisonData.cheaper === 'A' ? 'A' : 'B'} is cheaper
                </p>
              </div>
              
              {/* Percentage Difference */}
              <div className="bg-surface-800/50 rounded-xl p-4 text-center border border-white/5">
                <p className="text-surface-400 text-xs uppercase tracking-wider mb-2">% Difference</p>
                <div className="flex items-center justify-center gap-2">
                  {comparisonData.rawDiff > 0 ? (
                    <TrendingUp className="w-5 h-5 text-red-400" />
                  ) : comparisonData.rawDiff < 0 ? (
                    <TrendingDown className="w-5 h-5 text-green-400" />
                  ) : (
                    <Minus className="w-5 h-5 text-surface-400" />
                  )}
                  <p className="text-2xl font-bold text-white">{comparisonData.diffPct}%</p>
                </div>
                <p className="text-xs text-surface-500 mt-1">A is {comparisonData.rawDiff > 0 ? 'costlier' : 'cheaper'} than B</p>
              </div>
              
              {/* Per Sq.Ft Comparison */}
              <div className="bg-surface-800/50 rounded-xl p-4 text-center border border-white/5">
                <p className="text-surface-400 text-xs uppercase tracking-wider mb-2">Rate Comparison</p>
                <div className="space-y-1">
                  <p className="text-sm"><span className="text-brand-400 font-bold">A:</span> <span className="text-white font-semibold">₹{resultA.price_per_sqft.toLocaleString()}</span> <span className="text-surface-500">/sqft</span></p>
                  <p className="text-sm"><span className="text-accent-400 font-bold">B:</span> <span className="text-white font-semibold">₹{resultB.price_per_sqft.toLocaleString()}</span> <span className="text-surface-500">/sqft</span></p>
                </div>
                <p className="text-xs text-surface-500 mt-1">
                  Δ ₹{Math.abs(resultA.price_per_sqft - resultB.price_per_sqft).toLocaleString()}/sqft
                </p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Price Bar Chart */}
            <div className="glass-card p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-brand-400" />
                <h3 className="font-display font-bold text-white">Price Comparison</h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: resultA.locality, price: resultA.predicted_price_lakhs, fill: BRAND_COLOR },
                    { name: resultB.locality, price: resultB.predicted_price_lakhs, fill: ACCENT_COLOR },
                  ]} barGap={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" tick={{ fill: '#999', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#999', fontSize: 12 }} label={{ value: '₹ Lakhs', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="price" name="Price (₹ Lakhs)" radius={[8, 8, 0, 0]} barSize={60}>
                      <Cell fill={BRAND_COLOR} />
                      <Cell fill={ACCENT_COLOR} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Confidence Band Overlap Visualization */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-surface-400 uppercase tracking-wider mb-3 font-semibold">Confidence Bands</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-brand-400 font-medium">Property A</span>
                      <span className="text-surface-500">{resultA.confidence_band.low}L — {resultA.confidence_band.high}L</span>
                    </div>
                    <div className="h-3 bg-surface-800 rounded-full relative overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          backgroundColor: BRAND_COLOR + '60',
                          width: `${Math.min(100, (resultA.predicted_price_lakhs / Math.max(resultA.confidence_band.high, resultB.confidence_band.high)) * 100)}%`,
                          border: `1px solid ${BRAND_COLOR}`
                        }} 
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-accent-400 font-medium">Property B</span>
                      <span className="text-surface-500">{resultB.confidence_band.low}L — {resultB.confidence_band.high}L</span>
                    </div>
                    <div className="h-3 bg-surface-800 rounded-full relative overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          backgroundColor: ACCENT_COLOR + '60',
                          width: `${Math.min(100, (resultB.predicted_price_lakhs / Math.max(resultA.confidence_band.high, resultB.confidence_band.high)) * 100)}%`,
                          border: `1px solid ${ACCENT_COLOR}`
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="glass-card p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <GitCompare className="w-5 h-5 text-brand-400" />
                <h3 className="font-display font-bold text-white">Feature Profile</h3>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="feature" tick={{ fill: '#999', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 4]} tick={false} axisLine={false} />
                    <Radar name="Property A" dataKey="A" stroke={BRAND_COLOR} fill={BRAND_COLOR} fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Property B" dataKey="B" stroke={ACCENT_COLOR} fill={ACCENT_COLOR} fillOpacity={0.2} strokeWidth={2} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: '#999' }} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-surface-500 text-center mt-2">
                Normalized property features — larger area means more value coverage
              </p>
            </div>
          </div>

          {/* Factor Breakdown Table */}
          <div className="glass-card p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-brand-400" />
              <h3 className="font-display font-bold text-white">Input Factor Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-surface-400 font-semibold">Factor</th>
                    <th className="text-center py-3 px-4 font-semibold" style={{ color: BRAND_COLOR }}>Property A</th>
                    <th className="text-center py-3 px-4 font-semibold" style={{ color: ACCENT_COLOR }}>Property B</th>
                    <th className="text-center py-3 px-4 text-surface-400 font-semibold">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5 hover:bg-surface-800/30 transition-colors">
                    <td className="py-3 px-4 text-surface-300">Corridor</td>
                    <td className="py-3 px-4 text-center text-white font-medium">{corridorLabel(corridorA)}</td>
                    <td className="py-3 px-4 text-center text-white font-medium">{corridorLabel(corridorB)}</td>
                    <td className="py-3 px-4 text-center text-surface-500 text-xs">
                      {corridorA !== corridorB ? '🔀 Different corridors affect base rates' : '✅ Same corridor'}
                    </td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-surface-800/30 transition-colors">
                    <td className="py-3 px-4 text-surface-300">Locality</td>
                    <td className="py-3 px-4 text-center text-white font-medium">{resultA.locality}</td>
                    <td className="py-3 px-4 text-center text-white font-medium">{resultB.locality}</td>
                    <td className="py-3 px-4 text-center text-surface-500 text-xs">
                      {resultA.locality !== resultB.locality ? '📍 Locality premium varies' : '✅ Same locality'}
                    </td>
                  </tr>
                  {breakdownData.map((row) => {
                    const diff = row.A - row.B;
                    return (
                      <tr key={row.factor} className="border-b border-white/5 hover:bg-surface-800/30 transition-colors">
                        <td className="py-3 px-4 text-surface-300">{row.factor}</td>
                        <td className="py-3 px-4 text-center text-white font-mono">{row.A.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center text-white font-mono">{row.B.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          {diff > 0 ? (
                            <span className="text-brand-400 text-xs font-medium">A is {row.factor === 'Area (sqft)' ? 'larger' : 'higher'} (+{diff.toLocaleString()})</span>
                          ) : diff < 0 ? (
                            <span className="text-accent-400 text-xs font-medium">B is {row.factor === 'Area (sqft)' ? 'larger' : 'higher'} (+{Math.abs(diff).toLocaleString()})</span>
                          ) : (
                            <span className="text-surface-500 text-xs">Equal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Why the difference explanation */}
            <div className="mt-4 p-4 bg-surface-800/30 rounded-xl border border-white/5">
              <p className="text-xs font-semibold text-surface-300 uppercase tracking-wider mb-2">💡 Why the price difference?</p>
              <ul className="text-xs text-surface-400 space-y-1">
                {corridorA !== corridorB && (
                  <li>• <strong className="text-surface-300">Different corridors</strong> have fundamentally different market base rates due to infrastructure, connectivity, and demand patterns.</li>
                )}
                {resultA.locality !== resultB.locality && (
                  <li>• <strong className="text-surface-300">Locality premium</strong> — each locality has a unique price-per-sqft based on metro proximity, IT hubs, schools, and development stage.</li>
                )}
                {inputA.sqft !== inputB.sqft && (
                  <li>• <strong className="text-surface-300">Area difference</strong> of {Math.abs(inputA.sqft - inputB.sqft).toLocaleString()} sq.ft. directly scales the total price (larger area = higher price).</li>
                )}
                {inputA.bhk !== inputB.bhk && (
                  <li>• <strong className="text-surface-300">BHK config</strong> — a {Math.max(inputA.bhk, inputB.bhk)} BHK has higher bathrooms/amenity expectations, affecting per-sqft rate efficiency.</li>
                )}
                {(() => {
                  const amA = inputA.parking + inputA.gym + inputA.swimming_pool + inputA.garden + inputA.security + inputA.clubhouse;
                  const amB = inputB.parking + inputB.gym + inputB.swimming_pool + inputB.garden + inputB.security + inputB.clubhouse;
                  if (amA !== amB) return <li>• <strong className="text-surface-300">Amenity gap</strong> — Property {amA > amB ? 'A' : 'B'} has {Math.abs(amA - amB)} more amenities, each adding a 1.5-3% premium.</li>;
                  return null;
                })()}
                {inputA.floor !== inputB.floor && (
                  <li>• <strong className="text-surface-300">Floor level</strong> — higher floors typically add a ~0.4% premium per floor due to better views and noise reduction.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
