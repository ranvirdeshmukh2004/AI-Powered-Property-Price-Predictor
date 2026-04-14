import { Camera } from 'lucide-react';
import PropertyTour3D from '../components/PropertyTour3D';

export default function AestheticsPage() {
  const images = [
    {
      url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      alt: "Luxury Estate Exterior",
      span: "col-span-2 row-span-2"
    },
    {
      url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      alt: "Modern Apartment Complex",
      span: "col-span-1 row-span-1"
    },
    {
      url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      alt: "Premium Interior Living",
      span: "col-span-1 row-span-2"
    },
    {
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      alt: "Contemporary Home Design",
      span: "col-span-1 row-span-1"
    },
    {
      url: "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=800&q=80",
      alt: "Commercial Skyline",
      span: "col-span-2 row-span-1"
    }
  ];

  return (
    <div className="animate-fade-in flex flex-col min-h-screen">
      <div className="mb-6">
        <h2 className="section-title flex items-center gap-2">
          <Camera className="w-6 h-6 text-brand-400" />
          Market Aesthetics
        </h2>
        <p className="section-subtitle">
          Visualizing premium property standards across Pune's high-growth corridors.
        </p>
      </div>

      {/* Interactive 3D Architectural Engine */}
      <div className="mb-10 w-full h-[60vh] min-h-[500px]">
        <PropertyTour3D />
      </div>

      {/* Masonry Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[200px] gap-4 pb-12">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className={`glass-card relative overflow-hidden rounded-2xl group ${img.span} border border-surface-800/50 hover:border-brand-500/30 transition-all duration-500`}
          >
            <div className="absolute inset-0 bg-surface-950/20 group-hover:bg-transparent z-10 transition-colors duration-500"></div>
            <img 
              src={img.url} 
              alt={img.alt} 
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-surface-950/90 via-surface-950/50 to-transparent z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <p className="text-sm font-semibold text-white truncate">{img.alt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
