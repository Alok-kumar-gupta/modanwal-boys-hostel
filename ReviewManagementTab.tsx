import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle,
  MessageSquare,
  Clock,
  X,
  Edit3
} from 'lucide-react';
import { HostelConfig, Testimonial } from '../types';
import {
  subscribeToTestimonials,
  addTestimonial,
  updateTestimonial,
  toggleHideTestimonial,
  setTestimonialHidden,
  deleteTestimonial,
  deleteAllTestimonials
} from '../lib/hostelService';

interface ReviewManagementTabProps {
  config: HostelConfig;
}

export default function ReviewManagementTab({ config }: ReviewManagementTabProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '1-2'>('all');

  // Add / Edit Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Testimonial | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formCollege, setFormCollege] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState<'kitchen' | 'study' | 'facilities' | 'general'>('general');
  const [formYear, setFormYear] = useState('Resident 2025-26');
  const [formHidden, setFormHidden] = useState(false);
  const [formError, setFormError] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time subscription to testimonials
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToTestimonials([], (list) => {
      setTestimonials(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filtered reviews
  const filteredReviews = testimonials.filter((t) => {
    if (statusFilter === 'visible' && t.hidden === true) return false;
    if (statusFilter === 'hidden' && t.hidden !== true) return false;

    if (ratingFilter === '5' && Math.round(t.rating) !== 5) return false;
    if (ratingFilter === '4' && Math.round(t.rating) !== 4) return false;
    if (ratingFilter === '3' && Math.round(t.rating) !== 3) return false;
    if (ratingFilter === '1-2' && Math.round(t.rating) > 2) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (t.name || '').toLowerCase().includes(q);
      const matchCollege = (t.collegeOrCourse || '').toLowerCase().includes(q);
      const matchText = (t.text || '').toLowerCase().includes(q);
      const matchYear = (t.yearOfStay || '').toLowerCase().includes(q);
      if (!matchName && !matchCollege && !matchText && !matchYear) return false;
    }

    return true;
  });

  // KPI Calculations
  const totalCount = testimonials.length;
  const visibleCount = testimonials.filter((t) => !t.hidden).length;
  const hiddenCount = testimonials.filter((t) => t.hidden).length;
  const avgRating =
    visibleCount > 0
      ? (
          testimonials
            .filter((t) => !t.hidden)
            .reduce((sum, t) => sum + t.rating, 0) / visibleCount
        ).toFixed(1)
      : '0.0';

  // Toggle single review hide / unhide
  const handleToggleHide = async (review: Testimonial) => {
    const isCurrentlyHidden = Boolean(review.hidden);
    const newHiddenState = !isCurrentlyHidden;

    // Optimistic UI update
    setTestimonials((prev) =>
      prev.map((t) => (t.id === review.id ? { ...t, hidden: newHiddenState } : t))
    );

    try {
      await toggleHideTestimonial(review.id, isCurrentlyHidden);
      showToast(
        newHiddenState
          ? `Review for "${review.name}" is now Hidden from website.`
          : `Review for "${review.name}" is now Publicly Visible on website.`
      );
    } catch (err) {
      console.error('Failed to toggle review status:', err);
      // Revert on error
      setTestimonials((prev) =>
        prev.map((t) => (t.id === review.id ? { ...t, hidden: isCurrentlyHidden } : t))
      );
      alert('Error updating review status.');
    }
  };

  // Bulk Hide All
  const handleHideAll = async () => {
    if (testimonials.length === 0) return;
    if (!window.confirm('Hide all reviews from public website view?')) return;
    
    // Optimistic update
    const previous = [...testimonials];
    setTestimonials((prev) => prev.map((t) => ({ ...t, hidden: true })));

    try {
      for (const t of testimonials) {
        if (!t.hidden) {
          await setTestimonialHidden(t.id, true);
        }
      }
      showToast('All reviews are now hidden from public view.');
    } catch (err) {
      console.error('Error hiding all testimonials:', err);
      setTestimonials(previous);
    }
  };

  // Bulk Unhide All
  const handleUnhideAll = async () => {
    if (testimonials.length === 0) return;
    if (!window.confirm('Make all reviews publicly visible on website?')) return;
    
    // Optimistic update
    const previous = [...testimonials];
    setTestimonials((prev) => prev.map((t) => ({ ...t, hidden: false })));

    try {
      for (const t of testimonials) {
        if (t.hidden) {
          await setTestimonialHidden(t.id, false);
        }
      }
      showToast('All reviews are now visible on public website.');
    } catch (err) {
      console.error('Error unhiding all testimonials:', err);
      setTestimonials(previous);
    }
  };

  // Delete Single Review
  const handleDeleteReview = async (review: Testimonial) => {
    const confirmDelete = window.confirm(
      `Permanently delete review by "${review.name}" from database?\n\nThis action cannot be undone.`
    );
    if (!confirmDelete) return;

    // Optimistic remove
    const previous = [...testimonials];
    setTestimonials((prev) => prev.filter((t) => t.id !== review.id));

    try {
      await deleteTestimonial(review.id);
      showToast(`Review by "${review.name}" permanently deleted.`);
    } catch (err) {
      console.error('Failed to delete testimonial:', err);
      setTestimonials(previous);
      alert('Failed to delete review.');
    }
  };

  // Delete All Fake / Test Reviews
  const handleDeleteAllFakeReviews = async () => {
    if (testimonials.length === 0) {
      alert('No reviews available to delete.');
      return;
    }
    const confirm = window.prompt(
      `Warning: Permanently delete all (${testimonials.length}) reviews from database?\n\nType 'DELETE' to confirm:`
    );
    if (confirm !== 'DELETE') {
      if (confirm !== null) alert('Incorrect confirmation. Reviews were not deleted.');
      return;
    }

    const previous = [...testimonials];
    setTestimonials([]);

    try {
      await deleteAllTestimonials(testimonials);
      showToast('All reviews permanently removed from database.');
    } catch (err) {
      console.error('Failed to delete all testimonials:', err);
      setTestimonials(previous);
      alert('Failed to delete reviews.');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (review: Testimonial) => {
    setEditingReview(review);
    setFormName(review.name);
    setFormCollege(review.collegeOrCourse);
    setFormRating(review.rating);
    setFormText(review.text);
    setFormCategory(review.category);
    setFormYear(review.yearOfStay || 'Resident');
    setFormHidden(Boolean(review.hidden));
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingReview(null);
    setFormName('');
    setFormCollege('');
    setFormRating(5);
    setFormText('');
    setFormCategory('general');
    setFormYear('Resident 2025-26');
    setFormHidden(false);
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Save Form
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Please enter reviewer full name.');
      return;
    }
    if (!formText.trim()) {
      setFormError('Please enter review content.');
      return;
    }

    const payload: Testimonial = {
      id: editingReview ? editingReview.id : `test-${Date.now()}`,
      name: formName.trim(),
      collegeOrCourse: formCollege.trim() || 'Resident Student',
      rating: formRating,
      text: formText.trim(),
      category: formCategory,
      yearOfStay: formYear.trim() || 'Resident',
      timestamp: editingReview?.timestamp || new Date().toISOString(),
      hidden: formHidden,
    };

    try {
      if (editingReview) {
        await updateTestimonial(payload);
        showToast(`Review for "${payload.name}" updated successfully.`);
      } else {
        await addTestimonial(payload);
        showToast(`New review for "${payload.name}" added successfully.`);
      }
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to save review:', err);
      setFormError('Failed to save review. Please try again.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 text-xs font-bold"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Review Moderation & Privacy Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white flex items-center gap-2">
            <span>Review Moderation & Visibility</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Manage public testimonials. You can <strong>Hide</strong> or <strong>Unhide</strong> individual reviews, permanently <strong>Delete</strong> spam or fake reviews, and add verified resident feedback.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            id="btn-add-verified-review"
          >
            <Plus className="w-4 h-4" />
            <span>Add Review</span>
          </button>

          {testimonials.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAllFakeReviews}
              className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-rose-100 text-xs font-bold px-3.5 py-2.5 rounded-2xl border border-rose-800/60 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Delete all reviews from database"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete All</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Reviews */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
            Total Reviews
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display font-black text-2xl sm:text-3xl text-slate-900">
              {totalCount}
            </span>
            <span className="text-xs text-slate-400 font-bold">Total</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Stored in database</span>
        </div>

        {/* Visible / Public Reviews */}
        <div className="bg-white border border-emerald-200 bg-emerald-50/20 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 block uppercase tracking-wider flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Public Visible</span>
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display font-black text-2xl sm:text-3xl text-emerald-700">
              {visibleCount}
            </span>
            <span className="text-xs text-emerald-600 font-bold">Active</span>
          </div>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Visible on live website</span>
        </div>

        {/* Hidden Reviews */}
        <div className="bg-white border border-amber-200 bg-amber-50/20 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-800 block uppercase tracking-wider flex items-center gap-1">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Hidden Reviews</span>
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display font-black text-2xl sm:text-3xl text-amber-700">
              {hiddenCount}
            </span>
            <span className="text-xs text-amber-600 font-bold">Private</span>
          </div>
          <span className="text-[10px] text-amber-600 block mt-0.5">Only in owner dashboard</span>
        </div>

        {/* Average Visible Rating */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Average Rating</span>
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display font-black text-2xl sm:text-3xl text-amber-600">
              {avgRating}
            </span>
            <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Public star score</span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, college, or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bulk Hide / Unhide Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleHideAll}
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold px-3 py-2 rounded-xl border border-amber-200 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Hide all reviews from public website"
            >
              <EyeOff className="w-3.5 h-3.5 text-amber-700" />
              <span>Hide All</span>
            </button>

            <button
              type="button"
              onClick={handleUnhideAll}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-2 rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Make all reviews visible on public website"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              <span>Unhide All</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-400 flex items-center gap-1 text-[11px] mr-1">
            <Filter className="w-3 h-3" /> Status:
          </span>

          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('visible')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === 'visible'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Public ({visibleCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('hidden')}
            className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1 ${
              statusFilter === 'hidden'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <EyeOff className="w-3 h-3" />
            <span>Hidden ({hiddenCount})</span>
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Rating filter */}
          <span className="font-bold text-slate-400 text-[11px] ml-auto hidden sm:inline">Rating:</span>
          {(['all', '5', '4', '3', '1-2'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRatingFilter(r)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                ratingFilter === r
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'all' ? 'All Stars' : `${r}★`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <MessageSquare className="w-6 h-6 text-slate-400" />
          </div>
          <h4 className="font-display font-bold text-base text-slate-800">No reviews found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || statusFilter !== 'all' || ratingFilter !== 'all'
              ? 'No reviews match your current filter criteria. Try resetting filters.'
              : 'There are currently no reviews in the database. Use the button above to add verified reviews.'}
          </p>
          {(searchQuery || statusFilter !== 'all' || ratingFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setRatingFilter('all');
              }}
              className="text-xs font-bold text-indigo-600 hover:underline pt-2 inline-block cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((review) => {
            const isHidden = Boolean(review.hidden);
            return (
              <div
                key={review.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs flex flex-col justify-between transition-all duration-200 relative ${
                  isHidden
                    ? 'border-amber-300/80 bg-amber-50/15'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Reviewer Name + Status Badge + Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-900">{review.name}</h4>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            isHidden
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {isHidden ? (
                            <>
                              <EyeOff className="w-3 h-3 text-amber-700" />
                              <span>Hidden</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 text-emerald-700" />
                              <span>Public</span>
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{review.collegeOrCourse}</p>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5 shrink-0 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= review.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-700 italic leading-relaxed whitespace-pre-wrap">
                    "{review.text}"
                  </div>

                  {/* Meta tags */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="capitalize bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                      Category: {review.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {review.yearOfStay || 'Resident'} •{' '}
                      {review.timestamp
                        ? new Date(review.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : 'Recorded'}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Buttons: Hide/Unhide, Edit, Delete */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  {/* Hide / Unhide Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleHide(review)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                      isHidden
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:scale-[1.01]'
                        : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:scale-[1.01]'
                    }`}
                    title={
                      isHidden
                        ? 'Click to make review visible on live website'
                        : 'Click to hide review from live website'
                    }
                  >
                    {isHidden ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Unhide (Make Public)</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                        <span>Hide</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5 ml-auto">
                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(review)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      title="Edit Review"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(review)}
                      className="px-2.5 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Permanently Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Review Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h3 className="font-display font-black text-lg text-slate-900">
                    {editingReview ? 'Edit Review' : 'Add Verified Review'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Record authentic student or parent experience
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveForm} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reviewer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Amit Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      College / Course
                    </label>
                    <input
                      type="text"
                      value={formCollege}
                      onChange={(e) => setFormCollege(e.target.value)}
                      placeholder="e.g. B.Tech CSE / NEET Prep"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Year of Stay
                    </label>
                    <input
                      type="text"
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      placeholder="e.g. Resident 2025-26"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Star Rating ({formRating}★)
                    </label>
                    <div className="flex items-center gap-1 py-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFormRating(s)}
                          className="p-1 cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              s <= formRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) =>
                        setFormCategory(
                          e.target.value as 'kitchen' | 'study' | 'facilities' | 'general'
                        )
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="general">General</option>
                      <option value="study">Study Environment</option>
                      <option value="kitchen">Kitchen & Food</option>
                      <option value="facilities">Safety & Facilities</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Review Text *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="Write authentic experience regarding hostel environment, discipline, study atmosphere..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                  />
                </div>

                {/* Visibility status */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Website Visibility
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {formHidden
                        ? '🔒 Hidden from public website'
                        : '👁️ Publicly visible on live website'}
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!formHidden}
                      onChange={(e) => setFormHidden(!e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    {editingReview ? 'Save Changes' : 'Save Review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
