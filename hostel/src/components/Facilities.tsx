/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ChefHat, Wifi, Shield, Zap, Sparkles, Check, Flame, ClipboardList, Coffee, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { HostelConfig } from '../types';

interface FacilitiesProps {
  config: HostelConfig;
}

export default function Facilities({ config }: FacilitiesProps) {
  const [kitchenTab, setKitchenTab] = useState<'cook' | 'equip' | 'save'>('cook');

  const kitchenHighlights = {
    cook: {
      title: config.kitchenCookTitle || 'Cook Healthy, Homestyle Meals',
      desc: config.kitchenCookDesc || 'No more forcing yourself to eat tasteless, expensive hostel mess food. Our self-cooking facility lets you prepare your own fresh, nutritious meals just like home, whenever you feel hungry.',
      bullets: config.kitchenCookBullets && config.kitchenCookBullets.length > 0 ? config.kitchenCookBullets : [
        'Accessible 24/7 for quick snacks or heavy meals',
        'Saves massive monthly mess costs (typically ₹3,000/mo saved)',
        'Great for students with specific dietary preferences or gym diets',
      ]
    },
    equip: {
      title: config.kitchenEquipTitle || 'Fully-Equipped Setup',
      desc: config.kitchenEquipDesc || 'The kitchen is pre-loaded with premium high-quality appliances and accessories, so you do not have to purchase heavy equipment.',
      bullets: config.kitchenEquipBullets && config.kitchenEquipBullets.length > 0 ? config.kitchenEquipBullets : [
        'High-speed induction cooktops and gas stoves',
        'Shared large double-door refrigerator to store milk, vegetables, and leftovers',
        'Basic cooking utensils, frying pans, and storage containers provided',
      ]
    },
    save: {
      title: config.kitchenSaveTitle || 'High Hygiene & Pure Water',
      desc: config.kitchenSaveDesc || 'We enforce strict cleanliness rules in the self-cooking area to ensure absolute food safety and comfortable cooking conditions.',
      bullets: config.kitchenSaveBullets && config.kitchenSaveBullets.length > 0 ? config.kitchenSaveBullets : [
        'Dedicated washing sink with premium dishwashing soap provided',
        'Daily deep cleaning of kitchen platforms and rubbish disposal by staff',
        'Industrial RO water purifier installed inside the kitchen area',
      ]
    }
  };

  const otherFacilities = [
    {
      icon: Wifi,
      title: config.wifiTitle || 'High-Speed Free Wi-Fi',
      desc: config.wifiDesc || '24/7 unlimited high-speed internet access tailored for your online lectures, college assignments, projects, and leisure streaming.',
      accent: 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-800',
    },
    {
      icon: Shield,
      title: config.securityTitle || '24/7 Security & CCTV',
      desc: config.securityDesc || 'Continuous round-the-clock surveillance monitoring via high-definition CCTV cameras. Strict entry logs protect your peace of mind.',
      accent: 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-800',
    },
    {
      icon: Zap,
      title: config.powerTitle || '24*7 Power Backup',
      desc: config.powerDesc || 'Uninterrupted electricity with robust inverter backup, ensuring your late-night studies and fan ventilation are never compromised.',
      accent: 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-800',
    },
    {
      icon: Sparkles,
      title: config.cleaningTitle || 'Daily Cleaning Service',
      desc: config.cleaningDesc || 'Spotless rooms, hallways, washrooms, and common spaces kept sparkling clean by our dedicated daily in-house housekeeping staff.',
      accent: 'border-slate-100 hover:border-slate-200 bg-slate-50 text-slate-800',
    },
  ];

  return (
    <section id="facilities" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4" id="facilities-header">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
            Premium Amenities
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            {config.facilitiesHeading || 'Comprehensive Facilities for Hassle-Free Living'}
          </h2>
          <p className="font-sans text-slate-600 text-sm max-w-xl mx-auto">
            {config.facilitiesSubheading || 'We handle the chores, internet, security, and power backups so you can focus entirely on your college studies and building your future.'}
          </p>
          <div className="w-12 h-1 bg-primary-600 mx-auto rounded-full"></div>
        </div>

        {/* Highlighted Feature - SELF-COOKING KITCHEN (Interactive Feature Showcase Card) */}
        {!config.hideKitchenSection && (
          <div className="mb-16" id="kitchen-spotlight-section">
            <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-sm border border-slate-800 text-white p-6 sm:p-10 lg:p-12 relative">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                {/* Left text spotlight */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 text-primary-300 rounded-md text-xs font-bold uppercase tracking-wider">
                    <ChefHat className="w-4 h-4" />
                    <span>Main Unique Feature</span>
                  </div>
                  
                  <h3 className="font-display font-black text-3xl sm:text-4xl leading-tight text-white">
                    {config.kitchenTitle || 'Our Self-Cooking Kitchen Facility'}
                  </h3>
                  
                  <p className="font-sans text-slate-300 text-sm sm:text-base leading-relaxed">
                    {config.kitchenDesc || 'A clean, fully accessible kitchen area so you can easily cook your own healthy, home-style meals anytime. Enjoy complete independence over your diet and save thousands every month!'}
                  </p>

                  {/* Micro tabs */}
                  <div className="flex flex-wrap gap-2 pt-2 bg-slate-900/60 p-1.5 rounded-full border border-slate-800">
                    <button
                      onClick={() => setKitchenTab('cook')}
                      className={`flex-1 min-w-[100px] text-xs font-semibold py-2.5 px-3 rounded-full transition-all cursor-pointer ${
                        kitchenTab === 'cook'
                          ? 'bg-slate-800 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Homestyle Cooking
                    </button>
                    <button
                      onClick={() => setKitchenTab('equip')}
                      className={`flex-1 min-w-[100px] text-xs font-semibold py-2.5 px-3 rounded-full transition-all cursor-pointer ${
                        kitchenTab === 'equip'
                          ? 'bg-slate-800 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Appliances Included
                    </button>
                    <button
                      onClick={() => setKitchenTab('save')}
                      className={`flex-1 min-w-[100px] text-xs font-semibold py-2.5 px-3 rounded-full transition-all cursor-pointer ${
                        kitchenTab === 'save'
                          ? 'bg-slate-800 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Hygiene & Water
                    </button>
                  </div>
                </div>

                {/* Right Details Block with smooth interactive transitions */}
                <div className="lg:col-span-7" id="kitchen-tab-details">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={kitchenTab}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.25 }}
                      className="bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/5 space-y-6"
                    >
                      <div>
                        <h4 className="font-display font-bold text-xl text-primary-300">
                          {kitchenHighlights[kitchenTab].title}
                        </h4>
                        <p className="font-sans text-slate-300 text-sm leading-relaxed mt-2">
                          {kitchenHighlights[kitchenTab].desc}
                        </p>
                      </div>

                      <div className="space-y-3.5 border-t border-white/10 pt-5">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Facility Details</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {kitchenHighlights[kitchenTab].bullets.map((bullet, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="p-1 rounded-full bg-primary-500/20 text-primary-300 mt-0.5 flex-shrink-0">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm text-slate-200 leading-tight">{bullet}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 flex flex-wrap items-center gap-4 text-xs text-primary-300 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                          <Flame className="w-3.5 h-3.5" />
                          <span>Gas & Induction</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                          <Coffee className="w-3.5 h-3.5" />
                          <span>RO Water System</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                          <Heart className="w-3.5 h-3.5" />
                          <span>Safe & Homely</span>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Standard Facilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="other-facilities-grid">
          {otherFacilities.map((f, i) => (
            <div
              key={i}
              className={`p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all group flex flex-col justify-between`}
            >
              <div className="space-y-4">
                <div className={`p-3 rounded-lg w-fit bg-slate-50 text-slate-800 border border-slate-100`}>
                  <f.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-display font-bold text-lg text-slate-900 group-hover:text-primary-600 transition-colors">
                  {f.title}
                </h4>
                <p className="font-sans text-slate-600 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-primary-600 group-hover:translate-x-1 transition-transform">
                <span>{config.facilityInclusionText || 'Included with stay'}</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
