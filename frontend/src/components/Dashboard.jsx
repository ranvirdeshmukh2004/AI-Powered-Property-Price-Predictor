import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Cell
} from 'recharts';
import { BarChart3, PieChart, Zap, Loader2, TrendingUp, MapPin } from 'lucide-react';
import { fetchStats, fetchAmenityImpact } from '../api';

const BRAND_COLOR = '#6366f1';
const ACCENT_COLOR = '#10b981';
const BRAND_LIGHT = '#818cf8';
const ACCENT_LIGHT = '#34d399';

const CORRIDOR_NAMES = {
  dehu_solapur: 'Dehu–Solapur',
  kolhapur_nashik: 'Kolhapur–Nashik',
};

const CORRIDOR_COLORS = {
  dehu_solapur: BRAND_COLOR,
  kolhapur_nashik: ACCENT_COLOR,
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [amenityData, setAmenityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('locality');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, amenityRes] = await Promise.all([
          fetchStats(),
          fetchAmenityImpact(),
        ]);
        setStats(statsRes);
        setAmenityData(amenityRes);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center gap-3 animate-fade-in">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        <p className="text-surface-400 text-sm">Loading market data...</p>
      </div>
    );
  }

  if (!stats) return null;

  const tabs = [
    { id: 'locality', label: 'Price by Locality', icon: MapPin },
    { id: 'bhk', label: 'BHK Comparison', icon: BarChart3 },
    { id: 'amenity', label: 'Amenity Impact', icon: Zap },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brand-400" />
            Market Intelligence
          </h2>
          <p className="section-subtitle">Real-time analytics from {stats.corridor_summary?.reduce((a, c) => a + c.total_listings, 0).toLocaleString()} data points</p>
        </div>

        {/* Tab Switcher */}
        <div className="glass-card p-1 flex gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200
                ${activeTab === id
                  ? 'bg-brand-600 text-white'
                  : 'text-surface-400 hover:text-surface-300 hover:bg-surface-800/50'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Corridor Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.corridor_summary?.map((cs) => (
          <div key={cs.corridor} className="glass-card-hover p-5">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CORRIDOR_COLORS[cs.corridor] }}
              />
              <p className="text-sm font-semibold text-white">
                {CORRIDOR_NAMES[cs.corridor]}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="stat-value text-2xl">₹{cs.avg_price.toFixed(0)}<span className="text-sm text-surface-400">L</span></p>
                <p className="stat-label">Avg Price</p>
              </div>
              <div>
                <p className="stat-value text-2xl">₹{Math.round(cs.avg_price_per_sqft).toLocaleString()}</p>
                <p className="stat-label">Avg / sqft</p>
              </div>
              <div>
                <p className="stat-value text-2xl">{cs.total_listings}</p>
                <p className="stat-label">Listings</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Area */}
      <div className="glass-card p-5 md:p-6">
        {activeTab === 'locality' && <LocalityChart data={stats.locality_stats} />}
        {activeTab === 'bhk' && <BHKChart data={stats.bhk_stats} />}
        {activeTab === 'amenity' && <AmenityChart data={amenityData} />}
      </div>
    </div>
  );
}

/* ─── Locality Price Chart ─── */
function LocalityChart({ data }) {
  if (!data) return null;

  const chartData = data
    .map((d) => ({
      locality: d.locality,
      corridor: d.corridor,
      avgPricePerSqft: Math.round(d.avg_price_per_sqft),
      avgPrice: d.avg_price.toFixed(1),
    }))
    .sort((a, b) => b.avgPricePerSqft - a.avgPricePerSqft);

  return (
    <div>
      <h3 className="text-sm font-semibold text-surface-300 mb-4">
        Average Price per Sq.Ft. by Locality
      </h3>
      <div style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="locality" type="category" width={110} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => [`₹${value.toLocaleString()}/sqft`, 'Avg Rate']}
              cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
            />
            <Bar dataKey="avgPricePerSqft" radius={[0, 6, 6, 0]} barSize={18}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CORRIDOR_COLORS[entry.corridor]}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        {Object.entries(CORRIDOR_NAMES).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2 text-xs text-surface-400">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: CORRIDOR_COLORS[key] }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── BHK Comparison Chart ─── */
function BHKChart({ data }) {
  if (!data) return null;

  const bhkValues = [...new Set(data.map((d) => d.bhk))].sort();
  const chartData = bhkValues.map((bhk) => {
    const row = { bhk: `${bhk} BHK` };
    data.forEach((d) => {
      if (d.bhk === bhk) {
        row[CORRIDOR_NAMES[d.corridor]] = parseFloat(d.avg_price.toFixed(1));
      }
    });
    return row;
  });

  return (
    <div>
      <h3 className="text-sm font-semibold text-surface-300 mb-4">
        Average Price (₹ Lakhs) by BHK — Corridor Comparison
      </h3>
      <div style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="bhk" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => [`₹${value}L`, '']}
              cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
            />
            <Legend />
            <Bar
              dataKey={CORRIDOR_NAMES.dehu_solapur}
              fill={BRAND_COLOR}
              radius={[6, 6, 0, 0]}
              barSize={32}
            />
            <Bar
              dataKey={CORRIDOR_NAMES.kolhapur_nashik}
              fill={ACCENT_COLOR}
              radius={[6, 6, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Amenity Impact Chart ─── */
function AmenityChart({ data }) {
  if (!data || data.length === 0) return null;

  const radarData = data.map((d) => ({
    amenity: d.amenity,
    impact: Math.max(d.premium_percent, 0),
  }));

  const barData = data.map((d) => ({
    amenity: d.amenity,
    premium: parseFloat(d.premium_percent.toFixed(2)),
    withAmenity: d.avg_with,
    withoutAmenity: d.avg_without,
  }));

  return (
    <div>
      <h3 className="text-sm font-semibold text-surface-300 mb-4">
        How Amenities Affect Property Value (% Premium on ₹/sqft)
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis dataKey="amenity" type="category" width={90} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Price Premium']}
                cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
              />
              <Bar dataKey="premium" radius={[0, 6, 6, 0]} barSize={16}>
                {barData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? ACCENT_COLOR : BRAND_LIGHT}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="amenity" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <PolarRadiusAxis tick={{ fontSize: 9, fill: '#64748b' }} />
              <Radar
                dataKey="impact"
                stroke={ACCENT_COLOR}
                fill={ACCENT_COLOR}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
