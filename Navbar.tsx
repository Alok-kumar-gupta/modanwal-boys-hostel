/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Phone, 
  Lock, 
  Sun, 
  Moon, 
  Star, 
  GraduationCap, 
  Home, 
  Info, 
  Sparkles, 
  MessageSquareQuote, 
  Calculator, 
  Video, 
  HelpCircle, 
  Send,
  ChevronRight,
  ShieldCheck,
  Building2,
  CalendarCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HostelConfig } from '../types';

interface NavbarProps {
  onBookNowClick: () => void;
  config: HostelConfig;
  onOwnerClick: () => void;
  onStudentDashboardClick?: () => void;
  onSelfRegistrationClick?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onRateWebsiteClick?: () => void;
}

export default function Navbar({ 
  onBookNowClick, 
  config, 
  onOwnerClick, 
  onStudentDashboardClick, 
  onSelfRegistrationClick,
  theme, 
  onToggleTheme, 
  onRateWebsiteClick 
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navSections = [
    { 
      name: 'Home', 
      hindiName: 'मुख्य पृष्ठ', 
      href: '#home', 
      icon: Home,
      description: 'परिचय व मुख्य द्वार'
    },
    { 
      name: 'About Us', 
      hindiName: 'हमारे बारे में', 
      href: '#about', 
      icon: Info,
      description: 'हॉस्टल का इतिहास व स्थान'
    },
    { 
      name: 'Facilities', 
      hindiName: 'सुविधाएं व व्यवस्था', 
      href: '#facilities', 
      icon: Sparkles,
      description: 'RO पानी, वाई-फाई, सुरक्षा'
    },
    { 
      name: 'Reviews & Ratings', 
      hindiName: 'छात्र समीक्षाएं', 
      href: '#testimonials', 
      icon: MessageSquareQuote,
      description: 'छात्रों के अनुभव व रेटिंग'
    },
    { 
      name: 'Rent Estimator', 
      hindiName: 'किराया कैलकुलेटर', 
      href: '#estimator', 
      icon: Calculator,
      description: 'सिंगल/डबल रूम का अनुमान'
    },
    { 
      name: 'FAQ', 
      hindiName: 'अक्सर पूछे जाने वाले सवाल', 
      href: '#faq', 
      icon: HelpCircle,
      description: 'नियम, किराया व रिफंड पॉलिसी'
    },
    { 
      name: 'Contact & Inquiry', 
      hindiName: 'संपर्क व पूछताछ', 
      href: '#contact', 
      icon: Send,
      description: 'एडमिशन फॉर्म व पता'
    },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* ================= STICKY TOP NAVBAR BAR ================= */}
      <nav
        id="main-nav"
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border-b border-slate-200/80 dark:border-slate-800 py-3'
            : 'bg-white/70 dark:bg-slate-950/70 backdrop-blur-xs py-4 border-b border-slate-200/40 dark:border-slate-800/40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            
            {/* Left: Brand Logo & Title */}
            <a
              href="#home"
              onClick={(e) => handleLinkClick(e, '#home')}
              className="flex items-center gap-2.5 group focus:outline-none shrink-0"
              id="nav-brand"
            >
              <div 
                className="relative w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-tr from-primary-700 via-primary-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-all duration-300 border border-primary-400/30 overflow-hidden" 
                id="navbar-brand-logo"
              >
                <div className="absolute inset-1 border border-white/20 rounded-xl pointer-events-none"></div>
                <span className="font-display font-black text-2xl text-white tracking-wider leading-none drop-shadow-md select-none">
                  {config.hostelName ? config.hostelName.charAt(0) : 'M'}
                </span>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center border border-white shadow-xs">
                  <span className="text-[8px] text-amber-950 font-black leading-none">★</span>
                </div>
              </div>

              <div>
                <span className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight block leading-none uppercase">
                  {config.hostelName ? config.hostelName.split(' ')[0] : 'MODANWAL'}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-primary-600 dark:text-primary-400 uppercase block mt-0.5">
                  {config.hostelName ? config.hostelName.split(' ').slice(1).join(' ') : 'Boys Hostel'}
                </span>
              </div>
            </a>

            {/* Quick Badges / Status (Desktop) */}
            <div className="hidden xl:flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-3xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {config.admissionsText || '2024-25 Admissions Open'}
              </span>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3" id="navbar-actions-group">
              
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition-all cursor-pointer flex items-center justify-center border border-slate-200 dark:border-slate-700"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                id="theme-toggle-btn"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>

              {/* Student Portal Quick Button (Desktop / Tablet) */}
              {onStudentDashboardClick && (
                <button
                  type="button"
                  onClick={onStudentDashboardClick}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 px-3 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all cursor-pointer shadow-3xs"
                  id="nav-student-dashboard-btn"
                  title="Open Student Dashboard"
                >
                  <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Student Portal</span>
                </button>
              )}

              {/* Owner Area Button (Desktop) */}
              <button
                type="button"
                onClick={onOwnerClick}
                className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                id="nav-owner-btn"
                title="Owner & Admin Dashboard"
              >
                <Lock className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                <span>Owner Area</span>
              </button>

              {/* Book Room Now Button (Desktop / Tablet) */}
              <button
                type="button"
                onClick={onBookNowClick}
                className="hidden md:inline-flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-sans text-xs font-extrabold px-4 py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm cursor-pointer"
                id="nav-book-btn"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Book Room</span>
              </button>

              {/* ================= 3-LINE HAMBURGER MENU BUTTON ================= */}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm py-2 px-3 sm:px-4 rounded-xl shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition-all cursor-pointer border border-primary-400/30"
                id="main-3line-menu-toggle"
                aria-label="Open 3-line navigation menu"
                title="Open All Navigation Bars & Menus (3-Line Menu)"
              >
                <div className="flex flex-col gap-1 w-4 sm:w-4.5 justify-center items-center py-0.5">
                  <span className="block w-full h-0.5 bg-white rounded-full"></span>
                  <span className="block w-full h-0.5 bg-white rounded-full"></span>
                  <span className="block w-full h-0.5 bg-white rounded-full"></span>
                </div>
                <span className="font-bold tracking-wide">Menu (मेन्यू)</span>
              </button>

            </div>
          </div>
        </div>
      </nav>

      {/* ================= 3-LINE FULL DRAWER / SLIDE-OVER MODAL ================= */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end" id="unified-menu-drawer-container">
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
              id="menu-drawer-backdrop"
            />

            {/* Sliding Drawer Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md sm:max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl z-10 flex flex-col border-l border-slate-200 dark:border-slate-800 overflow-hidden"
              id="menu-drawer-panel"
            >
              {/* Drawer Top Header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-display font-black text-xl shadow-md">
                    {config.hostelName ? config.hostelName.charAt(0) : 'M'}
                  </div>
                  <div>
                    <h3 className="font-display font-black text-base text-slate-900 dark:text-white uppercase leading-tight">
                      {config.hostelName || 'Modanwal Boys Hostel'}
                    </h3>
                    <p className="text-[11px] font-bold text-primary-600 dark:text-primary-400">
                      नेविगेशन मेन्यू (All Navigation Bars)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-xl bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                  title="Close Menu (Esc)"
                  id="close-menu-drawer-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
                
                {/* Admissions Alert Banner in Drawer */}
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        {config.admissionsText || '2024-25 Admissions Open'}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        सीमित सीटें उपलब्ध हैं • तुरंत बुक करें
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onBookNowClick();
                    }}
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg hover:bg-emerald-200 cursor-pointer"
                  >
                    Book
                  </button>
                </div>

                {/* Section 1: All Main Page Navigation Links */}
                <div>
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      मुख्य पृष्ठ और अनुभाग (Sections)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">8 Bars Fixed</span>
                  </div>

                  <div className="space-y-1.5" id="drawer-main-links">
                    {navSections.map((sec) => {
                      const IconComp = sec.icon;
                      return (
                        <a
                          key={sec.name}
                          href={sec.href}
                          onClick={(e) => handleLinkClick(e, sec.href)}
                          className="group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl hover:bg-primary-50 dark:hover:bg-slate-800/80 transition-all border border-transparent hover:border-primary-100 dark:hover:border-slate-700"
                          id={`drawer-link-${sec.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-primary-600 group-hover:text-white flex items-center justify-center transition-all shadow-3xs">
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                                {sec.name} <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">({sec.hindiName})</span>
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                {sec.description}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Portals & Dedicated Tools */}
                <div>
                  <div className="mb-2.5 px-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      पोर्टल व विशेष टूल्स (Portals & Tools)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* Student Dashboard Portal Button */}
                    {onStudentDashboardClick && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          onStudentDashboardClick();
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/80 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/60 transition-all text-left cursor-pointer"
                        id="drawer-student-dashboard-btn"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-black text-indigo-900 dark:text-indigo-200">
                              Student Dashboard (छात्र पोर्टल)
                            </div>
                            <div className="text-[10px] text-indigo-700/80 dark:text-indigo-300">
                              किराया रसीद, आईडी कार्ड, वाई-फाई व रिकॉर्ड
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </button>
                    )}

                    {/* Self-Registration / QR Admission Button */}
                    {onSelfRegistrationClick && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          onSelfRegistrationClick();
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 transition-all text-left cursor-pointer"
                        id="drawer-self-registration-btn"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-200">
                              New Admission Form (छात्र स्व-पंजीकरण)
                            </div>
                            <div className="text-[10px] text-emerald-700/80 dark:text-emerald-300">
                              QR कोड या ऑनलाइन फॉर्म द्वारा तत्काल प्रवेश
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </button>
                    )}

                    {/* Owner & Admin Area Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onOwnerClick();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all text-left cursor-pointer"
                      id="drawer-owner-dashboard-btn"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 text-white dark:bg-slate-700 flex items-center justify-center shadow-xs">
                          <Lock className="w-4 h-4 text-primary-400" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                            Owner / Admin Portal (मालिक पोर्टल)
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            डेटाबेस नियंत्रण, छात्र रजिस्टर, रूम सेटिंग्स
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    {/* Rate Website Button */}
                    {onRateWebsiteClick && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          onRateWebsiteClick();
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 transition-all text-left cursor-pointer"
                        id="drawer-rate-website-btn"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                            <Star className="w-4 h-4 fill-white" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-200">
                              Rate Website & Share Feedback
                            </div>
                            <div className="text-[10px] text-amber-700/80 dark:text-amber-300">
                              वेबसाइट अनुभव व फीडबैक साझा करें
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Section 3: Theme Toggle & Quick Controls */}
                <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                      <span>Theme Mode (डार्क / लाइट मोड)</span>
                    </span>
                    <button
                      type="button"
                      onClick={onToggleTheme}
                      className="px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-3xs cursor-pointer"
                    >
                      {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                    </button>
                  </div>
                </div>

              </div>

              {/* Drawer Bottom Sticky Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shrink-0 shadow-lg">
                <a
                  href={`tel:${config.phone.replace(/[^0-9]/g, '')}`}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  id="drawer-call-btn"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>हॉस्टल हेल्पलाइन: {config.phone}</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onBookNowClick();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-primary-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  id="drawer-book-now-btn"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>अभी कमरा बुक करें (Book Room Now)</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

