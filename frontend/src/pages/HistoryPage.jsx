import { useState, useEffect, useCallback } from 'react';
import { History, RefreshCw, Database, TrendingUp, MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchHistory, fetchCorridorHistoryStats } from '../api';

const CORRIDOR_COLORS = {
  dehu_solapur: '#efab0f',
  kolhapur_nashik: '#10b981',
};

const CORRIDOR_LABELS = {
  dehu_solapur: 'Dehu Rd → Solapur Rd',
  kolhapur_nashik: 'Kolhapur Rd → Nashik Rd',
};

function formatTimestamp(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [corridorStats, setCorridorStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mongoConnected, setMongoConnected] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [historyRes, statsRes] = await Promise.all([
        fetchHistory(),
        fetchCorridorHistoryStats(),
      ]);
      setRecords(historyRes.records || []);
      setMongoConnected(historyRes.mongodb_connected);
      setCorridorStats(statsRes.corridor_stats || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Scatter chart data
  const scatterData = records.map(r => ({
    sqft: r.sqft,
    price: r.predicted_price_lakhs,
    corridor: r.corridor,
    locality: r.locality,
    bhk: r.bhk,
  }));

  return (
    <div className="animate-fade-in w-full">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <History className="w-6 h-6 text-brand-400" />
            Prediction History
          </h2>
          <p className="section-subtitle">
            All AI-generated valuations logged in real-time via MongoDB Atlas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* MongoDB status badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            mongoConnected
              ? 'border-accent-500/30 bg-accent-500/10 text-accent-400'
              : 'border-red-500/30 bg-red-500/10 text-red-400'
          }`}>
            <Database className="w-3.5 h-3.5" />
            {mongoConnected ? 'MongoDB Connected' : 'MongoDB Offline'}
            <div className={`w-1.5 h-1.5 rounded-full ${mongoConnected ? 'bg-accent-500 animate-pulse' : 'bg-red-500'}`} />
          </div>
          <button onClick={loadData} className="btn-secondary py-2 px-3 text-xs gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-card border-red-500/20 p-4 mb-6 flex items-center gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="glass-card p-16 flex flex-col items-center justify-center text-center animate-fade-in">
          <Loader2 className="w-10 h-10 text-brand-400 animate-spin mb-4" />
          <p className="text-surface-300 font-medium">Loading prediction history…</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ─── Corridor Comparison Cards ─── */}
          {corridorStats.length > 0 && (
            <section className="mb-10">
              <h3 className="text-sm font-bold text-surface-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-400" />
                Corridor Comparison (from History)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {corridorStats.map((stat) => (
                  <div
                    key={stat.corridor}
                    className="glass-card p-6 border-l-4 hover:scale-[1.01] transition-transform duration-300"
                    style={{ borderLeftColor: CORRIDOR_COLORS[stat.corridor] || '#efab0f' }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4" style={{ color: CORRIDOR_COLORS[stat.corridor] }} />
                      <h4 className="font-bold text-white text-sm">
                        {CORRIDOR_LABELS[stat.corridor] || stat.corridor}
                      </h4>
                      <span className="ml-auto text-xs text-surface-500">{stat.count} predictions</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-surface-500 mb-1">Avg Predicted Price</div>
                        <div className="text-xl font-bold" style={{ color: CORRIDOR_COLORS[stat.corridor] }}>
                          ₹{stat.avg_predicted_price?.toFixed(1)}L
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-surface-500 mb-1">Avg ₹/sqft</div>
                        <div className="text-xl font-bold text-white">
                          ₹{stat.avg_price_per_sqft?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-surface-500 mb-1">Min Price</div>
                        <div className="text-sm font-medium text-surface-300">₹{stat.min_price?.toFixed(1)}L</div>
                      </div>
                      <div>
                        <div className="text-xs text-surface-500 mb-1">Max Price</div>
                        <div className="text-sm font-medium text-surface-300">₹{stat.max_price?.toFixed(1)}L</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ─── Scatter Chart: Price vs Sqft ─── */}
          {scatterData.length > 0 && (
            <section className="mb-10">
              <h3 className="text-sm font-bold text-surface-300 uppercase tracking-wider mb-4">
                Price vs Area (Sqft) — Colored by Corridor
              </h3>
              <div className="glass-card p-6" style={{ height: 360 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="sqft" type="number" name="Sqft"
                      stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }}
                      label={{ value: 'Area (sqft)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      dataKey="price" type="number" name="Price"
                      stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }}
                      label={{ value: 'Price (₹ Lakhs)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{
                        backgroundColor: '#1e293b', border: '1px solid #334155',
                        borderRadius: '12px', fontSize: '12px', color: '#e2e8f0',
                      }}
                      formatter={(value, name) => {
                        if (name === 'Price') return [`₹${value}L`, 'Predicted Price'];
                        if (name === 'Sqft') return [`${value} sqft`, 'Area'];
                        return [value, name];
                      }}
                    />
                    <Scatter data={scatterData} fill="#efab0f">
                      {scatterData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CORRIDOR_COLORS[entry.corridor] || '#efab0f'}
                          fillOpacity={0.8}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex justify-center gap-6 mt-3">
                {Object.entries(CORRIDOR_LABELS).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2 text-xs text-surface-400">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CORRIDOR_COLORS[key] }} />
                    {label}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ─── Prediction Log Table ─── */}
          <section>
            <h3 className="text-sm font-bold text-surface-300 uppercase tracking-wider mb-4">
              Recent Predictions ({records.length})
            </h3>

            {records.length === 0 ? (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
                  <History className="w-8 h-8 text-brand-400" />
                </div>
                <p className="text-surface-300 font-medium mb-1">No predictions logged yet</p>
                <p className="text-surface-500 text-sm max-w-sm">
                  Head to the <span className="text-brand-400">Valuation</span> page and make your first prediction. It will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-700/50">
                        {['Time', 'Corridor', 'Locality', 'BHK', 'Sqft', 'Floor', 'Amenities', 'Price (₹L)', '₹/sqft'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-surface-400 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-surface-800/30 hover:bg-surface-800/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-xs text-surface-400 whitespace-nowrap">{formatTimestamp(r.timestamp)}</td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold"
                              style={{
                                backgroundColor: (CORRIDOR_COLORS[r.corridor] || '#efab0f') + '20',
                                color: CORRIDOR_COLORS[r.corridor] || '#efab0f',
                              }}
                            >
                              {r.corridor === 'dehu_solapur' ? 'Dehu-Solapur' : 'Kolhapur-Nashik'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-surface-200 font-medium">{r.locality}</td>
                          <td className="px-4 py-3 text-surface-300">{r.bhk}</td>
                          <td className="px-4 py-3 text-surface-300">{r.sqft?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-surface-300">{r.floor}</td>
                          <td className="px-4 py-3 text-surface-300">{r.amenities_score}</td>
                          <td className="px-4 py-3 font-bold text-brand-400">₹{r.predicted_price_lakhs?.toFixed(1)}</td>
                          <td className="px-4 py-3 text-surface-300">₹{r.price_per_sqft?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
