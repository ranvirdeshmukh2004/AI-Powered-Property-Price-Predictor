import { useState, useEffect } from 'react';
import {
  IndianRupee, TrendingUp, BarChart2, ArrowUpRight,
  ArrowDownRight, Minus, GitCompareArrows, MapPin, Loader2
} from 'lucide-react';
import { compareCorridors } from '../api';

const CORRIDOR_NAMES = {
  dehu_solapur: 'Dehu Rd → Solapur Rd',
  kolhapur_nashik: 'Kolhapur Rd → Nashik Rd',
};

function AnimatedPrice({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <>{display.toFixed(2)}</>;
}

export default function PredictionResult({ result, formData }) {
  const [comparison, setComparison] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Reset comparison when result changes
  useEffect(() => {
    setComparison(null);
    setShowComparison(false);
  }, [result]);

  if (!result) return null;

  const handleCompare = async () => {
    setIsComparing(true);
    try {
      const data = await compareCorridors(formData);
      setComparison(data);
      setShowComparison(true);
    } catch (err) {
      console.error('Comparison failed:', err);
    } finally {
      setIsComparing(false);
    }
  };

  const { predicted_price_lakhs, price_per_sqft, corridor, locality, confidence_band } = result;

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Main Price Card */}
      <div className="glass-card overflow-hidden">
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-brand-500 via-accent-500 to-brand-400" />

        <div className="p-6 md:p-8">
          {/* Title */}
          <div className="flex items-center gap-2 mb-1">
            <div className="badge-accent">
              <TrendingUp className="w-3 h-3 mr-1" />
              AI Valuation
            </div>
          </div>

          <div className="flex items-center gap-2 text-surface-400 text-sm mb-6">
            <MapPin className="w-3.5 h-3.5" />
            <span>{locality}</span>
            <span className="text-surface-600">·</span>
            <span className="text-surface-500">{CORRIDOR_NAMES[corridor]}</span>
          </div>

          {/* Price Display */}
          <div className="flex items-baseline gap-2 mb-2">
            <IndianRupee className="w-8 h-8 text-accent-400 self-start mt-1" />
            <span className="font-display text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              <AnimatedPrice value={predicted_price_lakhs} />
            </span>
            <span className="text-surface-400 text-lg font-medium">Lakhs</span>
          </div>

          {/* Confidence Band */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1.5 flex-1 bg-surface-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-accent-500 rounded-full transition-all duration-1000"
                style={{ width: '92%' }}
              />
            </div>
            <span className="text-xs text-surface-400 whitespace-nowrap">
              ₹{confidence_band.low}L – ₹{confidence_band.high}L
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-surface-800/40 rounded-xl p-3 border border-white/[0.04]">
              <p className="stat-label">Price / sq.ft</p>
              <p className="text-xl font-bold text-white font-display">
                ₹{Math.round(price_per_sqft).toLocaleString()}
              </p>
            </div>
            <div className="bg-surface-800/40 rounded-xl p-3 border border-white/[0.04]">
              <p className="stat-label">Confidence</p>
              <p className="text-xl font-bold text-accent-400 font-display">92%</p>
            </div>
          </div>

          {/* Compare CTA */}
          {!showComparison && (
            <button
              id="compare-button"
              onClick={handleCompare}
              disabled={isComparing}
              className="btn-secondary w-full gap-2"
            >
              {isComparing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Comparing corridors...
                </>
              ) : (
                <>
                  <GitCompareArrows className="w-4 h-4" />
                  Compare with other corridor
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Comparison Card */}
      {showComparison && comparison && (
        <ComparisonPanel comparison={comparison} />
      )}
    </div>
  );
}

function ComparisonPanel({ comparison }) {
  const { primary, alternative, price_difference_lakhs, price_difference_percent } = comparison;
  const isPositive = price_difference_lakhs > 0;
  const isEqual = Math.abs(price_difference_lakhs) < 0.5;

  const DiffIcon = isEqual ? Minus : isPositive ? ArrowUpRight : ArrowDownRight;
  const diffColor = isEqual
    ? 'text-surface-400'
    : isPositive
      ? 'text-red-400'
      : 'text-accent-400';

  return (
    <div className="glass-card overflow-hidden animate-scale-in">
      <div className="h-1 bg-gradient-to-r from-accent-500 via-brand-500 to-accent-400" />
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <GitCompareArrows className="w-5 h-5 text-brand-400" />
          <h3 className="font-display text-lg font-bold text-white">Corridor Comparison</h3>
          <span className="text-xs text-surface-500">— Same property, different location</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Primary */}
          <div className="bg-surface-800/40 rounded-xl p-4 border border-brand-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-brand-400" />
              <p className="text-xs uppercase tracking-wider text-brand-300 font-semibold">
                {CORRIDOR_NAMES[primary.corridor]}
              </p>
            </div>
            <p className="text-xs text-surface-400 mb-1">{primary.locality}</p>
            <p className="font-display text-3xl font-bold text-white">
              ₹{primary.predicted_price_lakhs.toFixed(1)}
              <span className="text-base text-surface-400 ml-1">L</span>
            </p>
            <p className="text-xs text-surface-500 mt-1">
              ₹{Math.round(primary.price_per_sqft).toLocaleString()}/sqft
            </p>
          </div>

          {/* Alternative */}
          <div className="bg-surface-800/40 rounded-xl p-4 border border-accent-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-accent-400" />
              <p className="text-xs uppercase tracking-wider text-accent-300 font-semibold">
                {CORRIDOR_NAMES[alternative.corridor]}
              </p>
            </div>
            <p className="text-xs text-surface-400 mb-1">{alternative.locality}</p>
            <p className="font-display text-3xl font-bold text-white">
              ₹{alternative.predicted_price_lakhs.toFixed(1)}
              <span className="text-base text-surface-400 ml-1">L</span>
            </p>
            <p className="text-xs text-surface-500 mt-1">
              ₹{Math.round(alternative.price_per_sqft).toLocaleString()}/sqft
            </p>
          </div>
        </div>

        {/* Difference Banner */}
        <div className={`
          flex items-center justify-center gap-2 p-3 rounded-xl border
          ${isEqual
            ? 'bg-surface-800/40 border-white/[0.06]'
            : isPositive
              ? 'bg-red-500/5 border-red-500/15'
              : 'bg-accent-500/5 border-accent-500/15'
          }
        `}>
          <DiffIcon className={`w-5 h-5 ${diffColor}`} />
          <span className={`font-display text-lg font-bold ${diffColor}`}>
            {isEqual
              ? 'Comparable pricing'
              : `₹${Math.abs(price_difference_lakhs).toFixed(1)}L ${isPositive ? 'higher' : 'lower'} (${Math.abs(price_difference_percent).toFixed(1)}%)`
            }
          </span>
        </div>
      </div>
    </div>
  );
}
