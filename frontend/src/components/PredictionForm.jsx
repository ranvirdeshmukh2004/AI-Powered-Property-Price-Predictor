import { useState, useEffect } from 'react';
import {
  Home, BedDouble, Bath, Layers, Maximize2,
  Car, Dumbbell, Waves, Trees, Shield, Building,
  Sparkles, ArrowRight, MapPin, Loader2,
} from 'lucide-react';

const AMENITY_LIST = [
  { key: 'parking', label: 'Parking', icon: Car },
  { key: 'gym', label: 'Gym', icon: Dumbbell },
  { key: 'swimming_pool', label: 'Pool', icon: Waves },
  { key: 'garden', label: 'Garden', icon: Trees },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'clubhouse', label: 'Clubhouse', icon: Building },
];

const INITIAL_FORM = {
  bhk: 2,
  sqft: 950,
  bathrooms: 2,
  floor: 5,
  parking: 0,
  gym: 0,
  swimming_pool: 0,
  garden: 0,
  security: 0,
  clubhouse: 0,
};

export default function PredictionForm({ corridor, localities, onPredict, isLoading }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [locality, setLocality] = useState('');
  const [errors, setErrors] = useState({});

  // Reset locality when corridor changes
  useEffect(() => {
    if (localities && localities.length > 0) {
      setLocality(localities[0]);
    }
  }, [corridor, localities]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const toggleAmenity = (key) => {
    setForm((prev) => ({ ...prev, [key]: prev[key] === 1 ? 0 : 1 }));
  };

  const validate = () => {
    const errs = {};
    if (form.sqft < 300 || form.sqft > 3500) {
      errs.sqft = 'Area must be between 300-3500 sq.ft.';
    }
    if (!locality) {
      errs.locality = 'Please select a locality';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onPredict({
      corridor,
      locality,
      ...form,
    });
  };

  const amenityCount = AMENITY_LIST.reduce((acc, a) => acc + form[a.key], 0);

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 animate-fade-in-up">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
          <Home className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-white">Property Specs</h2>
          <p className="text-xs text-surface-400">Configure your property parameters</p>
        </div>
      </div>

      {/* Locality Selector */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-surface-300 mb-2">
          <MapPin className="w-3.5 h-3.5 text-brand-400" />
          Locality
        </label>
        <select
          id="locality-select"
          value={locality}
          onChange={(e) => {
            setLocality(e.target.value);
            if (errors.locality) {
              setErrors((prev) => {
                const next = { ...prev };
                delete next.locality;
                return next;
              });
            }
          }}
          className="input-field appearance-none cursor-pointer"
        >
          {localities?.map((loc) => (
            <option key={loc} value={loc} className="bg-surface-800 text-white">
              {loc}
            </option>
          ))}
        </select>
        {errors.locality && (
          <p className="text-red-400 text-xs mt-1">{errors.locality}</p>
        )}
      </div>

      {/* BHK Selector */}
      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm font-medium text-surface-300 mb-2.5">
          <BedDouble className="w-3.5 h-3.5 text-brand-400" />
          BHK Configuration
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((bhk) => (
            <button
              key={bhk}
              type="button"
              id={`bhk-${bhk}`}
              onClick={() => updateField('bhk', bhk)}
              className={`
                relative py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${form.bhk === bhk
                  ? 'bg-brand-600 text-white shadow-neon'
                  : 'bg-surface-800/60 text-surface-400 hover:bg-surface-700/60 hover:text-surface-300 border border-white/[0.06]'
                }
              `}
            >
              {bhk} BHK
            </button>
          ))}
        </div>
      </div>

      {/* Square Footage */}
      <div className="mb-5">
        <label className="flex items-center justify-between text-sm font-medium text-surface-300 mb-2.5">
          <span className="flex items-center gap-2">
            <Maximize2 className="w-3.5 h-3.5 text-brand-400" />
            Area (sq.ft.)
          </span>
          <span className="text-brand-400 font-mono text-xs">{form.sqft.toLocaleString()} sq.ft.</span>
        </label>
        <input
          id="sqft-input"
          type="number"
          min="300"
          max="3500"
          value={form.sqft}
          onChange={(e) => updateField('sqft', parseInt(e.target.value) || 0)}
          className={`input-field font-mono ${errors.sqft ? 'border-red-400/50 ring-2 ring-red-400/20' : ''}`}
          placeholder="e.g., 1200"
        />
        {errors.sqft && (
          <p className="text-red-400 text-xs mt-1">{errors.sqft}</p>
        )}
        {/* Range slider */}
        <input
          type="range"
          min="300"
          max="3500"
          step="50"
          value={form.sqft}
          onChange={(e) => updateField('sqft', parseInt(e.target.value))}
          className="w-full mt-2 h-1.5 bg-surface-700 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:bg-brand-500 [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:shadow-neon [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150
                     [&::-webkit-slider-thumb]:hover:scale-125"
        />
        <div className="flex justify-between text-[10px] text-surface-500 mt-1">
          <span>300</span>
          <span>3,500</span>
        </div>
      </div>

      {/* Bathrooms */}
      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm font-medium text-surface-300 mb-2.5">
          <Bath className="w-3.5 h-3.5 text-brand-400" />
          Bathrooms
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((bath) => (
            <button
              key={bath}
              type="button"
              id={`bath-${bath}`}
              onClick={() => updateField('bathrooms', bath)}
              className={`
                py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${form.bathrooms === bath
                  ? 'bg-brand-600 text-white shadow-neon'
                  : 'bg-surface-800/60 text-surface-400 hover:bg-surface-700/60 hover:text-surface-300 border border-white/[0.06]'
                }
              `}
            >
              {bath}
            </button>
          ))}
        </div>
      </div>

      {/* Floor Level */}
      <div className="mb-6">
        <label className="flex items-center justify-between text-sm font-medium text-surface-300 mb-2.5">
          <span className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            Floor Level
          </span>
          <span className="text-brand-400 font-mono text-xs">Floor {form.floor}</span>
        </label>
        <input
          id="floor-input"
          type="range"
          min="0"
          max="25"
          value={form.floor}
          onChange={(e) => updateField('floor', parseInt(e.target.value))}
          className="w-full h-1.5 bg-surface-700 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:bg-brand-500 [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:shadow-neon [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150
                     [&::-webkit-slider-thumb]:hover:scale-125"
        />
        <div className="flex justify-between text-[10px] text-surface-500 mt-1">
          <span>Ground</span>
          <span>25th</span>
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-8">
        <label className="flex items-center justify-between text-sm font-medium text-surface-300 mb-2.5">
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Amenities
          </span>
          <span className="badge-brand">{amenityCount}/6 selected</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AMENITY_LIST.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              id={`amenity-${key}`}
              onClick={() => toggleAmenity(key)}
              className={form[key] === 1 ? 'chip-active' : 'chip-inactive'}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        id="predict-button"
        disabled={isLoading}
        className="btn-primary w-full text-base py-3.5 gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing Market Data...
          </>
        ) : (
          <>
            Get AI Valuation
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
