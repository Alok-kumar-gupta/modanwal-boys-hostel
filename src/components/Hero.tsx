/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, Sparkles, MapPin, ChefHat, Wifi, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { HostelConfig } from '../types';

interface HeroProps {
  onBookNowClick: () => void;
  config: HostelConfig;
}

export default function Hero({ onBookNowClick, config }: HeroProps) {
  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const highlights = [
    { icon: MapPin, text: 'Near SRMU Campus', desc: 'Tindola, Barabanki' },
    ...(!config.hideMainUniqueFeature ? [{ icon: ChefHat, text: 'Self-Cooking Kitchen', desc: 'Main Unique Feature' }] : []),
    { icon: Wifi, text: 'Free 24/7 High-Speed Wi-Fi', desc: 'Unlimited Access' },
    { icon: Zap, text: '24/7 Power Backup', desc: 'Uninterrupted Study' },
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen pt-28 pb-16 flex items-center bg-white overflow-hidden"
    >
      {/* Decorative background grid and shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8" id="hero-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap items-center gap-3"
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold uppercase tracking-wider rounded-md"
                id="hero-badge"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                <span>Premium Boys Accommodation</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
              id="hero-headings"
            >
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.1]">
                {config.hostelName} <br />
                <span className="text-primary-600">
                  – Your Home Near SRMU
                </span>
              </h1>
              <p className="font-sans text-lg text-slate-600 max-w-2xl leading-relaxed">
                Safe, comfortable, and affordable living for boys in Tindola, Barabanki. Enjoy 24/7 premium facilities and a homely environment.
              </p>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
              id="hero-ctas"
            >
              <button
                onClick={onBookNowClick}
                className="bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold text-base px-8 py-4 rounded-full transition-all text-center focus:outline-none cursor-pointer"
                id="hero-book-now-btn"
              >
                Book Your Room Now
              </button>
              <button
                onClick={() => scrollToSection('#facilities')}
                className="bg-white hover:bg-slate-50 text-slate-800 font-sans font-bold text-base px-8 py-4 rounded-full border border-slate-200 transition-all text-center focus:outline-none cursor-pointer"
                id="hero-explore-btn"
              >
                Explore Facilities
              </button>
            </motion.div>

            {/* Live Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50/50 backdrop-blur-md rounded-2xl border border-slate-100"
              id="hero-stats"
            >
              <div className="p-2 border-r border-slate-100 last:border-0">
                <span className="block font-display font-extrabold text-2xl text-slate-900">
                  {config.stat1Value || '300m'}
                </span>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {config.stat1Label || 'From SRMU'}
                </span>
              </div>
              <div className="p-2 sm:border-r border-slate-100 last:border-0">
                <span className="block font-display font-extrabold text-2xl text-slate-900">
                  {config.stat2Value || '24/7'}
                </span>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {config.stat2Label || 'Electricity'}
                </span>
              </div>
              <div className="p-2 border-r border-slate-100 last:border-0">
                <span className="block font-display font-extrabold text-2xl text-slate-900">
                  {config.stat3Value || 'Free'}
                </span>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {config.stat3Label || 'High Speed WiFi'}
                </span>
              </div>
              <div className="p-2 last:border-0">
                <span className="block font-display font-extrabold text-2xl text-slate-900">
                  {config.stat4Value || '1 & 2'}
                </span>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {config.stat4Label || 'Seater Rooms'}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Hero Right Visual Column */}
          <div className="lg:col-span-5 relative" id="hero-right">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 aspect-square md:aspect-[4/3] lg:aspect-square flex items-center justify-center bg-slate-900 p-8"
              id="hero-visual-card"
            >
              {/* Inner ambient pattern */}
              <div className="absolute inset-0 bg-grid-white opacity-5"></div>
              
              <div className="relative z-10 text-center text-white space-y-6">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
                  <Shield className="w-8 h-8 text-primary-400" />
                </div>
                <div>
                  <span className="block text-primary-400 text-xs font-bold uppercase tracking-widest mb-1">
                    Trusted Choice
                  </span>
                  <h3 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-white">
                    Perfect Environment for Focus & Academic Excellence
                  </h3>
                </div>
                
                {/* Horizontal high-fidelity highlights */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  {highlights.map((h, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl text-left border border-white/10"
                    >
                      <h.icon className="w-5 h-5 text-primary-400 mb-1.5" />
                      <p className="font-sans font-bold text-sm text-white leading-tight">{h.text}</p>
                      <p className="font-sans text-[11px] text-slate-400">{h.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
