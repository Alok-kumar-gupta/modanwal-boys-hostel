import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, CheckCircle, Sparkles, Heart, MessageSquare, ThumbsUp } from 'lucide-react';
import { HostelConfig, Testimonial } from '../types';
import { addTestimonial } from '../lib/hostelService';

interface WebsiteRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HostelConfig;
}

export default function WebsiteRatingModal({ isOpen, onClose, config }: WebsiteRatingModalProps) {
  const [overallRating, setOverallRating] = useState(5);
  const [designRating, setDesignRating] = useState(5);
  const [infoRating, setInfoRating] = useState(5);
  const [toolRating, setToolRating] = useState(5);

  const [hoverOverall, setHoverOverall] = useState<number | null>(null);
  const [hoverDesign, setHoverDesign] = useState<number | null>(null);
  const [hoverInfo, setHoverInfo] = useState<number | null>(null);
  const [hoverTool, setHoverTool] = useState<number | null>(null);

  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRole, setReviewerRole] = useState<'Aspirant' | 'Current Resident' | 'Parent' | 'Visitor'>('Visitor');
  const [feedbackText, setFeedbackText] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!reviewerName.trim()) {
      setErrorMessage('Please enter your name (कृपया अपना नाम दर्ज करें)');
      return;
    }

    if (!feedbackText.trim()) {
      setErrorMessage('Please leave a short comment or suggestion.');
      return;
    }

    setIsSubmitting(true);

    const newTestimonial: Testimonial = {
      id: `web-rating-${Date.now()}`,
      name: reviewerName.trim(),
      collegeOrCourse: `${reviewerRole} • Website Rating (${overallRating}★)`,
      rating: overallRating,
      text: `${feedbackText.trim()} [Website Ratings - Design: ${designRating}/5, Info Clarity: ${infoRating}/5, Tools: ${toolRating}/5]`,
      category: 'general',
      yearOfStay: 'Website Visitor 2026',
      timestamp: new Date().toISOString()
    };

    try {
      await addTestimonial(newTestimonial);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        // Reset state
        setReviewerName('');
        setFeedbackText('');
        setOverallRating(5);
      }, 2500);
    } catch (err) {
      console.error('Failed to submit website rating:', err);
      setErrorMessage('Unable to save rating. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarPicker = (
    value: number,
    onChange: (val: number) => void,
    hoverVal: number | null,
    setHoverVal: (val: number | null) => void,
    size: 'sm' | 'md' | 'lg' = 'md'
  ) => {
    const starSize = size === 'lg' ? 'w-7 h-7' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = hoverVal !== null ? star <= hoverVal : star <= value;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverVal(star)}
              onMouseLeave={() => setHoverVal(null)}
              className="p-0.5 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
            >
              <Star
                className={`${starSize} transition-colors ${
                  active ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-100'
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 relative"
          id="website-rating-modal"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-6 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/30">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <span>Rate Our Website</span>
                  <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase">
                    Feedback
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  How was your experience exploring {config.hostelName}?
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer relative z-10"
              id="rating-modal-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {isSuccess ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-xl text-slate-900">Thank You For Rating Us!</h4>
                  <p className="text-xs text-slate-500">आपकी रेटिंग और सुझाव सफलतापूर्वक सबमिट हो गए हैं!</p>
                </div>
                <p className="text-xs text-slate-600 bg-emerald-50 p-3 rounded-2xl border border-emerald-100 max-w-sm mx-auto">
                  Your website review helps us improve the user experience for all students and parents exploring hostel accommodation in Sultanpur.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                    {errorMessage}
                  </div>
                )}

                {/* Overall Rating Section */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Overall Website Experience *
                  </span>
                  <div className="flex justify-center">
                    {renderStarPicker(overallRating, setOverallRating, hoverOverall, setHoverOverall, 'lg')}
                  </div>
                  <span className="text-[11px] font-bold text-amber-600 block">
                    {overallRating === 5 && '⭐⭐⭐⭐⭐ Outstanding & Smooth!'}
                    {overallRating === 4 && '⭐⭐⭐⭐ Very Good Experience'}
                    {overallRating === 3 && '⭐⭐⭐ Average Experience'}
                    {overallRating === 2 && '⭐⭐ Below Expectations'}
                    {overallRating === 1 && '⭐ Needs Improvement'}
                  </span>
                </div>

                {/* Detailed Ratings Grid */}
                <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Detailed Experience Rating
                  </h4>

                  <div className="space-y-2 text-xs">
                    {/* Design */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Layout & Visual Design</span>
                      {renderStarPicker(designRating, setDesignRating, hoverDesign, setHoverDesign, 'sm')}
                    </div>

                    {/* Info */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Room Prices & Information</span>
                      {renderStarPicker(infoRating, setInfoRating, hoverInfo, setHoverInfo, 'sm')}
                    </div>

                    {/* Tools */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Estimator & Booking Flow</span>
                      {renderStarPicker(toolRating, setToolRating, hoverTool, setHoverTool, 'sm')}
                    </div>
                  </div>
                </div>

                {/* Name & Role Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Your Name"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      You are a...
                    </label>
                    <select
                      value={reviewerRole}
                      onChange={(e) => setReviewerRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
                    >
                      <option value="Visitor">Website Visitor</option>
                      <option value="Aspirant">Aspirant / Student</option>
                      <option value="Current Resident">Current Resident</option>
                      <option value="Parent">Parent / Guardian</option>
                    </select>
                  </div>
                </div>

                {/* Comments / Feedback */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Your Review & Feedback *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us what you liked about the website or any suggestions to make it better..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
                    required
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  id="submit-website-rating-btn"
                >
                  <ThumbsUp className="w-4 h-4 text-amber-400" />
                  <span>{isSubmitting ? 'Submitting Rating...' : 'Submit Rating & Feedback'}</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
