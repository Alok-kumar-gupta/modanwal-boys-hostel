/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building, 
  User, 
  Phone, 
  Mail, 
  Home, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Send, 
  X, 
  Camera, 
  Upload, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  AlertCircle,
  FileText,
  MapPin,
  Bed,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BookingInquiry, HostelConfig } from '../types';

interface StudentSelfRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HostelConfig;
  onAddBooking: (newInquiry: Omit<BookingInquiry, 'id' | 'timestamp'>) => Promise<void> | void;
}

const POPULAR_COLLEGES = [
  'Shri Ramswaroop Memorial University (SRMU)',
  'Babu Banarasi Das University (BBDU)',
  'Integral University',
  'Amity University Lucknow',
  'Lucknow University (LU)',
  'IET Lucknow',
  'GCRG Group of Institutions',
  'Other College / Institute'
];

const POPULAR_COURSES = [
  'B.Tech (Computer Science & Engg)',
  'B.Tech (Information Technology)',
  'B.Tech (Civil / Mechanical / Electrical)',
  'BCA (Bachelor of Computer Applications)',
  'MCA (Master of Computer Applications)',
  'B.Pharma / D.Pharma',
  'Polytechnic Diploma',
  'BBA / MBA',
  'B.Sc / M.Sc',
  'Government Exam Preparation / NEET / JEE',
  'Other Course'
];

export default function StudentSelfRegistrationModal({
  isOpen,
  onClose,
  config,
  onAddBooking
}: StudentSelfRegistrationModalProps) {
  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [hometown, setHometown] = useState('');
  const [college, setCollege] = useState('Shri Ramswaroop Memorial University (SRMU)');
  const [customCollege, setCustomCollege] = useState('');
  const [course, setCourse] = useState('B.Tech (Computer Science & Engg)');
  const [customCourse, setCustomCourse] = useState('');
  const [studyYear, setStudyYear] = useState('1st Year');
  const [roomType, setRoomType] = useState<'single' | 'twin' | 'full'>('single');
  const [roomNumber, setRoomNumber] = useState('');
  const [checkInDate, setCheckInDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [aadharNumber, setAadharNumber] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [customNotes, setCustomNotes] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedStudent, setSubmittedStudent] = useState<{ name: string; phone: string } | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setFormError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setFormError('कृपया अपना पूरा नाम दर्ज करें। (Please enter your full name)');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setFormError('कृपया अपना सही 10-अंकीय मोबाइल नंबर दर्ज करें। (Please enter valid 10-digit mobile number)');
      return;
    }

    if (!fatherName.trim()) {
      setFormError('कृपया पिता का नाम दर्ज करें। (Please enter father name)');
      return;
    }

    const cleanParentPhone = parentPhone.replace(/[^0-9]/g, '');
    if (cleanParentPhone.length < 10) {
      setFormError('कृपया अभिभावक/पिता का 10-अंकीय मोबाइल नंबर दर्ज करें। (Please enter parent mobile number)');
      return;
    }

    if (!hometown.trim()) {
      setFormError('कृपया अपना गृह जिला / स्थायी पता दर्ज करें। (Please enter hometown / permanent address)');
      return;
    }

    const finalCollege = college === 'Other College / Institute' ? (customCollege.trim() || 'Other Institute') : college;
    const finalCourse = course === 'Other Course' ? (customCourse.trim() || 'General Course') : course;

    setIsSubmitting(true);

    try {
      const newRecord: Omit<BookingInquiry, 'id' | 'timestamp'> = {
        fullName: trimmedName,
        phone: cleanPhone,
        email: email.trim().toLowerCase(),
        fatherName: fatherName.trim(),
        parentPhone: cleanParentPhone,
        permanentAddress: hometown.trim(),
        hometown: hometown.trim(),
        course: `${finalCourse} | ${finalCollege}`,
        studyYear,
        roomType,
        roomNumber: roomNumber.trim(),
        checkInDate,
        aadharNumber: aadharNumber.trim(),
        photoUrl: photoUrl || undefined,
        customNotes: customNotes.trim() ? `[QR Self-Register]: ${customNotes.trim()}` : '[QR Self-Register]: नए छात्र द्वारा क्यूआर कोड स्कैन करके फॉर्म भरा गया',
        addons: [],
        inquiryType: 'self-register',
        status: 'pending',
        ownerPermission: false, // Must be approved by owner/caretaker first
        rentStatus: 'pending',
        configuredEstimate: null, // Note: No rent configured by student!
      };

      await onAddBooking(newRecord);

      setSubmittedStudent({
        name: trimmedName,
        phone: cleanPhone
      });
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit self-registration form:', err);
      setFormError('फॉर्म सबमिट करने में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    onClose();
    // Clean up query param from URL if present
    if (typeof window !== 'undefined' && (window.location.search.includes('self-register') || window.location.hash.includes('self-register'))) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden transition-all text-slate-900 dark:text-slate-100"
        id="student-self-registration-card"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 px-5 sm:px-8 py-5 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
                  📲 QR Admission Portal
                </span>
                <h2 className="text-lg sm:text-xl font-display font-extrabold leading-tight">
                  {config.hostelName}
                </h2>
                <p className="text-xs text-indigo-100 font-medium">
                  नया छात्र प्रवेश व रजिस्ट्रेशन फॉर्म (Student Self-Registration)
                </p>
              </div>
            </div>
            
            <button
              onClick={handleModalClose}
              className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer"
              title="Close form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-8 max-h-[80vh] overflow-y-auto">
          {isSubmitted ? (
            /* SUCCESS SUBMITTED VIEW */
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 sm:py-8 space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50 shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 inline-block">
                  ✓ रजिस्ट्रेशन सफलतापूर्वक दर्ज हो गया!
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                  धन्यवाद, {submittedStudent?.name}!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  आपके द्वारा भरा गया विवरण हॉस्टल के ओनर व केयरटेकर (<strong className="text-indigo-600 dark:text-indigo-400">{config.caretakerName}</strong>) के पास पहुँच गया है।
                </p>
              </div>

              {/* Status Box */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 sm:p-5 text-left space-y-3 max-w-lg mx-auto">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                      वेरिफिकेशन व अप्रूवल प्रक्रिया (Approval Pending):
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
                      केयरटेकर द्वारा आपकी जानकारी चेक करके <strong>Approve (स्वीकृत)</strong> करने के बाद, आप अपने मोबाइल नंबर (<strong className="font-bold text-slate-900 dark:text-white">{submittedStudent?.phone}</strong>) के माध्यम से <strong>Student Portal</strong> में सीधे लॉगिन कर पाएँगे।
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>पोर्टल एक्सेस: <strong>अप्रूवल के बाद एक्टिव</strong></span>
                  <span className="font-extrabold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                    Pending Approval
                  </span>
                </div>
              </div>

              {/* Direct Caretaker Contact */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`tel:${config.phone.replace(/[^0-9+]/g, '')}`}
                  className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>केयरटेकर को कॉल करें ({config.phone})</span>
                </a>
                <a
                  href={`https://wa.me/${config.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`नमस्ते ${config.caretakerName} जी, मैंने Modanwal Boys Hostel में नए एडमिशन हेतु QR फॉर्म भर दिया है। मेरा नाम ${submittedStudent?.name} है (फोन: ${submittedStudent?.phone})। कृपया मेरी डिटेल्स चेक करके अप्रूव करें।`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>WhatsApp पर सूचित करें</span>
                </a>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleModalClose}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                >
                  होम पेज पर वापस जाएँ (Back to Home)
                </button>
              </div>
            </motion.div>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-3 sm:p-4 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  <strong>स्वागत है!</strong> यह फॉर्म केवल नए छात्रों के व्यक्तिगत रिकॉर्ड व कमरा आवंटन हेतु है। फॉर्म सबमिट करने के बाद ओनर/केयरटेकर द्वारा सत्यापित होने पर आपका <strong>Student Portal</strong> सक्रिय हो जाएगा।
                </p>
              </div>

              {formError && (
                <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: Personal Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. व्यक्तिगत विवरण (Personal Details)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      विद्यार्थी का पूरा नाम (Full Name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. राहुल कुमार"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Student Mobile Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      मोबाइल नंबर (Mobile Number) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full pl-12 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      (यह नंबर स्टूडेंट पोर्टल में लॉगिन करने के काम आएगा)
                    </p>
                  </div>

                  {/* Father's Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      पिता का नाम (Father's Name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="पिता / अभिभावक का नाम"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Parent Mobile */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      पिता / अभिभावक का फोन (Parent Phone) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit number"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full pl-12 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Permanent Hometown */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      स्थायी गृह जिला / पता (Home District & Address) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. बस्ती, गोरखपुर, वाराणसी, प्रयागराज, आदि"
                      value={hometown}
                      onChange={(e) => setHometown(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Email (Optional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      ईमेल आईडी (Email ID - Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="student@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Aadhar Number (Optional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      आधार नंबर (Aadhar Number - Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="12-अंकीय आधार संख्या"
                      value={aadharNumber}
                      onChange={(e) => setAadharNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Academic Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>2. कॉलेज व शैक्षणिक विवरण (College & Course)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* College Name */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      कॉलेज / विश्वविद्यालय (College / University)
                    </label>
                    <select
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {POPULAR_COLLEGES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {college === 'Other College / Institute' && (
                      <input
                        type="text"
                        placeholder="अपने कॉलेज का पूरा नाम लिखें"
                        value={customCollege}
                        onChange={(e) => setCustomCollege(e.target.value)}
                        className="w-full mt-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                  </div>

                  {/* Course */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      कोर्स / शाखा (Course / Branch)
                    </label>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {POPULAR_COURSES.map((cr) => (
                        <option key={cr} value={cr}>{cr}</option>
                      ))}
                    </select>
                    {course === 'Other Course' && (
                      <input
                        type="text"
                        placeholder="अपने कोर्स का नाम लिखें"
                        value={customCourse}
                        onChange={(e) => setCustomCourse(e.target.value)}
                        className="w-full mt-2 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                  </div>

                  {/* Study Year */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      अध्ययन वर्ष (Year of Study)
                    </label>
                    <select
                      value={studyYear}
                      onChange={(e) => setStudyYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="1st Year">1st Year (प्रथम वर्ष)</option>
                      <option value="2nd Year">2nd Year (द्वितीय वर्ष)</option>
                      <option value="3rd Year">3rd Year (तृतीय वर्ष)</option>
                      <option value="4th Year">4th Year (चतुर्थ वर्ष)</option>
                      <option value="Preparation / Competitive">प्रतियोगी परीक्षा तैयारी (Govt/NEET/JEE)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Room Selection & Check-in */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <Bed className="w-3.5 h-3.5 text-indigo-600" />
                  <span>3. कमरा चयन व प्रवेश तिथि (Room & Check-in)</span>
                </h4>

                {/* Room Type Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setRoomType('single')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      roomType === 'single'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">सिंगल रूम</span>
                      {roomType === 'single' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">1-सीटर (निजी)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoomType('twin')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      roomType === 'twin'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">ट्विन शेयरिंग</span>
                      {roomType === 'twin' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">2-सीटर (शेयरिंग)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoomType('full')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                      roomType === 'full'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">फुल रूम</span>
                      {roomType === 'full' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">बड़ा स्वतंत्र कमरा</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Room Number if told */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>कमरा नंबर (Room Number - यदि ज्ञात हो)</span>
                      <span className="text-[10px] text-slate-400 font-normal">(वैकल्पिक)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. 101, 102, 204 (यदि केयरटेकर ने बताया हो)"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Check-in Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      प्रवेश / चेक-इन तिथि (Check-in Date)
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Optional Photo & Notes */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <Camera className="w-3.5 h-3.5 text-indigo-600" />
                  <span>4. फोटो व अतिरिक्त टिप्पणी (Photo & Notes)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* Photo Upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>छात्र फोटो / सेल्फी (Student Photo)</span>
                      <span className="text-[10px] text-slate-400">(आईडी कार्ड हेतु)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      {photoUrl ? (
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-indigo-300 shadow-sm shrink-0">
                          <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setPhotoUrl('')}
                            className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5 shadow"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                          <User className="w-6 h-6" />
                        </div>
                      )}

                      <label className="flex-1 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer text-center border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{photoUrl ? 'फोटो बदलें' : 'फ़ोटो चुनें या सेल्फी लें'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Special Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      विशेष आवश्यकता / नोट (Any Preferences)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. कूलर की आवश्यकता, ग्राउंड फ्लोर, आदि"
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                  id="submit-student-self-registration-btn"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>डेटा सुरक्षित हो रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>📝 फॉर्म सबमिट करें (Submit Details for Approval)</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  सबमिट करने के बाद केयरटेकर विवरण सत्यापित (Approve) करेंगे, जिसके बाद आपका स्टूडेंट पोर्टल चालू होगा।
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
