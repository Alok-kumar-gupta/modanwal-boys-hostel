/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Send, 
  Mail, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ChevronRight, 
  AlertCircle,
  Building,
  User,
  Smartphone,
  Sparkles,
  Info
} from 'lucide-react';
import { BookingInquiry, HostelConfig } from '../types';

interface SimulatedEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingInquiry | null;
  config: HostelConfig;
}

export default function SimulatedEmailModal({ isOpen, onClose, booking, config }: SimulatedEmailModalProps) {
  const [isSending, setIsSending] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsSending(true);
      const timer = setTimeout(() => {
        setIsSending(false);
      }, 1200); // 1.2s realistic simulated sending animation
      return () => clearTimeout(timer);
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const emailAddress = booking.email && booking.email !== 'No email provided' && booking.email.includes('@')
    ? booking.email
    : `${booking.fullName.toLowerCase().replace(/\s+/g, '') || 'student'}@srmu.edu.in`;

  // Get subject and content details based on booking status
  const getEmailContent = () => {
    const status = booking.status || 'pending';
    const roomName = booking.roomType === 'single' ? 'Single Room (Premium 1-Seater)' : 'Twin Sharing Room (Budget 2-Seater)';
    const rentAmount = booking.monthlyRentAmount || booking.configuredEstimate || (booking.roomType === 'single' ? config.singleRoomRent || 6000 : config.twinRoomRent || 3500);
    const depositAmount = booking.roomType === 'single' ? config.singleRoomDeposit || 3000 : config.twinRoomDeposit || 2000;

    switch (status) {
      case 'approved':
        return {
          subject: `🏠 Booking Approved & Room Assigned! Welcome to ${config.hostelName}`,
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badgeText: 'Approval Notification',
          htmlBody: (
            <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed font-sans">
              <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                  <span>Congratulations! Your Booking has been Approved</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  We are extremely pleased to welcome you as a resident of <strong>{config.hostelName}</strong>. Your physical space is locked and ready for occupancy.
                </p>
              </div>

              <p>Dear <strong>{booking.fullName}</strong>,</p>
              
              <p>
                We have verified your registration details and approved your housing inquiry. Your room and onboarding billing plan have been officially configured by the warden:
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Assigned Room Number:</span>
                  <span className="font-bold text-slate-900">{booking.roomNumber || 'Room Allocation Pending (Will assign on Arrival)'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Accommodation Choice:</span>
                  <span className="font-bold text-slate-900">{roomName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Configured Monthly Rent:</span>
                  <span className="font-bold text-slate-900 text-emerald-600">₹{rentAmount.toLocaleString('en-IN')}/Month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Refundable Security Deposit:</span>
                  <span className="font-bold text-slate-900">₹{depositAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
                  Your High-Speed Wi-Fi Account is Now ACTIVE!
                </h5>
                <p className="text-xs text-slate-600">
                  Your mobile number <strong>{booking.phone}</strong> is your student credential. Simply open the <strong>Student Portal</strong> on our website, log in using your phone, and you will find your exclusive Wi-Fi passwords and onboarding guidelines.
                </p>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl space-y-1.5 text-indigo-900">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Next Steps for Smooth Admission:</span>
                <ul className="list-decimal list-inside text-[11px] space-y-1 text-indigo-800">
                  <li>Keep your original Aadhaar ID and College Admission Slip ready for warden verification.</li>
                  <li>Coordinate your check-in date: <strong>{booking.checkInDate || 'Not specified'}</strong>.</li>
                  <li>Complete the security deposit payment to receive your room keys.</li>
                </ul>
              </div>

              <p className="pt-2 text-slate-500 text-[11px] border-t border-slate-100">
                If you or your parents need assistance with directions or travel schedules, please dial warden <strong>{config.caretakerName || 'Alok Bhaiya'}</strong> directly at <a href={`tel:${config.phone}`} className="text-indigo-600 font-bold hover:underline">{config.phone}</a>.
              </p>
            </div>
          )
        };
      case 'rejected':
        return {
          subject: `ℹ️ Update on your Housing Inquiry at ${config.hostelName}`,
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
          badgeText: 'Status Update',
          htmlBody: (
            <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed font-sans">
              <div className="bg-slate-50 border border-slate-250 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <Clock className="w-4.5 h-4.5 text-slate-500 shrink-0" />
                  <span>Housing Status Update: Completed or Archived</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  This email is to confirm that your booking or inquiry at {config.hostelName} has been processed, completed, or archived as requested.
                </p>
              </div>

              <p>Dear <strong>{booking.fullName}</strong>,</p>

              <p>
                This notification is to formally confirm that your student status/booking entry has been updated in our database. If you have checked out of the hostel or decided to cancel your reservation:
              </p>

              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                <li>Your student portal profile has been safely archived.</li>
                <li>Your Wi-Fi access codes have been de-provisioned.</li>
                <li>Any security deposit adjustments are being finalized by our accounts team.</li>
              </ul>

              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-900 text-xs">
                <strong>Refund Policy Note:</strong> If you are a departing resident who paid the refundable security deposit, your full refund (minus any standard dues/bills) will be transferred directly to your bank account/UPI within 7 business days as per our policy guidelines.
              </div>

              <p className="pt-2 text-slate-500 text-[11px] border-t border-slate-100">
                If this update is an error or if you wish to apply for a room again in the upcoming semester, please contact warden <strong>{config.caretakerName || 'Alok Bhaiya'}</strong> at <a href={`tel:${config.phone}`} className="text-indigo-600 font-bold hover:underline">{config.phone}</a>.
              </p>
            </div>
          )
        };
      case 'pending':
      default:
        return {
          subject: `⏳ Booking Inquiry Received & Under Review - ${config.hostelName}`,
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
          badgeText: 'Submission Confirmation',
          htmlBody: (
            <div className="space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed font-sans">
              <div className="bg-amber-50/70 border border-amber-150 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                  <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                  <span>Inquiry Under Review (सत्यापन चल रहा है)</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-normal">
                  Thank you for choosing {config.hostelName}. Your application has been logged into our admissions system and is currently being processed for room availability.
                </p>
              </div>

              <p>Dear <strong>{booking.fullName}</strong>,</p>

              <p>
                We have received your room request submission. Our warden team is currently verifying SRMU proximity distance, class batches, and specific bed layout choices.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-bold text-slate-950">{booking.fullName}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Phone Number:</span>
                  <span className="font-bold text-slate-950">{booking.phone}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Chosen Accommodation:</span>
                  <span className="font-bold text-slate-950">{roomName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Est. Check-In Date:</span>
                  <span className="font-bold text-slate-950">{booking.checkInDate || 'To be decided'}</span>
                </div>
              </div>

              <p>
                <strong>What happens next?</strong><br />
                Warden <strong>{config.caretakerName || 'Alok Bhaiya'}</strong> will review your inquiry or invite you for a physical room inspection. Once approved, you will receive an automated <strong>Booking Approved</strong> confirmation email with your room number and Student Portal keys.
              </p>

              <p className="pt-2 text-slate-500 text-[11px] border-t border-slate-100">
                Want to accelerate your reservation? Call us directly at <a href={`tel:${config.phone}`} className="text-indigo-600 font-bold hover:underline">{config.phone}</a>.
              </p>
            </div>
          )
        };
    }
  };

  const emailDetail = getEmailContent();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="bg-white rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          id="simulated-email-client-container"
        >
          
          {/* Header Bar */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/25 rounded-lg text-indigo-400">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <div>
                <h3 className="font-display font-black text-xs sm:text-sm tracking-wide uppercase">Email Notification Sandbox</h3>
                <p className="text-[10px] text-slate-400 font-sans">Simulating outbound automated transactional student email</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {isSending ? (
            /* Sending simulated screen */
            <div className="p-16 flex flex-col items-center justify-center text-center space-y-4 flex-1 min-h-[300px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 animate-pulse">
                  <Send className="w-6 h-6 animate-bounce text-indigo-600" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
              </div>
              <div className="space-y-1">
                <span className="font-display font-bold text-slate-900 text-sm">Drafting transaction email...</span>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Constructing responsive housing letter and updating mail queues for {emailAddress}
                </p>
              </div>
            </div>
          ) : (
            /* Completed Email Screen */
            <div className="flex-1 overflow-y-auto flex flex-col">
              
              {/* Mail Meta Header */}
              <div className="bg-slate-50 border-b border-slate-150 p-5 space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${emailDetail.badgeColor}`}>
                    {emailDetail.badgeText}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    SMTP Status: SENT (MOCK SUCCESS)
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-2 sm:col-span-1 text-slate-400 font-semibold">From:</span>
                    <span className="col-span-10 sm:col-span-11 font-semibold text-slate-800 font-mono text-[11px] sm:text-xs">
                      {config.hostelName.toLowerCase().replace(/\s+/g, '')}@gmail.com &lt;noreply@modanwalboyshostel.com&gt;
                    </span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-2 sm:col-span-1 text-slate-400 font-semibold">To:</span>
                    <span className="col-span-10 sm:col-span-11 font-bold text-indigo-600 font-mono text-[11px] sm:text-xs flex items-center gap-1">
                      {booking.fullName} &lt;{emailAddress}&gt;
                    </span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-2 sm:col-span-1 text-slate-400 font-semibold">Subject:</span>
                    <span className="col-span-10 sm:col-span-11 font-extrabold text-slate-900">
                      {emailDetail.subject}
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Styled Render Area */}
              <div className="p-6 sm:p-8 bg-slate-100 flex-1 flex justify-center">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-3xs space-y-6">
                  
                  {/* Email Brand Header */}
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-4 justify-between">
                    <div className="flex items-center gap-1.5 text-slate-900 font-display font-black text-sm sm:text-base">
                      <Building className="w-5 h-5 text-indigo-600" />
                      <span>{config.hostelName}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                      Admissions Desk
                    </span>
                  </div>

                  {/* Body HTML */}
                  {emailDetail.htmlBody}

                  {/* Email Footer */}
                  <div className="border-t border-slate-150 pt-5 text-center space-y-1">
                    <p className="text-[10px] text-slate-400 leading-normal">
                      This is an automated transaction service notification sent by Modanwal Boys Hostel reservation server. Replies to this email address are simulated and will be captured in the caretaker's dashboard console logs.
                    </p>
                    <p className="text-[9px] text-slate-400 font-semibold">
                      Tindola Cross Roads, Near SRMU Gate, Barabanki, Uttar Pradesh, 225003
                    </p>
                  </div>

                </div>
              </div>

              {/* Bottom confirmation details bar */}
              <div className="bg-slate-50 border-t border-slate-150 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500 font-medium text-center sm:text-left flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  We have simulated transmitting this HTML confirmation safely.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold rounded-xl text-xs shadow-3xs transition-colors cursor-pointer w-full sm:w-auto"
                >
                  Close Mailbox Preview
                </button>
              </div>

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
