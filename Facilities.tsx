/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  ChefHat, 
  UtensilsCrossed,
  Wifi, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Check, 
  Flame, 
  Coffee, 
  Heart,
  BatteryCharging,
  Droplets,
  Refrigerator,
  Lock,
  ArrowRight
} from 'lucide-react';
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
      tag: 'High Speed',
      title: config.wifiTitle || 'High-Speed Free Wi-Fi',
      desc: config.wifiDesc || '24/7 unlimited high-speed fiber internet tailored for online lectures, college coding projects, assignments, and smooth video streaming.',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-800',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      highlight: 'Dual-Band 5GHz Mesh'
    },
    {
      icon: Zap,
      secondaryIcon: BatteryCharging,
      tag: '24/7 Active',
      title: config.powerTitle || '24*7 Power Backup',
      desc: config.powerDesc || 'Uninterrupted electricity with heavy-duty inverter power backup, ensuring your late-night exams prep and room fans are never interrupted.',
      iconBg: 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800',
      badgeBg: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      highlight: 'Zero Downtime Inverter'
    },
    {
      icon: ShieldCheck,
      secondaryIcon: Lock,
      tag: 'Safe & Secure',
      title: config.securityTitle || '24/7 Security & CCTV',
      desc: config.securityDesc || 'Continuous round-the-clock surveillance monitoring via HD CCTV cameras and strict entry logs to ensure complete student safety.',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      highlight: 'HD Surveillance & Gate Logs'
    },
    {
      icon: Sparkles,
      secondaryIcon: Droplets,
      tag: 'Hygienic',
      title: config.cleaningTitle || 'Daily Cleaning & RO Water',
      desc: config.cleaningDesc || 'Spotless rooms, sanitized washrooms, pure RO drinking water, and common spaces kept sparkling clean by dedicated daily staff.',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-600 dark:text-cyan-400 border-cyan-200/80 dark:border-cyan-800',
      badgeBg: 'bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      highlight: 'Daily Staff Housekeeping'
    },
  ];

  return (
    <section id="facilities" className="py-24 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4" id="facilities-header">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
            <span>Premium Modern Amenities</span>
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
            {config.facilitiesHeading || 'Comprehensive Facilities for Hassle-Free Living'}
          </h2>
          <p className="font-sans text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {config.facilitiesSubheading || 'We handle the cooking kitchen, high-speed Wi-Fi, power backups, and security so you can focus 100% on your studies at SRMU.'}
          </p>
        </div>

        {/* Highlighted Feature - SELF-COOKING KITCHEN (Interactive Feature Showcase Card) */}
        {!config.hideKitchenSection && (
          <div className="mb-16" id="kitchen-spotlight-section">
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/80 rounded-3xl overflow-hidden shadow-xl border border-slate-800 text-white p-6 sm:p-10 lg:p-12 relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                {/* Left text spotlight */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider">
                    <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
                    <span>#1 Unique Highlight • Self-Cooking</span>
                  </div>
                  
                  <h3 className="font-display font-black text-3xl sm:text-4xl leading-tight text-white">
                    {config.kitchenTitle || 'Our Self-Cooking Kitchen Facility'}
                  </h3>
                  
                  <p className="font-sans text-slate-300 text-sm sm:text-base leading-relaxed">
                    {config.kitchenDesc || 'A clean, fully accessible kitchen area so you can easily cook your own healthy, home-style meals anytime. Enjoy complete independence over your diet and save thousands every month!'}
                  </p>

                  {/* Micro tabs */}
                  <div className="flex flex-wrap gap-2 pt-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
                    <button
                      onClick={() => setKitchenTab('cook')}
                      className={`flex-1 min-w-[100px] text-xs font-semibold py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        kitchenTab === 'cook'
                          ? 'bg-emerald-600 text-white font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Homestyle Cooking</span>
                    </button>
                    <button
                      onClick={() => setKitchenTab('equip')}
                      className={`flex-1 min-w-[100px] text-xs font-semibold py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        kitchenTab === 'equip'
                          ? 'bg-emerald-600 text-white font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Refrigerator className="w-3.5 h-3.5" />
                      <span>Appliances</span>
                    </button>
                    <button
                      onClick={() => setKitchenTab('save')}
                      className={`flex-1 min-w-[100px] text-xs font-semibold py-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        kitchenTab === 'save'
                          ? 'bg-emerald-600 text-white font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Droplets className="w-3.5 h-3.5" />
                      <span>Pure RO Water</span>
                    </button>
                  </div>
                </div>

                {/* Right Details Block with smooth interactive transitions */}
                <div className="lg:col-span-7" id="kitchen-tab-details">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={kitchenTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-inner"
                    >
                      <div>
                        <h4 className="font-display font-bold text-xl text-emerald-300 flex items-center gap-2">
                          <ChefHat className="w-5 h-5 text-emerald-400" />
                          <span>{kitchenHighlights[kitchenTab].title}</span>
                        </h4>
                        <p className="font-sans text-slate-300 text-sm leading-relaxed mt-2">
                          {kitchenHighlights[kitchenTab].desc}
                        </p>
                      </div>

                      <div className="space-y-3.5 border-t border-white/10 pt-5">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kitchen Highlights</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {kitchenHighlights[kitchenTab].bullets.map((bullet, i) => (
                            <div key={i} className="flex items-start gap-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
                              <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-300 mt-0.5 flex-shrink-0">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs text-slate-200 leading-snug">{bullet}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-emerald-300 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          <span>Gas & Induction</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                          <Coffee className="w-3.5 h-3.5 text-cyan-400" />
                          <span>RO Drinking Water</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                          <Heart className="w-3.5 h-3.5 text-rose-400" />
                          <span>Homely Atmosphere</span>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Standard Distinct Facilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="other-facilities-grid">
          {otherFacilities.map((f, i) => {
            const IconComponent = f.icon;
            return (
              <div
                key={i}
                className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Distinct Modern Icon Header */}
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xs transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-md ${f.iconBg}`}>
                      <IconComponent className="w-7 h-7 transition-transform duration-300 group-hover:scale-105" strokeWidth={2.2} />
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wide transition-transform duration-300 group-hover:scale-105 ${f.badgeBg}`}>
                      {f.tag}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <h4 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {f.title}
                    </h4>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                      {f.highlight}
                    </span>
                  </div>

                  <p className="font-sans text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{config.facilityInclusionText || 'Free with stay'}</span>
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

