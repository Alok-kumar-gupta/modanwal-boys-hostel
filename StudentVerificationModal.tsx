import React from 'react';
import {
  ShieldCheck,
  User,
  UserCheck,
  Phone,
  Calendar,
  Home,
  GraduationCap,
  MapPin,
  CheckCircle2,
  X,
  PhoneCall,
  Clock,
  Building2,
  Lock,
  Share2,
  FileText,
  CreditCard,
  BadgeCheck,
} from 'lucide-react';
import { StudentVerificationPayload } from '../lib/verificationUtil';
import { BookingInquiry } from '../types';

interface StudentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: StudentVerificationPayload | null;
  matchedStudent?: BookingInquiry | null;
}

export default function StudentVerificationModal({
  isOpen,
  onClose,
  payload,
  matchedStudent,
}: StudentVerificationModalProps) {
  if (!isOpen || !payload) return null;

  const effectivePhoto = matchedStudent?.photoUrl || '';
  const effectiveName = matchedStudent?.fullName || payload.name;
  const effectiveFatherName =
    matchedStudent?.fatherName ||
    matchedStudent?.guardianName ||
    payload.fatherName ||
    payload.guardianName ||
    '';
  const effectiveRoom = matchedStudent?.roomNumber || payload.room;
  const effectiveRoomType = matchedStudent?.roomType || payload.roomType;
  const effectiveCourse = matchedStudent?.course || matchedStudent?.studyYear || payload.course;
  const effectiveEntryDate = matchedStudent?.checkInDate || payload.entryDate;
  const effectivePhone = matchedStudent?.phone || payload.phone;
  const effectiveParentPhone =
    matchedStudent?.parentPhone || matchedStudent?.guardianPhone || payload.parentPhone;
  const effectiveEmail = matchedStudent?.email || payload.email;
  const effectiveHometown = matchedStudent?.hometown || payload.hometown;
  const effectiveAadhar = matchedStudent?.aadharNumber || payload.aadhar;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Verified Resident: ${effectiveName}`,
          text: `Official Student Resident Verification for ${effectiveName} (Room ${effectiveRoom}, ${payload.hostelName})`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('सत्यापन लिंक कॉपी कर लिया गया है (Verification link copied to clipboard)');
    }
  };

  return (
    <div
      id="student-verification-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="student-verification-modal-container"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
      >
        {/* Top Official Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative overflow-hidden">
          {/* Subtle Security watermark */}
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <ShieldCheck className="w-44 h-44 text-white" />
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg border border-amber-300 text-slate-950 font-black text-xl">
                MBH
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-amber-300 uppercase block">
                  Official Verification Portal
                </span>
                <h2 className="text-lg sm:text-xl font-display font-black tracking-tight text-white leading-tight">
                  {payload.hostelName}
                </h2>
                <p className="text-xs text-indigo-200/90 font-medium">
                  Village Tindola, Barabanki (U.P.) - 225003
                </p>
              </div>
            </div>

            <button
              id="close-verification-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Verification Status Banner */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>✓ Verified Active Resident (सत्यापित छात्र)</span>
            </div>
            <span className="text-[10px] text-slate-300 font-mono">
              UID: {payload.uid}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Profile Identity Card */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            {/* Student Photo */}
            <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-slate-200 border-2 border-amber-500 overflow-hidden shadow-md shrink-0 flex items-center justify-center">
              {effectivePhoto ? (
                <img
                  src={effectivePhoto}
                  alt={effectiveName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                  <User className="w-8 h-8 text-indigo-400 mb-1" />
                  <span className="text-[9px] font-bold text-slate-500 uppercase leading-none">
                    Resident Photo
                  </span>
                </div>
              )}
            </div>

            {/* Name & Primary Identifiers */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 inline-block">
                  Registered Student
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {effectiveRoom}
                </span>
              </div>
              
              {/* Full Student Name */}
              <h3 className="text-xl font-display font-black text-slate-900 truncate">
                {effectiveName}
              </h3>

              {/* Father's Name Row */}
              <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="text-slate-500">पिता (Father):</span>
                <strong className="text-slate-900 font-bold truncate">
                  {effectiveFatherName || 'रिकॉर्ड में दर्ज (On Record)'}
                </strong>
              </div>

              {/* Course Row */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="text-slate-500">कोर्स (Course):</span>
                <strong className="text-indigo-950 font-extrabold truncate">
                  {effectiveCourse}
                </strong>
              </div>

              <p className="text-[11px] text-slate-500 font-medium">
                स्टेटस: <span className="font-bold text-slate-800">सत्यापित निवासी (Active Resident)</span>
              </p>
            </div>
          </div>

          {/* Core Registration Details Grid (Name, Father's Name, Room No, Course highlighted) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs">
            {/* 1. Room Allotment */}
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-0.5">
                <Home className="w-3.5 h-3.5 text-indigo-600" />
                कमरा संख्या (Room No)
              </span>
              <div className="font-black text-indigo-950 text-base font-mono">
                {effectiveRoom}
              </div>
              <span className="text-[11px] text-indigo-600 font-semibold capitalize">
                {effectiveRoomType === 'single' ? 'Single AC (1-Seater)' : 'Twin AC (2-Seater)'}
              </span>
            </div>

            {/* 2. Father's Name Detail */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
              <span className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1 mb-0.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                पिता का नाम (Father's Name)
              </span>
              <div className="font-black text-slate-900 text-sm truncate" title={effectiveFatherName}>
                {effectiveFatherName || 'ऑन-रिकॉर्ड दर्ज'}
              </div>
              <span className="text-[10px] text-amber-700 font-medium">
                अभिभावक (Guardian)
              </span>
            </div>

            {/* 3. Course Details */}
            <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
                कोर्स / शाखा (Course)
              </span>
              <div className="font-black text-slate-900 text-sm truncate" title={effectiveCourse}>
                {effectiveCourse}
              </div>
              <span className="text-[10px] text-sky-700 font-semibold">
                रेजिडेंट छात्र (Hostel Resident)
              </span>
            </div>

            {/* 4. Entry Date */}
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-0.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                प्रवेश तिथि (Check-In)
              </span>
              <div className="font-black text-slate-900 text-sm font-mono">
                {effectiveEntryDate}
              </div>
              <span className="text-[11px] text-emerald-700 font-bold">
                ✓ Active Resident
              </span>
            </div>

            {/* 5. Student Mobile */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-0.5">
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                छात्र मोबाइल (Student Mobile)
              </span>
              <a
                href={`tel:${effectivePhone}`}
                className="font-black text-slate-900 text-sm font-mono hover:text-indigo-600 transition-colors block truncate"
              >
                {effectivePhone || 'N/A'}
              </a>
              <span className="text-[10px] text-slate-400">Registered Number</span>
            </div>

            {/* 6. Parent Phone */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-0.5">
                <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                पिता / अभिभावक फोन (Parent Phone)
              </span>
              <a
                href={`tel:${effectiveParentPhone}`}
                className="font-black text-slate-900 text-sm font-mono hover:text-indigo-600 transition-colors block truncate"
              >
                {effectiveParentPhone || 'On Record'}
              </a>
              <span className="text-[10px] text-slate-400">Emergency Contact</span>
            </div>
          </div>

          {/* Owner Registration Details & Allotment Summary */}
          {matchedStudent && (
            <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-4 rounded-2xl border border-indigo-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-indigo-700" />
                  <span className="font-extrabold text-slate-900 text-xs">
                    ओनर रजिस्ट्रेशन रिकॉर्ड (Owner Allotment Ledger)
                  </span>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  matchedStudent.rentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  किराया: {matchedStudent.rentStatus === 'paid' ? '✓ जमा (PAID)' : '⚠️ बकाया (PENDING)'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-indigo-100/80 text-[11px]">
                <div>
                  <span className="text-slate-500 block">मासिक किराया (Rent):</span>
                  <strong className="text-slate-900 font-bold font-mono">
                    ₹{matchedStudent.monthlyRentAmount || (matchedStudent.roomType === 'single' ? 9000 : 7000)}/माह
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">सिक्योरिटी डिपॉजिट:</span>
                  <strong className="text-slate-900 font-bold font-mono">
                    ₹{matchedStudent.paidDeposit || 3000} (जमा)
                  </strong>
                </div>
                {effectiveHometown && (
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-500 block">गृह जिला (Hometown):</span>
                    <strong className="text-slate-900 font-bold truncate block">
                      {effectiveHometown}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Access & Security Clearance Details */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                बायोमेट्रिक गेट एक्सेस (Biometric Gate Access):
              </span>
              <span className="font-bold text-emerald-400">✓ Verified Resident (सत्यापित छात्र)</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                हॉस्टल लोकेशन (Hostel Location):
              </span>
              <span className="font-medium text-slate-200 text-right truncate max-w-[200px]">
                तिंदोला, बाराबंकी (उ.प्र.)
              </span>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                सत्यापन समय (Verification Time):
              </span>
              <span className="font-mono text-slate-300">
                {payload.verifiedAt || 'Live Online'}
              </span>
            </div>
          </div>

          {/* Quick Action Contact Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <a
              id="verify-call-caretaker-btn"
              href={`tel:${payload.caretakerPhone}`}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Caretaker (केयरटेकर)</span>
            </a>

            <a
              id="verify-open-maps-btn"
              href="https://maps.google.com/?q=26.9378,81.1894"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors border border-slate-200"
            >
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>Hostel on Maps (लोकेशन)</span>
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            id="share-verification-btn"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 py-1 px-2.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Verification (शेयर करें)</span>
          </button>

          <button
            id="close-verification-bottom-btn"
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-extrabold transition-colors"
          >
            Close (बंद करें)
          </button>
        </div>
      </div>
    </div>
  );
}
