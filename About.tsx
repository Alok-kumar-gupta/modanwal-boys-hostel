/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Home, User, Users, MapPin, Navigation, Compass, Sparkles, BedDouble } from 'lucide-react';
import { motion } from 'motion/react';
import { HostelConfig } from '../types';

interface AboutProps {
  config: HostelConfig;
}

export default function About({ config }: AboutProps) {
  const [selectedRoomTab, setSelectedRoomTab] = useState<'single' | 'twin' | 'full'>(() => {
    if (config.hideSingleOccupancy && !config.hideTwinSharing) return 'twin';
    if (config.hideSingleOccupancy && config.hideTwinSharing && !config.hideFullRoomOccupancy) return 'full';
    return 'single';
  });

  useEffect(() => {
    if (config.hideSingleOccupancy && !config.hideTwinSharing) {
      setSelectedRoomTab('twin');
    } else if (config.hideTwinSharing && !config.hideSingleOccupancy) {
      setSelectedRoomTab('single');
    }
  }, [config.hideSingleOccupancy, config.hideTwinSharing]);

  const defaultSingleFeatures = [
    'Personal Wooden Bed with Storage',
    'Large Fitted Study Table with Book Shelves',
    'Spacious Private Wardrobe with Lock',
    'Adequate Ventilation with Windows & Ceiling Fan',
    'Dedicated Charging Sockets beside Study Desk',
  ];

  const defaultTwinFeatures = [
    'Twin Single Beds with Storage drawers',
    'Two Separate Study Tables & Chairs',
    'Individual Double Wardrobes',
    'Ample natural light & fresh air ventilation',
    'Shared utility shelves & multiple charging sockets',
  ];

  const defaultFullRoomFeatures = [
    'Complete Entire Private Room (निजी पूरा कमra)',
    'Dual/King Size Bedding or 2 Single Beds (Single Resident Use)',
    'Full Executive Study Setup & Multiple Wardrobes',
    'Maximum Privacy & Quiet Ambience for Higher Studies',
    'Direct Window Ventilation & Personalized Room Key',
  ];

  const roomDetails = {
    single: {
      title: 'Single Occupancy Room',
      subtitle: '1-Seater Cozy Focus Sanctuary',
      icon: User,
      desc: 'Our single occupancy rooms offer absolute privacy, designed meticulously for students who want deep focus, quiet study sessions, and personal space. Ideal for senior students and exam preparation.',
      amenities: config.aboutSingleFeatures && config.aboutSingleFeatures.length > 0 ? config.aboutSingleFeatures : defaultSingleFeatures,
      pricing: config.singleRoomRent === 0 ? '₹00 / month' : `₹${config.singleRoomRent} / month`,
    },
    twin: {
      title: 'Twin-Sharing Room',
      subtitle: '2-Seater Premium Double Room',
      icon: Users,
      desc: 'Our companion rooms are perfect for sharing with friends or classmate peers. Designed with balanced layout separations, ensuring both residents enjoy equal comfort, individual storage, and independent study desks.',
      amenities: config.aboutTwinFeatures && config.aboutTwinFeatures.length > 0 ? config.aboutTwinFeatures : defaultTwinFeatures,
      pricing: config.twinRoomRent === 0 ? '₹00 / month' : `₹${config.twinRoomRent} / month`,
    },
    full: {
      title: 'Full Private Room (निजी पूरा कमरा)',
      subtitle: 'Entire Private Room Dedicated to You',
      icon: BedDouble,
      desc: 'Book the entire full room exclusively for yourself without sharing. Enjoy absolute personal freedom, extra space, multiple study tables, and large storage for total privacy and focus.',
      amenities: config.aboutFullFeatures && config.aboutFullFeatures.length > 0 ? config.aboutFullFeatures : defaultFullRoomFeatures,
      pricing: (config.fullRoomRent === 0 || !config.fullRoomRent) ? '₹00 / month' : `₹${config.fullRoomRent} / month`,
    },
  };

  const currentRoom = roomDetails[selectedRoomTab];

  // SRMU proximity milestones
  const locations = [
    { 
      name: config.landmark1Name || 'SRMU Main Entrance Gate', 
      dist: config.landmark1Dist || '300 meters', 
      walking: config.landmark1Walking || '3 mins', 
      cycle: config.landmark1Cycle || '1 min' 
    },
    { 
      name: config.landmark2Name || 'Tindola Local Market', 
      dist: config.landmark2Dist || '150 meters', 
      walking: config.landmark2Walking || '1.5 mins', 
      cycle: config.landmark2Cycle || '30 secs' 
    },
    { 
      name: config.landmark3Name || 'Barabanki Railway Station', 
      dist: config.landmark3Dist || '12 km', 
      walking: config.landmark3Walking || '2.5 hrs', 
      cycle: config.landmark3Cycle || '35 mins',
      transport: config.landmark3Transport || '15 mins auto' 
    },
    { 
      name: config.landmark4Name || 'Lucknow Chinhat Crossing', 
      dist: config.landmark4Dist || '18 km', 
      walking: config.landmark4Walking || '4 hrs', 
      cycle: config.landmark4Cycle || '55 mins',
      transport: config.landmark4Transport || '25 mins bus' 
    },
  ];

  return (
    <section id="about" className="py-24 bg-slate-50/50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* About Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4" id="about-heading-container">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
            {config.aboutTagline || `Welcome to ${config.hostelName ? config.hostelName.split(' ')[0] : 'Modanwal'}`}
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            {config.aboutHeading || 'Designed for Comfort, Built for Study'}
          </h2>
          <div className="w-12 h-1 bg-primary-600 mx-auto rounded-full"></div>
        </div>

        {/* Introduction & Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" id="about-content-grid">
          
          {/* Left Description Column */}
          <div className="lg:col-span-6 space-y-8" id="about-left-intro">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 space-y-6 shadow-sm">
              <h3 className="font-display font-bold text-2xl text-slate-800 leading-tight">
                Welcome to {config.hostelName}
              </h3>
              <p className="font-sans text-slate-600 text-base leading-relaxed">
                {config.aboutIntro || 'We provide a peaceful, secure, and budget-friendly environment for students studying near SRMU. We offer well-maintained Single and Twin-sharing (2-seater) Non-AC rooms designed for your comfort and focus.'}
              </p>
              
              <div className="border-t border-slate-100 pt-6 grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 text-slate-700 border border-slate-100 rounded-lg mt-0.5">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Peaceful Area</h4>
                    <p className="text-xs text-slate-500">Minimal noise pollution</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 text-slate-700 border border-slate-100 rounded-lg mt-0.5">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Clean Space</h4>
                    <p className="text-xs text-slate-500">Regular house-cleaning</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Proximity / Location Helper Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 space-y-6 shadow-sm" id="proximity-card">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-900">Hostel Location & Proximity</h3>
                  <p className="text-xs text-slate-500">Tindola, Barabanki (Near SRMU Campus)</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {locations.map((loc, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/50 transition-colors border border-slate-100"
                  >
                    <div>
                      <span className="block text-sm font-semibold text-slate-800">{loc.name}</span>
                      <span className="block text-xs text-slate-500">Distance: {loc.dist}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 sm:mt-0 text-xs text-slate-700 font-semibold bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                      <Navigation className="w-3.5 h-3.5 text-primary-600" />
                      <span>{loc.walking} walking • {loc.cycle} cycle</span>
                      {loc.transport && <span className="text-primary-700 font-bold">({loc.transport})</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Room Option Visuals */}
          <div className="lg:col-span-6 space-y-6" id="about-right-rooms">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-display font-bold text-xl text-slate-900 mb-4">
                Explore Our Room Configurations
              </h3>
              
              {/* Tabs for Room selection */}
              {(!config.hideSingleOccupancy || !config.hideTwinSharing || !config.hideFullRoomOccupancy) && (
                <div className="flex bg-slate-100 p-1 rounded-2xl sm:rounded-full mb-6 flex-wrap sm:flex-nowrap gap-1">
                  {!config.hideSingleOccupancy && (
                    <button
                      onClick={() => setSelectedRoomTab('single')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        selectedRoomTab === 'single'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      id="tab-single"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Single Room</span>
                    </button>
                  )}
                  {!config.hideTwinSharing && (
                    <button
                      onClick={() => setSelectedRoomTab('twin')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        selectedRoomTab === 'twin'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      id="tab-twin"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Twin-Sharing</span>
                    </button>
                  )}
                  {!config.hideFullRoomOccupancy && (
                    <button
                      onClick={() => setSelectedRoomTab('full')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        selectedRoomTab === 'full'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      id="tab-full"
                    >
                      <BedDouble className="w-3.5 h-3.5" />
                      <span>Full Room (निजी)</span>
                    </button>
                  )}
                </div>
              )}

              {/* Room Tab Content */}
              <motion.div
                key={selectedRoomTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
                id="room-tab-content"
              >
                {/* Dynamic Uploaded Room Image or Premium Default */}
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-900 border border-slate-200 shadow-inner flex items-center justify-center">
                  {selectedRoomTab === 'single' ? (
                    config.photoSingle ? (
                      <img 
                        src={config.photoSingle} 
                        alt="Single Occupancy Room" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col justify-between p-6">
                        <div className="text-white/40 text-[10px] font-mono uppercase tracking-wider">No Custom Single Room Photo Uploaded Yet</div>
                        <div className="space-y-1 text-white">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-primary-400">Single Focus Suite</span>
                          <p className="font-display font-extrabold text-lg leading-tight">Comfortable Desk, Wardrobe & Bed Setup</p>
                        </div>
                      </div>
                    )
                  ) : selectedRoomTab === 'full' ? (
                    config.photoFull ? (
                      <img 
                        src={config.photoFull} 
                        alt="Full Private Room" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col justify-between p-6">
                        <div className="text-white/40 text-[10px] font-mono uppercase tracking-wider">No Custom Full Room Photo Uploaded Yet</div>
                        <div className="space-y-1 text-white">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400">Full Private Room</span>
                          <p className="font-display font-extrabold text-lg leading-tight">Complete Private Room (निजी पूरा कमरा)</p>
                        </div>
                      </div>
                    )
                  ) : (
                    config.photoTwin ? (
                      <img 
                        src={config.photoTwin} 
                        alt="Twin Sharing Room" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col justify-between p-6">
                        <div className="text-white/40 text-[10px] font-mono uppercase tracking-wider">No Custom Twin Sharing Photo Uploaded Yet</div>
                        <div className="space-y-1 text-white">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">Twin Sharing Room</span>
                          <p className="font-display font-extrabold text-lg leading-tight">Shared Rooms, Individual Study Tables</p>
                        </div>
                      </div>
                    )
                  )}
                </div>

                 <div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-display font-black text-2xl text-slate-900">{currentRoom.title}</h4>
                      {/* Room Occupancy Status Badge */}
                      {selectedRoomTab === 'single' ? (
                        config.isSingleFull ? (
                          <span className="text-[10px] font-black tracking-wide text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded uppercase font-mono">Full (भरी हुई)</span>
                        ) : (
                          <span className="text-[10px] font-black tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase font-mono">Available (उपलब्ध)</span>
                        )
                      ) : selectedRoomTab === 'full' ? (
                        config.isFullRoomFull ? (
                          <span className="text-[10px] font-black tracking-wide text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded uppercase font-mono">Full (भरी हुई)</span>
                        ) : (
                          <span className="text-[10px] font-black tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase font-mono">Available (उपलब्ध)</span>
                        )
                      ) : (
                        config.isTwinFull ? (
                          <span className="text-[10px] font-black tracking-wide text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded uppercase font-mono">Full (भरी हुई)</span>
                        ) : (
                          <span className="text-[10px] font-black tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase font-mono">Available (उपलब्ध)</span>
                        )
                      )}
                    </div>
                    <span className="text-xs font-bold text-primary-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 uppercase tracking-wider">
                      Highly Requested
                    </span>
                  </div>
                  <p className="text-sm font-medium text-primary-600 mt-1">{currentRoom.subtitle}</p>
                </div>

                <p className="font-sans text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {currentRoom.desc}
                </p>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Room Inclusions</h5>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentRoom.amenities.map((amenity, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 mt-2 flex-shrink-0"></span>
                        <span>{amenity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing / Booking hint */}
                <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Starting From</span>
                    <span className="font-display font-extrabold text-2xl text-slate-900">{currentRoom.pricing}</span>
                  </div>
                  <a
                    href="#contact"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 px-6 rounded-full transition-colors inline-block"
                  >
                    Check Availability
                  </a>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
