/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  X, 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Copy, 
  Check, 
  Users, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BookingInquiry, HostelConfig } from '../types';

interface RentReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: BookingInquiry[];
  config: HostelConfig;
  selectedMonth: string; // "YYYY-MM" e.g. "2026-08"
  onUpdateBooking: (booking: BookingInquiry) => void;
  initialFilter?: 'pending' | 'paid' | 'all';
  initialStudentId?: string | null;
}

type ReminderStatusFilter = 'pending' | 'paid' | 'all';
type ReminderChannel = 'whatsapp' | 'email';
type TemplateKey = 'gentle_pending' | 'urgent_pending' | 'parent_pending' | 'receipt_paid' | 'parent_receipt' | 'advance_notice' | 'custom';

export default function RentReminderModal({
  isOpen,
  onClose,
  students,
  config,
  selectedMonth,
  onUpdateBooking,
  initialFilter = 'pending',
  initialStudentId = null,
}: RentReminderModalProps) {
  const [filterType, setFilterType] = useState<ReminderStatusFilter>(initialFilter);
  const [channel, setChannel] = useState<ReminderChannel>('whatsapp');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(initialStudentId || (students[0]?.id || null));
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>(
    initialFilter === 'paid' ? 'receipt_paid' : 'gentle_pending'
  );
  const [customMessage, setCustomMessage] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bulkCopied, setBulkCopied] = useState(false);
  const [targetRecipient, setTargetRecipient] = useState<'student' | 'parent'>('student');

  // Format month for display (e.g. "August 2026")
  const formattedMonth = useMemo(() => {
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    } catch {
      return selectedMonth;
    }
  }, [selectedMonth]);

  // Compute status per student for selected month
  const studentDataList = useMemo(() => {
    return students.map(student => {
      const defaultRent = student.monthlyRentAmount || (student.roomType === 'single' ? config.singleRoomRent : config.twinRoomRent);
      const monthRecords = (student.paymentHistory || []).filter(r => r.month === selectedMonth);
      const rentRecord = monthRecords.find(r => r.type === 'rent');
      const isPaid = rentRecord ? rentRecord.status === 'paid' : student.rentStatus === 'paid';
      
      const extraPending = monthRecords
        .filter(r => r.type !== 'rent' && r.status === 'pending')
        .reduce((sum, r) => sum + r.amount, 0);
      const extraPaid = monthRecords
        .filter(r => r.type !== 'rent' && r.status === 'paid')
        .reduce((sum, r) => sum + r.amount, 0);

      const totalDue = (isPaid ? 0 : defaultRent) + extraPending + (student.dues || 0);
      const totalPaid = (isPaid ? defaultRent : 0) + extraPaid;

      return {
        student,
        defaultRent,
        isPaid,
        totalDue,
        totalPaid,
        paidDate: rentRecord?.paymentDate,
        paidMode: rentRecord?.paymentMode || 'UPI',
        extraPending,
        extraPaid
      };
    });
  }, [students, selectedMonth, config]);

  // Filtered list based on tab
  const filteredStudents = useMemo(() => {
    return studentDataList.filter(item => {
      if (filterType === 'pending') return !item.isPaid;
      if (filterType === 'paid') return item.isPaid;
      return true;
    });
  }, [studentDataList, filterType]);

  // Count summaries
  const pendingCount = studentDataList.filter(s => !s.isPaid).length;
  const paidCount = studentDataList.filter(s => s.isPaid).length;
  const totalPendingAmount = studentDataList
    .filter(s => !s.isPaid)
    .reduce((sum, s) => sum + s.totalDue, 0);

  // Selected student item
  const currentItem = useMemo(() => {
    return filteredStudents.find(s => s.student.id === selectedStudentId) || filteredStudents[0] || null;
  }, [filteredStudents, selectedStudentId]);

  // Index in list
  const currentIndex = useMemo(() => {
    if (!currentItem) return -1;
    return filteredStudents.findIndex(s => s.student.id === currentItem.student.id);
  }, [filteredStudents, currentItem]);

  // Helper to interpolate message template
  const generateMessage = (item: typeof currentItem, tmpl: TemplateKey, isForParent: boolean = false) => {
    if (!item) return '';
    const st = item.student;
    const roomText = st.roomNumber ? `Room ${st.roomNumber.replace('Room', '').trim()}` : 'Allocated Room';
    const rentVal = item.defaultRent.toLocaleString('en-IN');
    const dueVal = item.totalDue.toLocaleString('en-IN');
    const upiVal = config.upiId || 'Not set (Contact Caretaker)';
    const phoneVal = config.phone || '';
    const hostelName = config.hostelName || 'Modanwal Boys Hostel';

    if (tmpl === 'custom' && customMessage) {
      return customMessage
        .replace(/{student_name}/g, st.fullName)
        .replace(/{name}/g, st.fullName)
        .replace(/{room}/g, roomText)
        .replace(/{room_number}/g, roomText)
        .replace(/{month}/g, formattedMonth)
        .replace(/{rent_amount}/g, `₹${rentVal}`)
        .replace(/{amount}/g, `₹${rentVal}`)
        .replace(/{due_amount}/g, `₹${dueVal}`)
        .replace(/{dues}/g, `₹${dueVal}`)
        .replace(/{upi_id}/g, upiVal)
        .replace(/{upi}/g, upiVal)
        .replace(/{hostel_name}/g, hostelName)
        .replace(/{phone}/g, phoneVal);
    }

    if (tmpl === 'gentle_pending') {
      return `Namaste ${st.fullName}! 🙏\n\nThis is a gentle reminder regarding your monthly room rent for *${formattedMonth}* at *${hostelName}*.\n\n📋 *Stay & Rent Summary:*\n• *Resident:* ${st.fullName}\n• *Room:* ${roomText}\n• *Month:* ${formattedMonth}\n• *Monthly Rent:* ₹${rentVal}\n${item.totalDue > item.defaultRent ? `• *Total Outstanding (incl dues):* ₹${dueVal}\n` : ''}• *Status:* 🔴 Pending (बकाया)\n\n💳 *Payment Details:*\n• *UPI ID:* ${upiVal}\n• *Hostel Contact:* ${phoneVal}\n\nKindly clear the payment at your earliest convenience and share the payment screenshot. Thank you!`;
    }

    if (tmpl === 'urgent_pending') {
      return `⚠️ *URGENT RENT OVERDUE NOTICE*\n\nHello ${st.fullName},\nYour room rent payment for *${formattedMonth}* at *${hostelName}* is overdue.\n\n📌 *Details:*\n• *Student Name:* ${st.fullName}\n• *Room:* ${roomText}\n• *Total Due Amount:* ₹${dueVal}\n• *Month:* ${formattedMonth}\n\n⚡ Please settle this pending amount today via UPI: *${upiVal}* or contact the hostel office at ${phoneVal} to avoid late fee penalties. Thank you.`;
    }

    if (tmpl === 'parent_pending' || isForParent) {
      return `आदरणीय अभिभावक प्रणाम 🙏\n\nयह संदेश *${hostelName}* (हॉस्टल प्रबंधन) की तरफ से है।\n\nआपके सुपुत्र *${st.fullName}* (${roomText}) के *${formattedMonth}* महीने का कमरा किराया ₹${rentVal}${item.totalDue > item.defaultRent ? ` (कुल बकाया: ₹${dueVal})` : ''} अभी लंबित (Pending) है।\n\nकृपया किराया जल्द जमा करने की कृपा करें।\n• *UPI ID:* ${upiVal}\n• *संपर्क सूत्र:* ${phoneVal}\n\nसधन्यवाद,\n${hostelName}`;
    }

    if (tmpl === 'receipt_paid') {
      return `🧾 *RENT PAYMENT CONFIRMATION & RECEIPT*\n\nHello ${st.fullName}! 🎉\nThank you! We have successfully received your room rent for *${formattedMonth}* at *${hostelName}*.\n\n✅ *Receipt Summary:*\n• *Student Name:* ${st.fullName}\n• *Room:* ${roomText}\n• *Month:* ${formattedMonth}\n• *Amount Paid:* ₹${rentVal}\n• *Payment Mode:* ${item.paidMode}\n• *Date:* ${item.paidDate ? new Date(item.paidDate).toLocaleDateString('en-IN') : 'Confirmed'}\n• *Rent Status:* 🟢 PAID & CLEARED\n\nYour hostel account is up-to-date. Have a great month of studies!`;
    }

    if (tmpl === 'parent_receipt') {
      return `आदरणीय अभिभावक प्रणाम 🙏\n\nहम पुष्टि करते हैं कि *${hostelName}* में आपके सुपुत्र *${st.fullName}* (${roomText}) का *${formattedMonth}* महीने का किराया ₹${rentVal} सकुशल प्राप्त हो गया है।\n\n✅ *स्थिति:* 🟢 पूर्ण भुगतान (Paid)\n\nहॉस्टल प्रबंधन पर विश्वास बनाए रखने के लिए हार्दिक धन्यवाद!\n${hostelName}`;
    }

    if (tmpl === 'advance_notice') {
      return `📢 *UPCOMING MONTH RENT NOTICE*\n\nHello ${st.fullName},\nThis is an advance intimation that room rent for the upcoming month *${formattedMonth}* (₹${rentVal}) will be due shortly.\n\nRoom: ${roomText} | Hostel: ${hostelName}\nUPI ID: ${upiVal}\n\nThank you for timely payment!`;
    }

    return `Hello ${st.fullName}, this is a message from ${hostelName} regarding your room rent. Total due: ₹${dueVal}.`;
  };

  // Current compiled message
  const currentCompiledMessage = useMemo(() => {
    if (!currentItem) return '';
    return generateMessage(currentItem, activeTemplate, targetRecipient === 'parent');
  }, [currentItem, activeTemplate, customMessage, targetRecipient, formattedMonth, config]);

  // Dispatch via WhatsApp link
  const getWhatsAppUrl = (item: typeof currentItem, forParent: boolean = false) => {
    if (!item) return '#';
    const targetPhone = forParent 
      ? (item.student.parentPhone || item.student.guardianPhone || item.student.phone)
      : item.student.phone;
    
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = generateMessage(item, activeTemplate, forParent);
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
  };

  // Dispatch via Email mailto link
  const getMailtoUrl = (item: typeof currentItem) => {
    if (!item) return '#';
    const email = item.student.email;
    const subject = item.isPaid 
      ? `[Receipt] Room Rent Paid Confirmation (${formattedMonth}) - ${config.hostelName}`
      : `[Reminder] Hostel Rent Due for ${formattedMonth} - ${config.hostelName}`;
    const body = generateMessage(item, activeTemplate, false);
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Mark as reminded and trigger update
  const handleMarkReminded = (item: typeof currentItem, channelUsed: 'whatsapp' | 'email') => {
    if (!item) return;
    const nowStr = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const updatedStudent: BookingInquiry = {
      ...item.student,
      lastRentNoticeDate: nowStr,
      lastReminderSent: nowStr,
      lastReminderChannel: channelUsed,
      lastReminderType: item.isPaid ? 'receipt_confirmation' : 'pending_reminder'
    };

    onUpdateBooking(updatedStudent);
  };

  // Handle single student dispatch
  const handleSendSingle = (item: typeof currentItem, forParent: boolean = false) => {
    if (!item) return;
    handleMarkReminded(item, channel);
    
    if (channel === 'whatsapp') {
      const url = getWhatsAppUrl(item, forParent);
      window.open(url, '_blank');
    } else {
      const url = getMailtoUrl(item);
      window.location.href = url;
    }
  };

  // Advance to next in queue
  const handleSendAndAdvance = (forParent: boolean = false) => {
    if (!currentItem) return;
    handleSendSingle(currentItem, forParent);
    
    if (currentIndex < filteredStudents.length - 1) {
      setSelectedStudentId(filteredStudents[currentIndex + 1].student.id || null);
    }
  };

  // Copy text helper
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Bulk copy phone numbers
  const handleBulkCopyPhones = () => {
    const phones = filteredStudents
      .map(s => (targetRecipient === 'parent' && s.student.parentPhone ? s.student.parentPhone : s.student.phone))
      .filter(Boolean)
      .join(', ');
    navigator.clipboard.writeText(phones);
    setBulkCopied(true);
    setTimeout(() => setBulkCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="rent-reminder-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* TOP HEADER */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shadow-inner">
                <Smartphone className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-base sm:text-lg text-white">
                    Automated Rent Reminders & Digital Receipts
                  </h3>
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-bold px-2 py-0.5 rounded-full">
                    {formattedMonth}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Send 1-click WhatsApp notices, parent alerts, and payment receipts based on real-time rent status.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* FILTER & METRIC TABS BAR */}
          <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setFilterType('pending');
                  setActiveTemplate('gentle_pending');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterType === 'pending'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>🔴 Unpaid / Pending ({pendingCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterType('paid');
                  setActiveTemplate('receipt_paid');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterType === 'paid'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>🟢 Paid Receipts ({paidCount})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFilterType('all');
                  setActiveTemplate('advance_notice');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>👥 All ({students.length})</span>
              </button>
            </div>

            {/* Total Dues Callout */}
            {filterType === 'pending' && pendingCount > 0 && (
              <div className="text-xs font-medium text-slate-700 flex items-center gap-1.5 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                <span className="text-rose-600 font-bold">Total Pending for {formattedMonth}:</span>
                <span className="font-extrabold text-rose-700 font-mono">₹{totalPendingAmount.toLocaleString('en-IN')}</span>
              </div>
            )}

            {/* Channel Selection: WhatsApp vs Email */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Channel:</span>
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setChannel('whatsapp')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1 cursor-pointer transition-all ${
                    channel === 'whatsapp'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1 cursor-pointer transition-all ${
                    channel === 'email'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>

          {/* MAIN TWO-COLUMN BODY */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            
            {/* LEFT COLUMN: Student Queue & List (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col overflow-hidden bg-slate-50/50">
              <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {filterType === 'pending' ? 'Unpaid Students Queue' : filterType === 'paid' ? 'Paid Students Ledger' : 'All Students'}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                    {filteredStudents.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleBulkCopyPhones}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  title="Copy all phone numbers for broadcast"
                >
                  {bulkCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{bulkCopied ? 'Copied!' : 'Copy Numbers'}</span>
                </button>
              </div>

              {/* Students Scroll List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h5 className="text-sm font-bold text-slate-800">
                      {filterType === 'pending' ? 'All Clear! No pending rents.' : 'No students found.'}
                    </h5>
                    <p className="text-xs text-slate-500">
                      {filterType === 'pending' ? 'All students have paid their dues for this month.' : 'Change filter above to view other records.'}
                    </p>
                  </div>
                ) : (
                  filteredStudents.map((item, idx) => {
                    const st = item.student;
                    const isSelected = st.id === currentItem?.student.id;
                    const hasReminded = Boolean(st.lastReminderSent || st.lastRentNoticeDate);

                    return (
                      <div
                        key={st.id || idx}
                        onClick={() => setSelectedStudentId(st.id || null)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-white border-indigo-400 shadow-md ring-2 ring-indigo-500/10'
                            : 'bg-white/80 hover:bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                            item.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {st.roomNumber ? st.roomNumber.replace(/[^0-9]/g, '') || '#' : idx + 1}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h6 className="font-bold text-xs text-slate-900 truncate">{st.fullName}</h6>
                              {item.isPaid ? (
                                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-200">Paid</span>
                              ) : (
                                <span className="text-[9px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.2 rounded border border-rose-200">Pending</span>
                              )}
                            </div>

                            <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                              <span>📱 {st.phone}</span>
                              <span>•</span>
                              <span>Room: {st.roomNumber || 'Unassigned'}</span>
                            </div>

                            {hasReminded && (
                              <div className="text-[9px] text-slate-500 flex items-center gap-1 mt-1 font-medium">
                                <Clock className="w-2.5 h-2.5 text-indigo-500" />
                                <span>Reminded: {st.lastReminderSent || st.lastRentNoticeDate}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className={`text-xs font-black font-mono ${item.isPaid ? 'text-emerald-600' : 'text-rose-600'}`}>
                            ₹{item.isPaid ? item.defaultRent : item.totalDue}
                          </div>
                          <div className="text-[9px] text-slate-400">
                            {item.isPaid ? 'Paid rent' : 'Amount due'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Queue Navigation Footer */}
              {filteredStudents.length > 0 && (
                <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="text-slate-500 font-medium">
                    Queue: <span className="font-bold text-slate-900">{currentIndex + 1}</span> of <span className="font-bold text-slate-900">{filteredStudents.length}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={currentIndex <= 0}
                      onClick={() => setSelectedStudentId(filteredStudents[currentIndex - 1].student.id || null)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={currentIndex >= filteredStudents.length - 1}
                      onClick={() => setSelectedStudentId(filteredStudents[currentIndex + 1].student.id || null)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Template Selector, Live Preview & Dispatcher (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-4 bg-white">
              {currentItem ? (
                <>
                  {/* Selected Student Highlight Card */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-slate-900">{currentItem.student.fullName}</h4>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          currentItem.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {currentItem.isPaid ? '🟢 Rent Paid' : '🔴 Rent Pending'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Room: <span className="font-bold text-slate-800">{currentItem.student.roomNumber || 'Unassigned'}</span> | 
                        Mobile: <span className="font-mono font-bold text-slate-800">{currentItem.student.phone}</span>
                        {currentItem.student.parentPhone && (
                          <> | Parent: <span className="font-mono text-indigo-700 font-semibold">{currentItem.student.parentPhone}</span></>
                        )}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        {currentItem.isPaid ? 'Rent Paid' : 'Pending Rent'}
                      </div>
                      <div className={`text-base font-black font-mono ${currentItem.isPaid ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ₹{currentItem.isPaid ? currentItem.defaultRent : currentItem.totalDue}
                      </div>
                    </div>
                  </div>

                  {/* Template Picker & Recipient Option */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Select Message Template:</span>
                      </label>

                      {/* Send to Student vs Parent toggle */}
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-[10px] text-slate-500 font-medium">Send To:</span>
                        <button
                          type="button"
                          onClick={() => setTargetRecipient('student')}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                            targetRecipient === 'student'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          👤 Student
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetRecipient('parent')}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                            targetRecipient === 'parent'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          👪 Parent ({currentItem.student.parentPhone || 'No phone'})
                        </button>
                      </div>
                    </div>

                    {/* Template Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {!currentItem.isPaid ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setActiveTemplate('gentle_pending')}
                            className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                              activeTemplate === 'gentle_pending'
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold ring-1 ring-indigo-400'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="block text-[11px]">🙏 Gentle Notice</span>
                            <span className="text-[9px] text-slate-400">Standard reminder</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTemplate('urgent_pending')}
                            className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                              activeTemplate === 'urgent_pending'
                                ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold ring-1 ring-rose-400'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="block text-[11px]">⚠️ Urgent Overdue</span>
                            <span className="text-[9px] text-slate-400">Final notice/late fee</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTemplate('parent_pending')}
                            className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                              activeTemplate === 'parent_pending'
                                ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold ring-1 ring-amber-400'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="block text-[11px]">👪 Parent Notice</span>
                            <span className="text-[9px] text-slate-400">Hindi format for parent</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveTemplate('custom');
                              if (!customMessage) {
                                setCustomMessage(`Hello {name}, gentle reminder from {hostel_name} regarding your room rent of {amount} for {month}. UPI: {upi_id}.`);
                              }
                            }}
                            className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                              activeTemplate === 'custom'
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold ring-1 ring-indigo-400'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="block text-[11px]">✍️ Custom Edit</span>
                            <span className="text-[9px] text-slate-400">Write your own</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setActiveTemplate('receipt_paid')}
                            className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                              activeTemplate === 'receipt_paid'
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-400'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="block text-[11px]">🧾 Digital Receipt</span>
                            <span className="text-[9px] text-slate-400">Paid confirmation</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTemplate('parent_receipt')}
                            className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                              activeTemplate === 'parent_receipt'
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-400'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="block text-[11px]">👪 Parent Receipt</span>
                            <span className="text-[9px] text-slate-400">Confirmation in Hindi</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTemplate('advance_notice')}
                            className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                              activeTemplate === 'advance_notice'
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold ring-1 ring-indigo-400'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="block text-[11px]">📢 Advance Notice</span>
                            <span className="text-[9px] text-slate-400">Next month alert</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveTemplate('custom');
                              if (!customMessage) {
                                setCustomMessage(`Hello {name}, thank you for your rent payment of {amount} for {month} at {hostel_name}.`);
                              }
                            }}
                            className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                              activeTemplate === 'custom'
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold ring-1 ring-indigo-400'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="block text-[11px]">✍️ Custom Edit</span>
                            <span className="text-[9px] text-slate-400">Write your own</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Custom Message Editor if Custom is active */}
                  {activeTemplate === 'custom' && (
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>Edit custom template below:</span>
                        <span>Tags: {'{name}, {room}, {month}, {amount}, {due_amount}, {upi_id}'}</span>
                      </div>
                      <textarea
                        rows={4}
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Write your custom message using tags..."
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {/* Live Message Preview */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Live {channel === 'whatsapp' ? 'WhatsApp' : 'Email'} Preview:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(currentCompiledMessage, 'preview')}
                        className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === 'preview' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === 'preview' ? 'Copied!' : 'Copy Text'}</span>
                      </button>
                    </div>

                    <div className={`p-4 rounded-2xl border font-sans text-xs whitespace-pre-wrap leading-relaxed shadow-inner ${
                      channel === 'whatsapp'
                        ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                        : 'bg-indigo-50/40 border-indigo-200 text-slate-800'
                    }`}>
                      {currentCompiledMessage}
                    </div>
                  </div>

                  {/* ACTION DISPATCH CONTROLS */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {/* Send to Parent Quick Button */}
                      {currentItem.student.parentPhone && (
                        <button
                          type="button"
                          onClick={() => handleSendSingle(currentItem, true)}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Open WhatsApp for parent directly"
                        >
                          <Users className="w-3.5 h-3.5 text-amber-700" />
                          <span>WhatsApp Parent</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleMarkReminded(currentItem, channel)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Mark as sent in register without opening app"
                      >
                        <Check className="w-3.5 h-3.5 text-slate-500" />
                        <span>Mark Sent</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Primary 1-Click Send Button */}
                      <button
                        type="button"
                        onClick={() => handleSendSingle(currentItem, targetRecipient === 'parent')}
                        className={`flex-1 sm:flex-initial text-white text-xs font-black py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95 ${
                          channel === 'whatsapp'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        <span>
                          {channel === 'whatsapp' 
                            ? `Send WhatsApp to ${targetRecipient === 'parent' ? 'Parent' : currentItem.student.fullName.split(' ')[0]}`
                            : `Send Email to ${currentItem.student.fullName.split(' ')[0]}`}
                        </span>
                      </button>

                      {/* Send and Advance Queue */}
                      {filteredStudents.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleSendAndAdvance(targetRecipient === 'parent')}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-95"
                          title="Send and advance to next student in queue"
                        >
                          <span>Send & Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-slate-400 space-y-2 my-auto">
                  <Smartphone className="w-12 h-12 text-slate-300 mx-auto" />
                  <h5 className="text-sm font-bold text-slate-600">Select a student from the left queue</h5>
                  <p className="text-xs">Or change the rent status filter tab above to view other records.</p>
                </div>
              )}
            </div>

          </div>

          {/* MODAL FOOTER */}
          <div className="bg-slate-50 p-3 px-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>All notifications open securely in WhatsApp Web / App or default email client. No third-party API fee required.</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
