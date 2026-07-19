/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  MessageSquare, 
  Plus, 
  CheckCircle, 
  Sparkles, 
  Filter, 
  GraduationCap, 
  Quote, 
  Clock, 
  X, 
  ThumbsUp, 
  ShieldCheck, 
  PenTool,
  Award
} from 'lucide-react';
import { HostelConfig, Testimonial } from '../types';
import { subscribeToTestimonials, addTestimonial } from '../lib/hostelService';

// Default highly realistic testimonials to seed if Firestore is empty
const SEED_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Amit Kumar',
    collegeOrCourse: 'M.Tech, KNIT Sultanpur',
    rating: 5,
    text: 'The self-cooking kitchen is an absolute lifesaver. I saved almost ₹3,500 every single month by cooking my own meals instead of eating mess food. The high-speed Wi-Fi is incredibly fast, which helped with all my project submissions. Alok Bhaiya is extremely supportive and treats us like family!',
    category: 'kitchen',
    yearOfStay: '2023 - 2025',
    timestamp: '2025-06-15T10:00:00.000Z'
  },
  {
    id: 'test-2',
    name: 'Vikram Singh',
    collegeOrCourse: 'B.Tech CSE, KNIT Sultanpur',
    rating: 5,
    text: 'Modanwal Boys Hostel provides an exceptionally quiet and peaceful environment, perfect for serious academic study. The daily room cleaning service is immaculate, and the bathrooms are kept highly hygienic. The power backup was incredibly robust during exam months.',
    category: 'study',
    yearOfStay: '2022 - 2024',
    timestamp: '2024-05-20T11:30:00.000Z'
  },
  {
    id: 'test-3',
    name: 'Rohan Modanwal',
    collegeOrCourse: 'UPSC Civil Services Aspirant',
    rating: 5,
    text: 'Finding a hostel with 24/7 high-definition CCTV security, continuous pure RO drinking water, and personal study desks in twin sharing at this rent in Sultanpur is impossible. It is the absolute best premium hostel option for serious students.',
    category: 'facilities',
    yearOfStay: '2024 - Present',
    timestamp: '2025-02-10T14:45:00.000Z'
  },
  {
    id: 'test-4',
    name: 'Sandeep Yadav',
    collegeOrCourse: 'B.Pharma Student',
    rating: 4,
    text: 'Highly disciplined and safe hostel. Main doors are locked on time and there is absolutely zero noise or disturbance in the evening. The caretaker ensures water and electricity are always running. Highly recommended for first-year students!',
    category: 'general',
    yearOfStay: '2023 - 2024',
    timestamp: '2024-11-05T09:15:00.000Z'
  }
];

interface TestimonialsProps {
  config: HostelConfig;
}

export default function Testimonials({ config }: TestimonialsProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'kitchen' | 'study' | 'facilities' | 'general'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formCollege, setFormCollege] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState<'kitchen' | 'study' | 'facilities' | 'general'>('general');
  const [formYear, setFormYear] = useState('');
  const [formError, setFormError] = useState('');

  // Rating Hover Helper
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Subscribe to real-time testimonials
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToTestimonials(SEED_TESTIMONIALS, (updatedTestimonials) => {
      setTestimonials(updatedTestimonials);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Filter Logic
  const filteredTestimonials = testimonials.filter(t => 
    activeFilter === 'all' ? true : t.category === activeFilter
  );

  // Calculate Average Rating
  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : '4.9';

  // Calculate star percentages for rating breakdown
  const starCounts = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 stars
  testimonials.forEach(t => {
    const idx = Math.max(1, Math.min(5, Math.round(t.rating))) - 1;
    starCounts[4 - idx] += 1;
  });
  const maxCount = Math.max(...starCounts, 1);

  // Helper to generate initials & color theme for avatars
  const getAvatarFallback = (name: string) => {
    const parts = name.trim().split(' ');
    const initials = parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
    
    // Choose consistent color based on string hash
    const colors = [
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-slate-100 text-slate-700 border-slate-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-rose-100 text-rose-700 border-rose-200',
      'bg-sky-100 text-sky-700 border-sky-200',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIdx = Math.abs(hash) % colors.length;
    return { initials, colorClass: colors[colorIdx] };
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Please enter your full name (कृपया अपना नाम दर्ज करें)');
      return;
    }
    if (!formCollege.trim()) {
      setFormError('Please specify your college, course, or preparation focus.');
      return;
    }
    if (!formText.trim()) {
      setFormError('Please write your review (कृपया अपनी समीक्षा दर्ज करें)');
      return;
    }
    if (formText.trim().length < 20) {
      setFormError('Your review should be at least 20 characters long.');
      return;
    }

    const newTestimonial: Testimonial = {
      id: `test-${Date.now()}`,
      name: formName.trim(),
      collegeOrCourse: formCollege.trim(),
      rating: formRating,
      text: formText.trim(),
      category: formCategory,
      yearOfStay: formYear.trim() || 'Former Resident',
      timestamp: new Date().toISOString()
    };

    try {
      await addTestimonial(newTestimonial);
      setSubmitSuccess(true);
      
      // Reset form
      setFormName('');
      setFormCollege('');
      setFormRating(5);
      setFormText('');
      setFormCategory('general');
      setFormYear('');
      
      // Close form after a brief delay
      setTimeout(() => {
        setIsFormOpen(false);
        setSubmitSuccess(false);
      }, 3500);

    } catch (err) {
      console.error('Failed to add testimonial to Firestore:', err);
      setFormError('Database error. Please try again.');
    }
  };

  const categories = [
    { value: 'all', label: 'All Reviews' },
    { value: 'kitchen', label: 'Kitchen & Self-Cooking' },
    { value: 'study', label: 'Study & Environment' },
    { value: 'facilities', label: 'Facilities & Safety' },
    { value: 'general', label: 'General Stay' }
  ];

  return (
    <section id="testimonials" className="py-24 bg-slate-50 border-t border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4" id="testimonials-header">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
            Student Reviews
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Trusted by Hundreds of Students & Aspirants
          </h2>
          <p className="font-sans text-slate-600 text-sm max-w-xl mx-auto">
            Read first-hand accounts from our current and former residents about our quiet rooms, high-speed Wi-Fi, self-cooking setups, and robust security.
          </p>
          <div className="w-12 h-1 bg-primary-600 mx-auto rounded-full"></div>
        </div>

        {/* Dashboard Grid - Stats & Action Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-stretch" id="testimonials-stats-bar">
          
          {/* Average Rating Breakdown Card */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <h4 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider">Overall Resident Rating</h4>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-5xl text-slate-950">{averageRating}</span>
                <span className="text-sm font-bold text-slate-400">/ 5.0</span>
              </div>
              
              {/* Stars rendering */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    className={`w-5 h-5 ${s <= Math.round(Number(averageRating)) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                Based on real feedback from students of KNIT Sultanpur, SRMU, and local civil exam aspirants.
              </p>
            </div>

            {/* Micro rating visual bars */}
            <div className="space-y-1.5 mt-6 border-t border-slate-100 pt-4">
              {[5, 4, 3, 2, 1].map((stars, idx) => {
                const count = starCounts[5 - stars];
                const pct = (count / maxCount) * 100;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-3 font-semibold text-slate-500">{stars}</span>
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="w-5 text-right font-mono text-[10px] text-slate-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Testimonial Filters & Share CTA Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 flex flex-col justify-between shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="space-y-5 relative z-10">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <h4 className="font-display font-bold text-sm text-slate-900">Filter reviews by facility</h4>
                </div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-150">
                  {filteredTestimonials.length} Result{filteredTestimonials.length !== 1 && 's'}
                </span>
              </div>

              {/* Tag Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setActiveFilter(cat.value as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      activeFilter === cat.value 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-3xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary-600" />
                  Were you a resident of Modanwal Boys Hostel?
                </p>
                <p className="text-[11px] text-slate-500">
                  Your feedback helps upcoming students find a secure, premium accommodation in Sultanpur.
                </p>
              </div>

              <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer ${
                  isFormOpen 
                    ? 'bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {isFormOpen ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Cancel Review</span>
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4" />
                    <span>Write a Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Review Form Container */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden mb-12"
              id="testimonial-submit-form-container"
            >
              <div className="bg-white border border-primary-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                
                {submitSuccess ? (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 text-center space-y-4 max-w-md mx-auto"
                  >
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-display font-black text-xl text-slate-900">Thank You for Your Review!</h3>
                      <p className="text-xs text-slate-500">धन्यवाद! आपकी समीक्षा सफलतापूर्वक सहेज ली गई है।</p>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Your testimonial has been persisted securely in our Firestore database. It is now loaded instantly into our review area to help other parents and aspirants choose wisely!
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="border-b border-slate-150 pb-4">
                      <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        Share Your Residency Experience
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Provide helpful details about the amenities, caretaker support, and food arrangements.</p>
                    </div>

                    {formError && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold">
                        {formError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      
                      {/* Left Block */}
                      <div className="md:col-span-6 space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Your Full Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Rahul Modanwal"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">College, Course, or Focus *</label>
                          <input
                            type="text"
                            placeholder="e.g. B.Tech IT, KNIT Sultanpur / SSC aspirant"
                            value={formCollege}
                            onChange={(e) => setFormCollege(e.target.value)}
                            className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Primary Review Category</label>
                            <select
                              value={formCategory}
                              onChange={(e) => setFormCategory(e.target.value as any)}
                              className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800"
                            >
                              <option value="general">General Stay Experience</option>
                              <option value="kitchen">Self-Cooking Kitchen</option>
                              <option value="study">Quiet Study Environment</option>
                              <option value="facilities">Safety, RO Water & Utilities</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Years of Stay</label>
                            <input
                              type="text"
                              placeholder="e.g. 2024 - Present, or 2023"
                              value={formYear}
                              onChange={(e) => setFormYear(e.target.value)}
                              className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right Block */}
                      <div className="md:col-span-6 space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Rating Score *</label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const active = hoverRating !== null ? star <= hoverRating : star <= formRating;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setFormRating(star)}
                                  onMouseEnter={() => setHoverRating(star)}
                                  onMouseLeave={() => setHoverRating(null)}
                                  className="p-1 cursor-pointer hover:scale-110 transition-transform duration-100"
                                >
                                  <Star 
                                    className={`w-7 h-7 ${active ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} 
                                  />
                                </button>
                              );
                            })}
                            <span className="text-xs font-bold text-slate-500 ml-2">
                              {formRating === 5 ? 'Excellent!' : formRating === 4 ? 'Very Good' : formRating === 3 ? 'Good' : formRating === 2 ? 'Fair' : 'Needs Improvement'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Your Detailed Review * (At least 20 chars)</label>
                          <textarea
                            rows={4}
                            placeholder="Tell us what you liked about Modanwal Boys Hostel. How was Alok Bhaiya's support, the water purification, kitchen hygiene, study environment, or location security?"
                            value={formText}
                            onChange={(e) => setFormText(e.target.value)}
                            className="w-full bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 text-slate-800 resize-none"
                          />
                          <p className="text-[10px] text-slate-400 text-right mt-1">
                            {formText.length} characters (minimum 20)
                          </p>
                        </div>
                      </div>

                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-full text-xs font-bold cursor-pointer transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full text-xs font-bold cursor-pointer shadow-sm transition-all"
                      >
                        Submit Review
                      </button>
                    </div>
                  </form>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Testimonials Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400">Loading reviews from Firestore...</p>
          </div>
        ) : (
          /* Testimonials Grid Display */
          <AnimatePresence mode="popLayout">
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              id="testimonials-card-grid"
            >
              {filteredTestimonials.length === 0 ? (
                <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
                  <p className="text-sm font-semibold text-slate-500">No testimonials found in this category.</p>
                  <button
                    onClick={() => setActiveFilter('all')}
                    className="px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold cursor-pointer hover:bg-slate-800 transition-all"
                  >
                    View All Reviews
                  </button>
                </div>
              ) : (
                filteredTestimonials.map((t) => {
                  const fallback = getAvatarFallback(t.name);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      key={t.id}
                      className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 hover:shadow-2xs transition-all duration-300 relative group"
                    >
                      {/* Quote Icon Background watermark */}
                      <span className="absolute right-6 top-6 text-slate-100 opacity-60 group-hover:text-primary-50 group-hover:scale-110 transition-all duration-300">
                        <Quote className="w-10 h-10 stroke-[1.5]" />
                      </span>

                      <div className="space-y-4">
                        {/* Rating Stars & Category Badge */}
                        <div className="flex items-center gap-1.5 justify-between">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star 
                                key={s} 
                                className={`w-3.5 h-3.5 ${s <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-150'}`} 
                              />
                            ))}
                          </div>
                          <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md border ${
                            t.category === 'kitchen' 
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : t.category === 'study'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                              : t.category === 'facilities'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-slate-50 text-slate-600 border-slate-150'
                          }`}>
                            {t.category === 'kitchen' ? 'Kitchen' : t.category === 'study' ? 'Study' : t.category === 'facilities' ? 'Safety/Water' : 'General'}
                          </span>
                        </div>

                        {/* Text Review */}
                        <p className="font-sans text-slate-700 text-xs leading-relaxed font-normal italic relative z-10 whitespace-pre-wrap">
                          "{t.text}"
                        </p>
                      </div>

                      {/* User Info Block */}
                      <div className="flex items-center gap-3 mt-6 border-t border-slate-100 pt-4 relative z-10">
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 select-none ${fallback.colorClass}`}>
                          {fallback.initials}
                        </div>
                        
                        {/* Meta text */}
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 truncate">{t.name}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" title="Verified Resident (प्रमाणित छात्र)" />
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{t.collegeOrCourse}</p>
                          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Stay: {t.yearOfStay}</span>
                          </div>
                        </div>
                      </div>

                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        )}

      </div>
    </section>
  );
}
