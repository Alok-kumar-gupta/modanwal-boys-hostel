/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X, Shield, Phone, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HostelConfig } from '../types';

interface NavbarProps {
  onBookNowClick: () => void;
  config: HostelConfig;
  onOwnerClick: () => void;
}

export default function Navbar({ onBookNowClick, config, onOwnerClick }: NavbarProps) {
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

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Facilities', href: '#facilities' },
    { name: 'Interactive Estimator', href: '#estimator' },
    { name: 'Virtual Tour', href: '#tour' },
    { name: 'Contact', href: '#contact' },
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
    <nav
      id="main-nav"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Brand */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, '#home')}
            className="flex items-center gap-2 group focus:outline-none"
            id="nav-brand"
          >
            <div className="relative w-11 h-11 bg-gradient-to-tr from-primary-700 via-primary-600 to-indigo-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-primary-200/50 group-hover:shadow-lg group-hover:shadow-primary-300/60 transition-all duration-300 group-hover:scale-105 border border-primary-500/30 overflow-hidden" id="navbar-brand-logo">
              {/* Subtle background glow pattern */}
              <div className="absolute -inset-1 bg-white/10 rounded-xl blur-sm opacity-50"></div>
              
              {/* Inner geometric accent lines */}
              <div className="absolute inset-1 border border-white/20 rounded-lg pointer-events-none"></div>
              
              {/* Elegant, stylized monogram M */}
              <span className="relative font-display font-black text-2.5xl text-white tracking-wider leading-none drop-shadow-md select-none">
                {config.hostelName ? config.hostelName.charAt(0) : 'M'}
              </span>

              {/* Decorative small amber/gold star rating in corner */}
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center border border-white shadow-sm scale-90">
                <span className="text-[8px] text-amber-950 font-bold leading-none">★</span>
              </div>
            </div>
            <div>
              <span className="font-display font-extrabold text-lg text-slate-800 tracking-tight block leading-none uppercase">
                {config.hostelName ? config.hostelName.split(' ')[0] : 'MODANWAL'}
              </span>
              <span className="text-[10px] font-bold tracking-widest text-primary-600 uppercase">
                {config.hostelName ? config.hostelName.split(' ').slice(1).join(' ') : 'Boys Hostel'}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium" id="desktop-nav-menu">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="font-sans text-slate-500 hover:text-primary-600 transition-colors focus:outline-none py-1"
                id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Call to Action */}
          <div className="hidden md:flex items-center gap-6" id="desktop-nav-cta">
            <button
              onClick={onOwnerClick}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              id="nav-owner-btn"
            >
              <Lock className="w-3.5 h-3.5 text-primary-600" />
              <span>Owner Area</span>
            </button>
            <span className="hidden lg:inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full border border-primary-100">
              {config.admissionsText || 'Accepting 2024-25 Admissions'}
            </span>
            <a
              href={`tel:${config.phone.replace(/[^0-9]/g, '')}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary-600 transition-colors"
              id="nav-call-btn"
            >
              <Phone className="w-4 h-4 text-primary-600" />
              <span>{config.phone}</span>
            </a>
            <button
              onClick={onBookNowClick}
              className="bg-slate-900 text-white font-sans text-sm font-bold px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all focus:outline-none cursor-pointer"
              id="nav-book-btn"
            >
              Book Room
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center" id="mobile-menu-toggle-container">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-primary-600 p-2 rounded-lg hover:bg-gray-50 focus:outline-none"
              id="mobile-menu-toggle"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 shadow-lg overflow-hidden"
            id="mobile-nav-menu"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="block px-3 py-2.5 rounded-xl text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all"
                  id={`mobile-nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.name}
                </a>
              ))}
              <div className="border-t border-gray-100 pt-4 mt-2 space-y-3">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOwnerClick();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-gray-700 hover:text-primary-600 w-full text-left"
                >
                  <Lock className="w-5 h-5 text-primary-600" />
                  <span>Owner Dashboard Panel</span>
                </button>
                <a
                  href={`tel:${config.phone.replace(/[^0-9]/g, '')}`}
                  className="flex items-center gap-3 px-3 py-2.5 text-base font-semibold text-gray-700 hover:text-primary-600"
                  id="mobile-nav-call"
                >
                  <Phone className="w-5 h-5 text-primary-600" />
                  <span>Call {config.phone}</span>
                </a>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onBookNowClick();
                  }}
                  className="w-full bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-primary-700 transition-all text-center"
                  id="mobile-nav-book-btn"
                >
                  Book Your Room Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
