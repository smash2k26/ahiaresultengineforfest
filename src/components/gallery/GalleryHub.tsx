import React, { useState } from 'react';
import { Image01Icon as Image01Icon, FavouriteIcon as Heart, SparklesIcon as Sparkles, FilterIcon as Filter, LinkSquare01Icon as ExternalLink, Download01Icon as Download } from 'hugeicons-react';
import { useFestival } from '../../context/FestivalContext';
import { GlassCard, GlassBadge, GlassButton } from '../ui/GlassCard';
import { GalleryItem } from '../../types/festival';

export const GalleryHub: React.FC = () => {
  const { gallery, toggleLikeGallery } = useFestival();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const categories = ['All', 'Arts', 'Sports', 'Crowd', 'Award'];

  const filtered = (gallery || []).filter((item) => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="space-y-6">
      {/* Gallery Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-pink-950/40 via-[#111318] to-[#0A0C10] border border-pink-500/20 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <GlassBadge variant="arts" size="sm">
              <Image01Icon className="w-3.5 h-3.5 text-pink-400" />
              MEDIA & MOMENTS
            </GlassBadge>
            <span className="text-xs text-pink-300 font-mono">Live Fest Photography</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
            Festival Highlights & Captured Moments
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            High-definition photographs from the main stages, sports stadium, cheering crowds, and podium ceremonies.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat, idx) => (
          <button
            key={`gal-cat-${cat}-${idx}`}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat} Photos
          </button>
        ))}
      </div>

      {/* Photo Masonry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item, idx) => (
          <div
            key={item.id ? `gal-item-${item.id}-${idx}` : `gal-item-${idx}`}
            className="group relative rounded-3xl overflow-hidden bg-[#111318] border border-white/8 hover:border-pink-500/40 transition-all duration-300 shadow-xl"
          >
            <div className="aspect-[4/3] overflow-hidden relative cursor-pointer" onClick={() => setSelectedPhoto(item)}>
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute top-3 left-3">
                <GlassBadge variant="arts" size="xs">
                  {item.category}
                </GlassBadge>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-left">
                <h4 className="text-sm font-bold text-white leading-tight">{item.title}</h4>
                <p className="text-[11px] text-gray-300 mt-1 line-clamp-1">{item.caption}</p>
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mt-2 pt-1 border-t border-white/10">
                  <span>Photo: {item.photographer}</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Like Counter Action */}
            <div className="p-3 bg-black/40 flex items-center justify-between">
              <button
                onClick={() => toggleLikeGallery(item.id)}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer transition-transform active:scale-125"
              >
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>{item.likes} Likes</span>
              </button>

              <button
                onClick={() => setSelectedPhoto(item)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Full Screen Preview
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="max-w-4xl w-full bg-[#111318] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="w-full max-h-[70vh] object-contain bg-black"
              />
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedPhoto.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{selectedPhoto.caption}</p>
                <span className="text-[11px] text-pink-400 font-mono mt-1 block">
                  Captured by {selectedPhoto.photographer} • {selectedPhoto.timestamp}
                </span>
              </div>
              <GlassButton variant="secondary" size="sm" onClick={() => setSelectedPhoto(null)}>
                Close Preview
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
