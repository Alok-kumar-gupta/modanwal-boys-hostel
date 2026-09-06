/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shield, Phone, Mail, MapPin, Compass, ShieldCheck, Star, GraduationCap } from 'lucide-react';
import { HostelConfig } from '../types';

interface FooterProps {
  config: HostelConfig;
  onOwnerClick: () => void;
  onStudentDashboardClick?: () => void;
  onRateWebsiteClick?: () => void;
}

export default function Footer({ config, onOwnerClick, onStudentDashboardClick, onRateWebsiteClick }: FooterProps) {
  const handleScroll = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-900" id="hostel-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          
          {/* Column 1: Brand Info */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-2.5" id="footer-brand">
              <div className="relative w-11 h-11 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 text-white rounded-xl flex items-center justify-center shadow-lg border border-slate-800/80 overflow-hidden" id="footer-brand-logo">
                {/* Subtle background glow pattern */}
                <div className="absolute -inset-1 bg-primary-500/10 rounded-xl blur-sm opacity-50"></div>
                
                {/* Inner geometric accent lines */}
                <div className="absolute inset-1 border border-slate-800 rounded-lg pointer-events-none"></div>
                
                {/* Elegant, stylized monogram M */}
                <span className="relative font-display font-black text-2.5xl text-primary-400 tracking-wider leading-none select-none">
                  {config.hostelName ? config.hostelName.charAt(0) : 'M'}
                </span>

                {/* Decorative small amber/gold star rating in corner */}
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center border border-slate-950 shadow-sm scale-90">
                  <span className="text-[8px] text-white font-bold leading-none">★</span>
                </div>
              </div>
              <div>
                <span className="font-display font-extrabold text-lg text-white tracking-tight block leading-none uppercase">
                  {config.hostelName ? config.hostelName.split(' ')[0] : 'MODANWAL'}
                </span>
                <span className="text-[10px] font-bold tracking-widest text-primary-400 uppercase">
                  {config.hostelName ? config.hostelName.split(' ').slice(1).join(' ') : 'Boys Hostel'}
                </span>
              </div>
            </div>

            <p className="font-sans text-sm text-slate-400 leading-relaxed max-w-sm">
              Providing safe, peaceful, and budget-friendly student housing near SRMU. Designed to give male students the perfect focused environment to study, build skills, and succeed.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-300 font-bold bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4 text-primary-400" />
              <span>Certified Safe Student Residence</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-white">
              Quick Navigation
            </h4>
            <div className="flex flex-col gap-2.5 text-sm">
              {[
                { name: 'Home Landing', id: '#home' },
                { name: 'About Us', id: '#about' },
                { name: 'Hostel Facilities', id: '#facilities' },
                { name: 'Rent Estimator', id: '#estimator' },
                { name: 'Reserve / Inquire', id: '#contact' },
              ].map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleScroll(link.id)}
                  className="text-left text-slate-400 hover:text-white hover:underline transition-colors focus:outline-none cursor-pointer"
                >
                  {link.name}
                </button>
              ))}
              {onStudentDashboardClick && (
                <button
                  onClick={onStudentDashboardClick}
                  className="text-left text-indigo-400 hover:text-indigo-300 font-bold hover:underline transition-colors focus:outline-none cursor-pointer flex items-center gap-1.5 pt-1"
                  id="footer-student-dashboard-link"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Dashboard (छात्र डैशबोर्ड)</span>
                </button>
              )}
            </div>
          </div>

          {/* Column 3: Contact Details */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-white">
              Get in Touch (Direct)
            </h4>
            
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-200">Main Booking Line</p>
                  <a href={`tel:${config.phone.replace(/[^0-9]/g, '')}`} className="hover:text-white transition-colors block">
                    {config.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-200">Email Support</p>
                  <a href={`mailto:${config.email}`} className="hover:text-white transition-colors block">
                    {config.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-200">Address Location</p>
                  <p className="leading-relaxed">
                    Tindola, Barabanki, Uttar Pradesh (Near SRMU Main Entrance), India.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {config.hostelName}. All rights reserved.</p>
          <div className="flex gap-4 items-center">
            <span className="text-slate-400">Near SRMU Campus, Barabanki, UP</span>
            <span>•</span>
            <span className="text-slate-400">Self-Cooking Kitchen Spotlight</span>
            {onRateWebsiteClick && (
              <>
                <span>•</span>
                <button
                  onClick={onRateWebsiteClick}
                  className="text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  id="footer-rate-website-btn"
                >
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>Rate Our Website</span>
                </button>
              </>
            )}
            {onStudentDashboardClick && (
              <>
                <span>•</span>
                <button 
                  onClick={onStudentDashboardClick}
                  className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  id="footer-student-dashboard-btn"
                >
                  <GraduationCap className="w-3 h-3" />
                  <span>Student Portal</span>
                </button>
              </>
            )}
            <span>•</span>
            <button 
              onClick={onOwnerClick}
              className="text-slate-500 hover:text-slate-300 font-bold hover:underline cursor-pointer"
              id="footer-owner-btn"
            >
              Caretaker / Owner Area
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
