/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Camera, HelpCircle, CheckCircle, Sparkles, MapPin, Eye, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HostelConfig } from '../types';

interface VirtualTourProps {
  config: HostelConfig;
}

export default function VirtualTour({ config }: VirtualTourProps) {
  const [activeArea, setActiveArea] = useState<'kitchen' | 'single' | 'twin' | 'lobby'>('kitchen');
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [clickedHotspot, setClickedHotspot] = useState<string | null>(null);

  const getUploadedPhoto = () => {
    switch (activeArea) {
      case 'kitchen': return config.photoKitchen;
      case 'single': return config.photoSingle;
      case 'twin': return config.photoTwin;
      case 'lobby': return config.photoLobby;
      default: return undefined;
    }
  };

  const activePhoto = getUploadedPhoto();

  const tourAreas = {
    kitchen: {
      name: 'Self-Cooking Kitchen',
      badge: 'Main Unique Spotlight',
      description: config.tourKitchenDesc || 'A clean, fully-accessible modern cooking zone. Complete independence over your meals and substantial budget savings.',
      bgGradient: 'from-slate-950 via-slate-900 to-slate-950',
      hotspots: [
        {
          id: 'stove',
          name: 'High-Speed Induction Stoves',
          top: '35%',
          left: '30%',
          info: 'Equipped with digital temperature controls, safe cookware sensing, and auto-off to protect safety.',
        },
        {
          id: 'fridge',
          name: 'Shared Double-Door Refrigerator',
          top: '25%',
          left: '70%',
          info: 'Large capacity to store milk, dairy, fresh vegetables, and home-cooked meals safely without spoiling.',
        },
        {
          id: 'ro',
          name: 'Multi-Stage RO Water Purifier',
          top: '55%',
          left: '80%',
          info: 'Industrial grade multi-stage water purifier supplying ice-cold pure water 24/7 for health.',
        }
      ]
    },
    single: {
      name: 'Single Study Room (1-Seater)',
      badge: 'Private & Focused',
      description: config.tourSingleDesc || 'A neat, peaceful study haven. Every detail is optimized for high-concentration and academic studies near SRMU.',
      bgGradient: 'from-slate-950 via-slate-900 to-slate-950',
      hotspots: [
        {
          id: 'desk',
          name: 'Deep-Wood Study Desk',
          top: '45%',
          left: '40%',
          info: 'Generous wooden study table with custom vertical book shelves, LED study lamp, and high-quality study chair.',
        },
        {
          id: 'bed',
          name: 'Storage Bed with Mattress',
          top: '65%',
          left: '20%',
          info: 'Comfortable single mattress with spacious hydraulic pull-up under-bed storage for extra luggage.',
        },
        {
          id: 'window',
          name: 'Ventilation Window',
          top: '20%',
          left: '50%',
          info: 'Large glass sliding window with bug mesh to supply continuous natural breeze and daylight.',
        }
      ]
    },
    twin: {
      name: 'Twin-Sharing Room (2-Seater)',
      badge: 'Perfect Companionship',
      description: config.tourTwinDesc || 'Spacious double-occupancy room. Clean layout partitions ensure both boys get equal study tables and storage.',
      bgGradient: 'from-slate-950 via-slate-900 to-slate-950',
      hotspots: [
        {
          id: 'wardrobes',
          name: 'Dual Independent Wardrobes',
          top: '30%',
          left: '25%',
          info: 'Two large matching wooden cupboards, each fitted with secure internal combination locker drawers.',
        },
        {
          id: 'separation',
          name: 'Spaced Partitioning Layout',
          top: '50%',
          left: '50%',
          info: 'Carefully separated beds and study desks, ensuring you can study or sleep without disturbing your roommate.',
        }
      ]
    },
    lobby: {
      name: 'Lobby & Common Area',
      badge: 'Social & Secure',
      description: config.tourLobbyDesc || 'Clean corridors, security surveillance desks, and high-comfort common elements designed for mutual safety.',
      bgGradient: 'from-slate-950 via-slate-900 to-slate-950',
      hotspots: [
        {
          id: 'cctv',
          name: 'HD CCTV Camera Nodes',
          top: '15%',
          left: '45%',
          info: '24/7 continuous high-definition security camera surveillance linked directly to local caretaker desk.',
        },
        {
          id: 'shoes',
          name: 'Dedicated Shoe Racks',
          top: '75%',
          left: '15%',
          info: 'Organized personal shoe locker cubbies for every resident to maintain spotless hallways.',
        }
      ]
    }
  };

  const currentArea = tourAreas[activeArea];

  const handleBookVisit = () => {
    const el = document.querySelector('#contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="tour" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
            Digital Visit
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Take a High-Fidelity Virtual Tour
          </h2>
          <p className="font-sans text-slate-600 text-sm max-w-xl mx-auto">
            Can’t visit us physically today? Browse our interactive digital space model. Tap the glowing hotspots to inspect premium amenities in detail.
          </p>
          <div className="w-12 h-1 bg-primary-600 mx-auto rounded-full"></div>
        </div>

        {/* Tour Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="virtual-tour-grid">
          
          {/* Controls Column (Left) */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50/50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm" id="tour-controls">
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-xl text-slate-950">Choose Area to Inspect</h3>
                <p className="text-xs text-slate-500 mt-1">Select a location to enter the interactive tour</p>
              </div>

              {/* Area buttons */}
              <div className="space-y-3">
                {(Object.keys(tourAreas) as Array<keyof typeof tourAreas>).map((key) => {
                  const area = tourAreas[key];
                  const isSelected = activeArea === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveArea(key);
                        setClickedHotspot(null);
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-xl text-left border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-slate-900 bg-white shadow-sm text-slate-950 font-bold'
                          : 'border-transparent hover:border-slate-200 text-slate-600 bg-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          <Camera className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block text-sm">{area.name}</span>
                          <span className={`block text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-primary-600' : 'text-slate-400'}`}>
                            {area.badge}
                          </span>
                        </div>
                      </div>
                      <Eye className={`w-4 h-4 ${isSelected ? 'text-primary-600' : 'text-slate-300'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visit invitation */}
            <div className="mt-8 bg-slate-100 p-4 rounded-2xl border border-slate-200/50 space-y-3">
              <span className="text-xs font-bold text-slate-800 block uppercase tracking-wider">Schedule a Visit</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Photos can only show so much! Visit us near SRMU (Tindola) to experience our warm community atmosphere and premium hygiene standards yourself.
              </p>
              <button
                onClick={handleBookVisit}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Physical Visit Now</span>
              </button>
            </div>
          </div>

          {/* Interactive Screen Simulator (Right) */}
          <div className="lg:col-span-8 flex flex-col justify-between" id="tour-simulator-column">
            
            <div className={`relative flex-1 min-h-[420px] rounded-3xl bg-gradient-to-br ${currentArea.bgGradient} p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-sm border border-slate-800`}>
              {/* Dynamic Uploaded Background Photo */}
              {activePhoto && (
                <img 
                  src={activePhoto} 
                  alt={currentArea.name} 
                  className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay z-0"
                  referrerPolicy="no-referrer"
                />
              )}
              {/* Overlay abstract background pattern to represent the room layout */}
              <div className="absolute inset-0 z-0 opacity-15 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              
              {/* Header inside screen */}
              <div className="relative z-10 flex items-center justify-between text-white">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs">
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping"></span>
                  <span className="font-semibold text-gray-100">Live Virtual Viewer</span>
                </div>
                <span className="text-xs text-white/60 font-mono tracking-wider">{config.hostelName} • Interactive Stage</span>
              </div>

              {/* Glowing Interactive Hotspots inside screen */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                {currentArea.hotspots.map((spot) => {
                  const isClicked = clickedHotspot === spot.id;
                  return (
                    <div
                      key={spot.id}
                      className="absolute pointer-events-auto"
                      style={{ top: spot.top, left: spot.left }}
                    >
                      {/* Pulse circle */}
                      <button
                        onMouseEnter={() => setHoveredHotspot(spot.id)}
                        onMouseLeave={() => setHoveredHotspot(null)}
                        onClick={() => setClickedHotspot(clickedHotspot === spot.id ? null : spot.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer ${
                          isClicked 
                            ? 'bg-primary-500 text-slate-950 scale-110 border-2 border-white' 
                            : 'bg-primary-600 text-white hover:bg-primary-500 hover:text-slate-950 hover:scale-105'
                        }`}
                        title="Click to view detail"
                      >
                        <span className="absolute inset-0 rounded-full bg-primary-600 animate-ping opacity-30"></span>
                        <HelpCircle className="w-4 h-4" />
                      </button>

                      {/* Tooltip Overlay */}
                      <AnimatePresence>
                        {(hoveredHotspot === spot.id || isClicked) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute z-30 bottom-10 left-1/2 transform -translate-x-1/2 w-64 bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 pointer-events-auto"
                          >
                            <h4 className="font-display font-bold text-xs text-primary-300 mb-1 flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-primary-400" />
                              <span>{spot.name}</span>
                            </h4>
                            <p className="font-sans text-[11px] text-gray-300 leading-normal">
                              {spot.info}
                            </p>
                            {isClicked && (
                              <button
                                onClick={() => setClickedHotspot(null)}
                                className="block mt-2 text-[9px] text-gray-400 font-bold uppercase tracking-wider text-right w-full"
                              >
                                Close info
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Central stylized graphic label showing the space mockup details */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 pointer-events-none select-none my-auto">
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Camera className="w-10 h-10 text-white/30" />
                </div>
                <h4 className="font-display font-bold text-2xl text-white tracking-wide">{currentArea.name}</h4>
                <p className="font-sans text-white/60 text-xs max-w-sm mt-1.5">
                  {currentArea.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-[10px] text-primary-300 font-bold bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  <span>Click the glowing hotspots inside to tour</span>
                </div>
              </div>

              {/* Footer instruction inside screen */}
              <div className="relative z-10 flex items-center justify-between text-white/60 text-[10px] font-medium pt-4 border-t border-white/5 mt-auto">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-primary-400" />
                  <span>Hostel Floor 1 & 2 Plan</span>
                </span>
                <span>Click interactive targets</span>
              </div>

            </div>

            {/* Displaying click info at the bottom for accessibility */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 mt-3 flex items-start gap-3">
              <div className="p-1.5 bg-slate-200 text-slate-800 rounded-lg border border-slate-300">
                <Eye className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-600 leading-normal">
                {clickedHotspot ? (
                  <span>
                    <strong>Currently Inspecting:</strong>{' '}
                    <span className="text-primary-700 font-bold">
                      {currentArea.hotspots.find((s) => s.id === clickedHotspot)?.name}
                    </span>{' '}
                    — {currentArea.hotspots.find((s) => s.id === clickedHotspot)?.info}
                  </span>
                ) : (
                  <span>
                    No hotspot selected. Click any glowing target on the virtual screen above to read precise, professional structural details and room features instantly.
                  </span>
                )}
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
