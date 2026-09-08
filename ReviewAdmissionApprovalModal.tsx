/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Building, 
  User, 
  Phone, 
  Mail, 
  Home, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  Bed, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  MessageSquare, 
  Check, 
  Sparkles,
  AlertCircle,
  FileText,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BookingInquiry, HostelConfig } from '../types';

interface ReviewAdmissionApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HostelConfig;
  bookings: BookingInquiry[];
  selectedStudentId?: string | null;
  onUpdateBooking: (updated: BookingInquiry) => void;
  onDeleteBooking: (id: string) => void;
}

export default function ReviewAdmissionApprovalModal({
  isOpen,
  onClose,
  config,
  bookings,
  selectedStudentId,
  onUpdateBooking,
  onDeleteBooking
}: ReviewAdmissionApprovalModalProps) {
  // Pending students (either status === 'pending' or ownerPermission === false or self-register)
  const pendingStudents = bookings.filter(
    (b) => b.status === 'pending' || b.ownerPermission === false || b.inquiryType === 'self-register'
  );

  const [activeId, setActiveId] = useState<string | null>(selectedStudentId || (pendingStudents[0]?.id || null));

  // Edit fields for active student
  const activeStudent = bookings.find((b) => b.id === activeId) || pendingStudents[0] || null;

  const [roomNumber, setRoomNumber] = useState<string>('');
  const [roomType, setRoomType] = useState<'single' | 'twin' | 'full'>('single');
  const [monthlyRent, setMonthlyRent] = useState<number>(0);
  const [paidDeposit, setPaidDeposit] = useState<number>(0);
  const [rentStatus, setRentStatus] = useState<'paid' | 'pending'>('pending');
  const [rentDueDay, setRentDueDay] = useState<number>(5);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Sync state when active student changes
  React.useEffect(() => {
    if (activeStudent) {
      setRoomNumber(activeStudent.roomNumber || '');
      const type = (activeStudent.roomType as 'single' | 'twin' | 'full') || 'single';
      setRoomType(type);
      
      const defaultRent = type === 'single' ? (config.singleRoomRent || 4500) : (config.twinRoomRent || 3000);
      setMonthlyRent(activeStudent.monthlyRentAmount || activeStudent.configuredEstimate || defaultRent);
      
      const defaultDeposit = type === 'single' ? (config.singleRoomDeposit || 3000) : (config.twinRoomDeposit || 2000);
      setPaidDeposit(activeStudent.paidDeposit !== undefined ? activeStudent.paidDeposit : defaultDeposit);
      
      setRentStatus(activeStudent.rentStatus || 'pending');
      setRentDueDay(activeStudent.rentDueDay || config.defaultRentDueDay || 5);
      setAdminNotes(activeStudent.notes || '');
    }
  }, [activeStudent?.id, config]);

  if (!isOpen) return null;

  const handleApprove = (student: BookingInquiry) => {
    const updated: BookingInquiry = {
      ...student,
      roomNumber: roomNumber.trim() || student.roomNumber || '101',
      roomType,
      monthlyRentAmount: Number(monthlyRent) || (roomType === 'single' ? config.singleRoomRent : config.twinRoomRent),
      paidDeposit: Number(paidDeposit),
      rentStatus,
      rentDueDay: Number(rentDueDay) || 5,
      status: 'approved',
      ownerPermission: true, // Grants access to Student Dashboard!
      notes: adminNotes.trim() ? `${student.notes ? student.notes + ' | ' : ''}[Caretaker Approved: ${new Date().toLocaleDateString('hi-IN')}]: ${adminNotes.trim()}` : student.notes,
    };

    onUpdateBooking(updated);
    setSuccessMessage(`✓ ${student.fullName} का एडमिशन स्वीकृत हो गया है और स्टूडेंट पोर्टल चालू कर दिया गया है!`);
    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  const handleReject = (student: BookingInquiry) => {
    if (confirm(`क्या आप ${student.fullName} का रजिस्ट्रेशन अस्वीकृत (Reject) करना चाहते हैं?`)) {
      const updated: BookingInquiry = {
        ...student,
        status: 'rejected',
        ownerPermission: false,
      };
      onUpdateBooking(updated);
    }
  };

  const handleDelete = (student: BookingInquiry) => {
    if (confirm(`क्या आप ${student.fullName} का रिकॉर्ड हमेशा के लिए हटाना चाहते हैं?`)) {
      if (student.id) {
        onDeleteBooking(student.id);
        if (activeId === student.id) {
          const remaining = pendingStudents.filter((s) => s.id !== student.id);
          setActiveId(remaining[0]?.id || null);
        }
      }
    }
  };

  const getWhatsAppLink = (student: BookingInquiry) => {
    const isApproved = student.status === 'approved' && student.ownerPermission === true;
    const msg = isApproved
      ? `नमस्ते ${student.fullName}! Modanwal Boys Hostel में आपका कमरा (${student.roomNumber || 'अलॉटेड'}) स्वीकृत (Approve) कर दिया गया है। आप अपने मोबाइल नंबर (${student.phone}) से हमारी वेबसाइट पर 'Student Portal' में लॉगिन करके अपना डिजिटल आईडी कार्ड, मेस मेनू व वाई-फाई देख सकते हैं। - ${config.caretakerName} (${config.phone})`
      : `नमस्ते ${student.fullName}, Modanwal Boys Hostel में आपके प्रवेश आवेदन के संबंध में हमें कुछ जानकारी चाहिए। कृपया संपर्क करें। - ${config.caretakerName}`;
    return `https://wa.me/${student.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden text-slate-900 dark:text-slate-100"
        id="review-admission-approval-modal"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 px-5 sm:px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 backdrop-blur-md rounded-xl border border-white/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
                Admission Approval Desk
              </span>
              <h3 className="text-base sm:text-lg font-display font-extrabold leading-tight">
                नया छात्र QR रजिस्ट्रेशन सत्यापन व अप्रूवल (Review & Approve)
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-6 py-3 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main Body: 2 Columns (Student List on left, Detailed Review & Room/Rent Allocation on right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[80vh] overflow-y-auto">
          {/* Left Column: List of Admissions (4 cols) */}
          <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-3 sm:p-4 space-y-2.5 overflow-y-auto max-h-[75vh]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                पेंडिंग छात्र ({pendingStudents.length})
              </span>
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                QR Registrations
              </span>
            </div>

            {pendingStudents.length === 0 ? (
              <div className="text-center py-8 px-4 text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                <p className="text-xs font-medium">कोई पेंडिंग रजिस्ट्रेशन नहीं है। सभी छात्र अप्रूव हो चुके हैं।</p>
              </div>
            ) : (
              pendingStudents.map((st) => {
                const isSelected = activeStudent?.id === st.id;
                const isApproved = st.status === 'approved' && st.ownerPermission === true;

                return (
                  <button
                    key={st.id}
                    onClick={() => setActiveId(st.id || null)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {st.fullName}
                          </span>
                          {st.inquiryType === 'self-register' && (
                            <span className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-extrabold px-1.5 py-0.2 rounded">
                              QR
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          📞 {st.phone}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {st.course || 'Course not specified'}
                        </p>
                      </div>

                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Active Student Review & Approval Controls (8 cols) */}
          <div className="md:col-span-8 p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[75vh]">
            {activeStudent ? (
              <div className="space-y-6">
                {/* Top Profile Card */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {activeStudent.photoUrl ? (
                      <img
                        src={activeStudent.photoUrl}
                        alt={activeStudent.fullName}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-300 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl border-2 border-indigo-200 dark:border-indigo-800 shrink-0">
                        {activeStudent.fullName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base sm:text-lg font-display font-extrabold text-slate-900 dark:text-white">
                          {activeStudent.fullName}
                        </h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          activeStudent.status === 'approved' && activeStudent.ownerPermission
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {activeStudent.status === 'approved' && activeStudent.ownerPermission ? '✓ Portal Active' : '⏳ Pending Caretaker Approval'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        📱 विद्यार्थी फोन: <strong className="text-slate-800 dark:text-slate-200">{activeStudent.phone}</strong>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        👨‍👦 पिता का नाम: <strong className="text-slate-800 dark:text-slate-200">{activeStudent.fatherName || 'Not specified'}</strong> (फोन: {activeStudent.parentPhone || 'N/A'})
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp and Call Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href={`tel:${activeStudent.phone.replace(/[^0-9+]/g, '')}`}
                      className="flex-1 sm:flex-initial px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Call Student"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>कॉल करें</span>
                    </a>
                    <a
                      href={getWhatsAppLink(activeStudent)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                      title="Send WhatsApp Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Student Submitted Details Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">कॉलेज / संस्थान</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                      {activeStudent.course?.split('|')[1] || activeStudent.course || 'SRMU'}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">कोर्स व वर्ष</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                      {activeStudent.course?.split('|')[0] || 'B.Tech'} ({activeStudent.studyYear || '1st Year'})
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">गृह जिला / स्थायी पता</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                      {activeStudent.permanentAddress || activeStudent.hometown || 'Not provided'}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">छात्र द्वारा चुना गया रूम</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize block mt-0.5">
                      {activeStudent.roomType === 'single' ? 'Single (1-Seater)' : activeStudent.roomType === 'twin' ? 'Twin Sharing (2-Seater)' : 'Full Room'}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">छात्र द्वारा भरा गया रूम नं.</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                      {activeStudent.roomNumber || 'खाली छोड़ा गया (Not assigned)'}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">चेक-इन तिथि</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                      {activeStudent.checkInDate || 'Today'}
                    </span>
                  </div>
                </div>

                {activeStudent.customNotes && (
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200">
                    <strong className="block text-[11px] font-extrabold uppercase text-indigo-700 dark:text-indigo-300 mb-0.5">
                      छात्र की टिप्पणी / आवश्यकता:
                    </strong>
                    <p className="italic">"{activeStudent.customNotes}"</p>
                  </div>
                )}

                {/* OWNER APPROVAL & ROOM / RENT ALLOTMENT SECTION */}
                <div className="bg-indigo-50/50 dark:bg-indigo-950/40 p-4 sm:p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/60 pb-2">
                    <h5 className="font-display font-extrabold text-sm text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-indigo-600" />
                      <span>कमरा आवंटन व किराया निर्धारण (Set Room & Rent)</span>
                    </h5>
                    <span className="text-[10px] bg-indigo-600 text-white font-black px-2 py-0.5 rounded-full">
                      Caretaker Controls
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Room Type */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        कमरा प्रकार (Room Type)
                      </label>
                      <select
                        value={roomType}
                        onChange={(e) => {
                          const val = e.target.value as 'single' | 'twin' | 'full';
                          setRoomType(val);
                          if (val === 'single') {
                            setMonthlyRent(config.singleRoomRent || 4500);
                            setPaidDeposit(config.singleRoomDeposit || 3000);
                          } else {
                            setMonthlyRent(config.twinRoomRent || 3000);
                            setPaidDeposit(config.twinRoomDeposit || 2000);
                          }
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                      >
                        <option value="single">Single Room (1-Seater)</option>
                        <option value="twin">Twin Sharing (2-Seater)</option>
                        <option value="full">Full Private Room</option>
                      </select>
                    </div>

                    {/* Room Number Assignment */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        कमरा नंबर आवंटित करें (Allot Room Number) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा. 101, 102, 201, 203"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded-xl text-xs font-black text-indigo-700 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Monthly Rent */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        मासिक किराया दर (Monthly Rent ₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          value={monthlyRent}
                          onChange={(e) => setMonthlyRent(Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>

                    {/* Security Deposit */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        जमानत राशि (Security Deposit ₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          value={paidDeposit}
                          onChange={(e) => setPaidDeposit(Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleReject(activeStudent)}
                        className="flex-1 sm:flex-initial px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleDelete(activeStudent)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* APPROVE BUTTON */}
                    <button
                      onClick={() => handleApprove(activeStudent)}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                      id="approve-student-admission-btn"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>✅ Approve & Grant Student Portal Access (स्वीकृत करें व पोर्टल चालू करें)</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-3">
                <Users className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-medium">बाईं सूची से किसी भी छात्र पर क्लिक करके उसकी डिटेल्स चेक व अप्रूव करें।</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
