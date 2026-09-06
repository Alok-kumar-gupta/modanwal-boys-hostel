/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Send, 
  Mail, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  MessageSquare, 
  User, 
  Building, 
  Calendar, 
  DollarSign, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { BookingInquiry, HostelConfig, AutomatedRentEmailLog } from '../types';
import { getStudentRentApproachingStatus, generateAutomatedRentEmailContent } from '../lib/rentEmailAutomation';

interface AutomatedRentEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: BookingInquiry | null;
  config: HostelConfig;
  log?: AutomatedRentEmailLog | null;
  onMarkRentPaid?: (student: BookingInquiry) => void;
  onEmailSent?: (student: BookingInquiry, cycleKey: string) => void;
}

export default function AutomatedRentEmailModal({
  isOpen,
  onClose,
  student,
  config,
  log,
  onMarkRentPaid,
  onEmailSent
}: AutomatedRentEmailModalProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen || !student) return null;

  const status = getStudentRentApproachingStatus(student, config);
  const emailContent = generateAutomatedRentEmailContent(status, config);
  const recipientEmail = log?.studentEmail || status.studentEmail;
  const displaySubject = log?.subject || emailContent.subject;
  const sentTime = log?.sentAt || student.lastAutoEmailSentDate || 'Just now';

  const handleCopyEmailText = () => {
    navigator.clipboard.writeText(emailContent.plainText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(emailContent.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const cleanPhone = (student.phone || '').replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(emailContent.plainText)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div 
        id="automated-rent-email-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top Bar with Email Client Styling */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-indigo-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    ऑटोमेटेड ईमेल सूचना (Auto Dispatched)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                    {sentTime}
                  </span>
                </div>
                <h3 className="font-display font-black text-sm sm:text-base text-white mt-0.5">
                  किराया रिमाइंडर ईमेल (Rent Approaching Reminder)
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Email Headers Section */}
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-2.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400 w-12 shrink-0">To:</span>
                <span className="font-semibold text-slate-900 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {student.fullName} &lt;{recipientEmail}&gt;
                </span>
              </div>
              {config.email && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-400">CC:</span>
                  <span className="font-mono">{config.email}</span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 text-slate-600">
              <span className="font-bold text-slate-400 w-12 shrink-0 pt-0.5">Subject:</span>
              <span className="font-extrabold text-slate-950 flex-1 leading-snug">
                {displaySubject}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60">
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${status.badgeClass}`}>
                <Clock className="w-3 h-3" />
                {status.urgencyLabel}
              </span>
              <span className="text-[11px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full font-medium">
                कमरा: <strong>{student.roomNumber || 'Room Allocated'}</strong>
              </span>
              <span className="text-[11px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full font-medium">
                मासिक किराया: <strong>₹{status.rentAmount.toLocaleString('en-IN')}</strong>
              </span>
              <span className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-bold ml-auto">
                देय तिथि: {status.dueDateFormatted}
              </span>
            </div>
          </div>

          {/* Email Body Preview */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white space-y-4">
            <div className="max-w-xl mx-auto border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              
              {/* Email Letterhead */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-white tracking-wide">
                    {config.hostelName || 'Modanwal Boys Hostel'}
                  </h4>
                  <p className="text-[10px] text-slate-300">
                    प्रीमियम छात्र आवास • Near SRMU, Barabanki
                  </p>
                </div>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-md font-mono">
                  Official Notice
                </span>
              </div>

              {/* Email Inner Content */}
              <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                
                {/* Alert Box */}
                <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                  status.isDueToday 
                    ? 'bg-rose-50 border-rose-200 text-rose-900' 
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                    status.isDueToday ? 'text-rose-600' : 'text-amber-600'
                  }`} />
                  <div>
                    <span className="font-extrabold block text-xs">
                      {status.isDueToday ? 'आज कमरा किराया जमा करने की अंतिम तिथि है!' : `कमरा किराया देय तिथि निकट है (${status.daysRemaining} दिन शेष)`}
                    </span>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      यह सिस्टम द्वारा स्वचालित भेजा गया ईमेल है। कृपया समय पर किराया जमा करके रसीद प्राप्त करें।
                    </p>
                  </div>
                </div>

                <p>
                  नमस्ते <strong>{student.fullName}</strong>! 🙏
                </p>

                <p className="text-xs text-slate-600">
                  हॉस्टल प्रबंधन की ओर से यह ईमेल आपके आगामी महीने (<strong>{status.monthName}</strong>) के कमरे के किराए की देय तिथि के संबंध में भेजा गया है। विवरण नीचे दिया गया है:
                </p>

                {/* Bill Breakdown Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                    <span className="text-slate-500">छात्र का नाम:</span>
                    <span className="font-bold text-slate-900">{student.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                    <span className="text-slate-500">आवंटित कमरा:</span>
                    <span className="font-bold text-slate-900">{student.roomNumber || 'Room Assigned'} ({student.roomType === 'single' ? 'Single' : 'Twin'})</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                    <span className="text-slate-500">मासिक किराया:</span>
                    <span className="font-extrabold text-indigo-700 text-sm">₹{status.rentAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                    <span className="text-slate-500">किराया देय तिथि:</span>
                    <span className="font-bold text-slate-900">{status.dueDateFormatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">स्थिति:</span>
                    <span className="font-extrabold text-amber-600 uppercase">
                      {status.isPaid ? '🟢 Paid' : '🟡 Pending (Due Soon)'}
                    </span>
                  </div>
                </div>

                {/* UPI Payment Card */}
                <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-3.5 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-800 block">
                    💳 भुगतान के माध्यम (Payment Options):
                  </span>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-indigo-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Official UPI ID:</span>
                      <span className="font-mono font-bold text-indigo-950 text-xs">{emailContent.upiId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-2.5 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-indigo-900 leading-normal">
                    आप केयरटेकर <strong>{config.caretakerName || 'Alok Kumar Gupta'}</strong> जी को नकद (Cash) या यूपीआई द्वारा भुगतान कर सकते हैं।
                  </p>
                </div>

                {/* Footer Note */}
                <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  किसी भी असुविधा या प्रश्न के लिए वार्डन से संपर्क करें: <a href={`tel:${config.phone || '8887968504'}`} className="text-indigo-600 font-bold hover:underline">{config.phone || '8887968504'}</a>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyEmailText}
                className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedText ? 'Copied Full Text' : 'Copy Email Text'}</span>
              </button>

              <a
                href={emailContent.mailtoUrl}
                onClick={() => {
                  if (onEmailSent && student) {
                    onEmailSent(student, status.monthKey);
                  }
                }}
                className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-indigo-700 transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Mail App</span>
              </a>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Share on WhatsApp</span>
              </button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {onMarkRentPaid && !status.isPaid && (
                <button
                  type="button"
                  onClick={() => {
                    onMarkRentPaid(student);
                    onClose();
                  }}
                  className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Paid (जमा दर्ज करें)</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
