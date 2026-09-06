/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Shield, 
  Key, 
  Lock, 
  Unlock, 
  Phone, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Plus, 
  FileText, 
  Bell, 
  GraduationCap, 
  DollarSign, 
  Home, 
  Eye, 
  Download,
  Filter,
  Check,
  Mail,
  Clock,
  RotateCcw
} from 'lucide-react';
import { BookingInquiry, HostelConfig, PaymentRecord } from '../types';
import AutomatedRentEmailModal from './AutomatedRentEmailModal';
import { getStudentRentApproachingStatus } from '../lib/rentEmailAutomation';
import { triggerFileDownload } from '../lib/pdfExportUtil';

interface StudentRecordMaintainTabProps {
  bookings: BookingInquiry[];
  config: HostelConfig;
  onAddBooking: (newInquiry: Omit<BookingInquiry, 'id' | 'timestamp'>) => void;
  onUpdateBooking: (updated: BookingInquiry) => void;
  onDeleteBooking: (id: string) => void;
  onOpenStudentDashboard?: (studentId: string) => void;
  onOpenRentReminders?: (type: 'pending' | 'paid', specificId?: string | null) => void;
  onOpenAutoEmailManager?: () => void;
}

export default function StudentRecordMaintainTab({
  bookings,
  config,
  onAddBooking,
  onUpdateBooking,
  onDeleteBooking,
  onOpenStudentDashboard,
  onOpenRentReminders,
  onOpenAutoEmailManager
}: StudentRecordMaintainTabProps) {
  // Modal State for Add Student
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Modal State for Edit/View Student
  const [editingStudent, setEditingStudent] = useState<BookingInquiry | null>(null);
  // Modal State for Automated Rent Email Preview & Send
  const [selectedEmailStudent, setSelectedEmailStudent] = useState<BookingInquiry | null>(null);
  // Delete Confirmation Modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [clearAllConfirmText, setClearAllConfirmText] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRent, setFilterRent] = useState<'all' | 'paid' | 'pending'>('all');
  const [filterRoom, setFilterRoom] = useState<'all' | 'single' | 'twin'>('all');
  const [filterPermission, setFilterPermission] = useState<'all' | 'granted' | 'pending'>('all');

  // New Student Form Fields
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRoomType, setNewRoomType] = useState<'single' | 'twin'>('single');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newMonthlyRent, setNewMonthlyRent] = useState<number>(config.singleRoomRent || 4500);
  const [newPaidDeposit, setNewPaidDeposit] = useState<number>(config.singleRoomDeposit || 3000);
  const [newRentDueDay, setNewRentDueDay] = useState<number>(config.defaultRentDueDay || 5);
  const [newDues, setNewDues] = useState<number>(0);
  const [newRentStatus, setNewRentStatus] = useState<'paid' | 'pending'>('pending');
  const [newStudyYear, setNewStudyYear] = useState('1st Year');
  const [newCourse, setNewCourse] = useState('B.Tech (Computer Science & Engg)');
  const [newFatherName, setNewFatherName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newHometown, setNewHometown] = useState('');
  const [newAadhar, setNewAadhar] = useState('');
  const [newCheckInDate, setNewCheckInDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newOwnerPermission, setNewOwnerPermission] = useState(true);
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Auto-update rent and deposit suggestion when room type changes
  const handleRoomTypeChange = (type: 'single' | 'twin') => {
    setNewRoomType(type);
    if (type === 'single') {
      setNewMonthlyRent(config.singleRoomRent || 4500);
      setNewPaidDeposit(config.singleRoomDeposit || 3000);
    } else {
      setNewMonthlyRent(config.twinRoomRent || 3000);
      setNewPaidDeposit(config.twinRoomDeposit || 2000);
    }
  };

  // Helper to check if a student has dashboard permission
  const isDashboardPermitted = (student: BookingInquiry) => {
    if (student.ownerPermission !== undefined) {
      return student.ownerPermission;
    }
    return student.status === 'approved';
  };

  // Toggle Permission for a Student
  const handleTogglePermission = (student: BookingInquiry) => {
    const currentlyPermitted = isDashboardPermitted(student);
    const updated: BookingInquiry = {
      ...student,
      ownerPermission: !currentlyPermitted,
      status: !currentlyPermitted ? 'approved' : student.status
    };
    onUpdateBooking(updated);

    showToast(
      !currentlyPermitted
        ? `✓ ${student.fullName} को स्टूडेंट डैशबोर्ड की अनुमति दे दी गई है! (Permission Granted)`
        : `🔒 ${student.fullName} की स्टूडेंट डैशबोर्ड अनुमति रोक दी गई है। (Permission Revoked)`
    );
  };

  // Toggle Rent Status
  const handleToggleRentStatus = (student: BookingInquiry) => {
    const nextStatus = student.rentStatus === 'paid' ? 'pending' : 'paid';
    const updated: BookingInquiry = {
      ...student,
      rentStatus: nextStatus
    };
    onUpdateBooking(updated);

    showToast(
      nextStatus === 'paid'
        ? `✓ ${student.fullName} का किराया 'जमा (PAID)' दर्ज हो गया है!`
        : `⚠️ ${student.fullName} का किराया 'बकाया (PENDING)' दर्ज किया गया!`
    );
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Handle Submit New Student
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newName.trim()) {
      setFormError('कृपया छात्र का नाम दर्ज करें (Student Name is required)');
      return;
    }
    const cleanPhone = newPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setFormError('कृपया 10-अंकों का वैध मोबाइल नंबर दर्ज करें (Valid 10-digit phone required)');
      return;
    }

    const newStudentData: Omit<BookingInquiry, 'id' | 'timestamp'> = {
      fullName: newName.trim(),
      fatherName: newFatherName.trim(),
      guardianName: newFatherName.trim(),
      course: newCourse.trim() || 'B.Tech (Computer Science & Engg)',
      phone: cleanPhone,
      email: newEmail.trim() || `${cleanPhone}@modanwalhostel.local`,
      roomType: newRoomType,
      roomNumber: newRoomNumber.trim() || (newRoomType === 'single' ? 'Room 101' : 'Room 201'),
      monthlyRentAmount: Number(newMonthlyRent) || (newRoomType === 'single' ? config.singleRoomRent : config.twinRoomRent),
      paidDeposit: Number(newPaidDeposit) || 0,
      dues: Number(newDues) || 0,
      rentDueDay: Number(newRentDueDay) || (config.defaultRentDueDay || 5),
      rentStatus: newRentStatus,
      status: 'approved',
      ownerPermission: newOwnerPermission,
      studyYear: newStudyYear,
      checkInDate: newCheckInDate,
      parentPhone: newParentPhone.trim(),
      guardianPhone: newParentPhone.trim(),
      hometown: newHometown.trim(),
      aadharNumber: newAadhar.trim(),
      notes: newNotes.trim(),
      addons: [],
      inquiryType: 'prebook',
      paymentHistory: [
        {
          id: `pay-${Date.now()}`,
          month: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          amount: Number(newMonthlyRent) || 0,
          status: newRentStatus,
          paymentDate: newRentStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
          paymentMode: newRentStatus === 'paid' ? 'cash' : undefined,
          type: 'rent',
          notes: 'Initial admission entry'
        }
      ]
    };

    onAddBooking(newStudentData);
    setIsAddModalOpen(false);

    // Reset Form
    setNewName('');
    setNewFatherName('');
    setNewCourse('B.Tech (Computer Science & Engg)');
    setNewPhone('');
    setNewEmail('');
    setNewRoomNumber('');
    setNewParentPhone('');
    setNewHometown('');
    setNewAadhar('');
    setNewNotes('');
    setNewDues(0);
    setNewRentStatus('pending');

    showToast(`✓ नया छात्र "${newStudentData.fullName}" सफलतापूर्वक डेटाबेस में सुरक्षित हो गया!`);
  };

  // Filtered List
  const filteredStudents = useMemo(() => {
    return bookings.filter(b => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (b.fullName || '').toLowerCase().includes(q);
        const matchesFather = (b.fatherName || b.guardianName || '').toLowerCase().includes(q);
        const matchesCourse = (b.course || b.studyYear || '').toLowerCase().includes(q);
        const matchesPhone = (b.phone || '').includes(q);
        const matchesRoom = (b.roomNumber || '').toLowerCase().includes(q);
        const matchesHometown = (b.hometown || '').toLowerCase().includes(q);
        if (!matchesName && !matchesFather && !matchesCourse && !matchesPhone && !matchesRoom && !matchesHometown) {
          return false;
        }
      }

      // Rent filter
      if (filterRent === 'paid' && b.rentStatus !== 'paid') return false;
      if (filterRent === 'pending' && b.rentStatus === 'paid') return false;

      // Room filter
      if (filterRoom !== 'all' && b.roomType !== filterRoom) return false;

      // Permission filter
      const permitted = isDashboardPermitted(b);
      if (filterPermission === 'granted' && !permitted) return false;
      if (filterPermission === 'pending' && permitted) return false;

      return true;
    });
  }, [bookings, searchQuery, filterRent, filterRoom, filterPermission]);

  // Key metrics calculation
  const totalStudents = bookings.length;
  const permittedCount = bookings.filter(isDashboardPermitted).length;
  const rentPaidCount = bookings.filter(b => b.rentStatus === 'paid').length;
  const rentPendingCount = bookings.filter(b => b.rentStatus !== 'paid').length;
  const singleCount = bookings.filter(b => b.roomType === 'single').length;
  const twinCount = bookings.filter(b => b.roomType === 'twin').length;

  // Approaching Rent count for automated notification alert
  const approachingStudentsCount = useMemo(() => {
    return bookings.filter(b => {
      if (b.status !== 'approved' || b.rentStatus === 'paid') return false;
      const st = getStudentRentApproachingStatus(b, config);
      return st.isApproaching || st.isDueToday;
    }).length;
  }, [bookings, config]);

  // Pending ID Card Download Permission Requests
  const pendingIdCardRequests = useMemo(() => {
    return bookings.filter(b => b.idCardPermissionRequested);
  }, [bookings]);

  // Handle Approve +1 ID Card Download
  const handleApproveIdCardDownload = (student: BookingInquiry) => {
    const currentLimit = student.idCardDownloadLimit ?? 1;
    const currentCount = student.idCardDownloadCount || 0;
    const nextLimit = Math.max(currentCount, currentLimit) + 1;
    const updated: BookingInquiry = {
      ...student,
      idCardDownloadLimit: nextLimit,
      idCardPermissionRequested: false,
    };
    onUpdateBooking(updated);
    showToast(`✓ ${student.fullName} को 1 बार और ID कार्ड डाउनलोड करने की अनुमति दे दी गई! (अब कुल सीमा: ${nextLimit} बार)`);
  };

  // Handle Approve All ID Card Requests
  const handleApproveAllIdCardRequests = () => {
    pendingIdCardRequests.forEach(student => {
      const currentLimit = student.idCardDownloadLimit ?? 1;
      const currentCount = student.idCardDownloadCount || 0;
      onUpdateBooking({
        ...student,
        idCardDownloadLimit: Math.max(currentCount, currentLimit) + 1,
        idCardPermissionRequested: false,
      });
    });
    showToast(`✓ सभी ${pendingIdCardRequests.length} छात्रों के ID कार्ड डाउनलोड अनुरोध स्वीकृत कर दिए गए!`);
  };

  // Handle Update Download Limit Quota
  const handleUpdateDownloadLimit = (student: BookingInquiry, newLimit: number) => {
    const updated: BookingInquiry = {
      ...student,
      idCardDownloadLimit: newLimit,
      idCardPermissionRequested: newLimit > (student.idCardDownloadCount || 0) ? false : student.idCardPermissionRequested,
    };
    onUpdateBooking(updated);
    showToast(`✓ ${student.fullName} के लिए ID कार्ड डाउनलोड सीमा ${newLimit === 999 ? 'असीमित' : `${newLimit} बार`} तय की गई!`);
  };

  // Handle Reset Download Count to 0
  const handleResetDownloadCount = (student: BookingInquiry) => {
    const updated: BookingInquiry = {
      ...student,
      idCardDownloadCount: 0,
      idCardPermissionRequested: false,
    };
    onUpdateBooking(updated);
    showToast(`✓ ${student.fullName} का ID कार्ड डाउनलोड काउंटर 0 पर रीसेट कर दिया गया!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      alert('No student records to export.');
      return;
    }
    const headers = ['Full Name', 'Phone', 'Room Number', 'Room Type', 'Study Year', 'Rent Status', 'Monthly Rent', 'Dashboard Permitted', 'Parent Phone', 'Hometown', 'Check-in Date'];
    const rows = bookings.map(b => [
      `"${(b.fullName || '').replace(/"/g, '""')}"`,
      `"${(b.phone || '').replace(/"/g, '""')}"`,
      `"${(b.roomNumber || '').replace(/"/g, '""')}"`,
      `"${(b.roomType || '').replace(/"/g, '""')}"`,
      `"${(b.studyYear || '').replace(/"/g, '""')}"`,
      `"${(b.rentStatus || 'pending').replace(/"/g, '""')}"`,
      `"${b.monthlyRentAmount || ''}"`,
      `"${isDashboardPermitted(b) ? 'Yes' : 'No'}"`,
      `"${(b.parentPhone || b.guardianPhone || '').replace(/"/g, '""')}"`,
      `"${(b.hometown || '').replace(/"/g, '""')}"`,
      `"${(b.checkInDate || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `Modanwal_Hostel_Students_${new Date().toISOString().split('T')[0]}.csv`;
    triggerFileDownload(blob, filename);
  };

  const handleClearAllStudents = () => {
    if (clearAllConfirmText.trim().toUpperCase() === 'DELETE') {
      bookings.forEach(s => {
        if (s.id) {
          onDeleteBooking(s.id);
        }
      });
      setShowClearAllModal(false);
      setClearAllConfirmText('');
      showToast('✓ सभी छात्र रिकॉर्ड सफलतापूर्वक डेटाबेस से हटा दिए गए!');
    }
  };

  return (
    <div className="space-y-6" id="student-record-maintain-tab">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button 
            onClick={() => setSuccessToast('')}
            className="text-white hover:text-emerald-200 cursor-pointer ml-4 font-extrabold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header & Quick Action Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-7 rounded-3xl shadow-md border border-indigo-900/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-400/30">
              छात्र रिकॉर्ड रजिस्टर (Student Record Maintain)
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              लाइव डेटाबेस से सिंक (Firestore Connected)
            </span>
          </div>
          <h3 className="font-display font-black text-lg sm:text-xl text-white">
            हॉस्टल छात्र रिकॉर्ड एवं डैशबोर्ड अनुमति प्रबंधन
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            यहाँ आप नए छात्रों का रिकॉर्ड डेटाबेस में जोड़ सकते हैं, कमरा और किराया तय कर सकते हैं, तथा नियंत्रित कर सकते हैं कि कौन सा छात्र अपने मोबाइल नंबर और नाम से <strong>स्टूडेंट डैशबोर्ड</strong> खोल सकता है।
          </p>
        </div>

        {/* Primary Add Button */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm py-3 px-5 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer border border-indigo-400 hover:scale-[1.02] active:scale-95"
            id="btn-add-new-student-record"
          >
            <UserPlus className="w-4 h-4 text-indigo-200" />
            <span>+ नया छात्र रिकॉर्ड जोड़ें (Add Student)</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-3 px-4 rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            title="Download CSV register"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>Export CSV</span>
          </button>

          {bookings.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setClearAllConfirmText('');
                setShowClearAllModal(true);
              }}
              className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-rose-100 font-bold text-xs py-3 px-3 rounded-2xl border border-rose-800/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Delete all student records from database"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>सभी रिकॉर्ड हटाएं</span>
            </button>
          )}
        </div>
      </div>

      {/* ID Card Download Permission Requests Banner */}
      {pendingIdCardRequests.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 flex-wrap">
                <span>{pendingIdCardRequests.length} छात्र ने ID कार्ड दोबारा डाउनलोड करने की अनुमति मांगी है!</span>
                <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-rose-200">
                  अनुमोदन अपेक्षित (Approval Needed)
                </span>
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                अनुरोधकर्ता: <strong className="text-slate-800 font-bold">{pendingIdCardRequests.map(s => `${s.fullName} (${s.roomNumber || 'कमरा N/A'})`).join(', ')}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-approve-all-id-downloads"
            onClick={handleApproveAllIdCardRequests}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Check className="w-4 h-4" />
            <span>सभी को +1 डाउनलोड अप्रूव करें (Approve All)</span>
          </button>
        </div>
      )}

      {/* Approaching Rent Automated Notification Alert Banner */}
      {approachingStudentsCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/20">
              <Mail className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <span className="font-extrabold text-xs sm:text-sm block">
                ⏰ {approachingStudentsCount} छात्रों की कमरा किराया देय तारीख निकट है! (Rent Due Date Approaching)
              </span>
              <span className="text-[11px] text-amber-100 block">
                ऑटोमेटेड ईमेल रिमाइंडर सक्रिय है। आप छात्रों को स्वचालित ईमेल सूचना भेज सकते हैं।
              </span>
            </div>
          </div>
          {onOpenAutoEmailManager && (
            <button
              type="button"
              onClick={onOpenAutoEmailManager}
              className="py-2.5 px-4 bg-white text-amber-900 hover:bg-amber-50 font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-amber-800" />
              <span>ऑटो ईमेल डैशबोर्ड खोलें &rarr;</span>
            </button>
          )}
        </div>
      )}

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">कुल छात्र (Total)</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            {totalStudents}
          </div>
          <span className="text-[10px] text-slate-500 block">
            {singleCount} सिंगल • {twinCount} ट्विन शेयर
          </span>
        </div>

        {/* Dashboard Permissions Granted */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">डैशबोर्ड अनुमति (Permitted)</span>
            <Key className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 font-display">
            {permittedCount} <span className="text-xs font-medium text-slate-400">/ {totalStudents}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium block">
            {totalStudents - permittedCount > 0 ? `${totalStudents - permittedCount} अनुमति प्रतीक्षारत` : 'सभी को अनुमति प्राप्त है'}
          </span>
        </div>

        {/* Rent Pending */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">किराया बकाया (Pending)</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 font-display">
            {rentPendingCount}
          </div>
          <span className="text-[10px] text-rose-500 font-medium block">
            छात्रों का इस माह किराया बाकी है
          </span>
        </div>

        {/* Rent Paid */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">किराया जमा (Paid)</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            {rentPaidCount}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium block">
            समय पर भुगतान दर्ज
          </span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="नाम, कमरा नं, फोन या जिले से खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          
          {/* Permission Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl text-[10px] font-bold">
            <span className="text-slate-400 px-1">डैशबोर्ड:</span>
            <button
              onClick={() => setFilterPermission('all')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${filterPermission === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              सभी ({totalStudents})
            </button>
            <button
              onClick={() => setFilterPermission('granted')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${filterPermission === 'granted' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'}`}
            >
              अनुमति प्राप्त ({permittedCount})
            </button>
            <button
              onClick={() => setFilterPermission('pending')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${filterPermission === 'pending' ? 'bg-amber-600 text-white' : 'text-amber-700 hover:bg-amber-50'}`}
            >
              प्रतीक्षारत ({totalStudents - permittedCount})
            </button>
          </div>

          {/* Rent Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl text-[10px] font-bold">
            <span className="text-slate-400 px-1">किराया:</span>
            <button
              onClick={() => setFilterRent('all')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${filterRent === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRent('paid')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${filterRent === 'paid' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'}`}
            >
              Paid ({rentPaidCount})
            </button>
            <button
              onClick={() => setFilterRent('pending')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${filterRent === 'pending' ? 'bg-rose-600 text-white' : 'text-rose-700 hover:bg-rose-50'}`}
            >
              Pending ({rentPendingCount})
            </button>
          </div>

          {/* Room Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl text-[10px] font-bold">
            <button
              onClick={() => setFilterRoom('all')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${filterRoom === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              All Rooms
            </button>
            <button
              onClick={() => setFilterRoom('single')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${filterRoom === 'single' ? 'bg-indigo-600 text-white' : 'text-indigo-700 hover:bg-indigo-50'}`}
            >
              1-Seater ({singleCount})
            </button>
            <button
              onClick={() => setFilterRoom('twin')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${filterRoom === 'twin' ? 'bg-indigo-600 text-white' : 'text-indigo-700 hover:bg-indigo-50'}`}
            >
              2-Seater ({twinCount})
            </button>
          </div>

        </div>
      </div>

      {/* Student Records Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800">कोई छात्र रिकॉर्ड नहीं मिला (No Student Records)</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              दिए गए फ़िल्टर या खोज शब्दों के अनुसार कोई छात्र नहीं मिला। कृपया फ़िल्टर रीसेट करें या ऊपर दिए गए बटन से नया छात्र जोड़ें।
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterRent('all');
                setFilterRoom('all');
                setFilterPermission('all');
              }}
              className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
            >
              सभी फ़िल्टर रीसेट करें (Reset Filters)
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">छात्र का नाम एवं विवरण (Student Info)</th>
                  <th className="py-3.5 px-4">कमरा आवंटन (Room & Type)</th>
                  <th className="py-3.5 px-4">किराया स्थिति (Monthly Rent & Status)</th>
                  <th className="py-3.5 px-4">🔑 स्टूडेंट डैशबोर्ड अनुमति (Dashboard Access)</th>
                  <th className="py-3.5 px-4">🪪 ID कार्ड डाउनलोड सीमा (ID Card Limit)</th>
                  <th className="py-3.5 px-4 text-right">कार्यवाही (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((student) => {
                  const permitted = isDashboardPermitted(student);
                  const isPaid = student.rentStatus === 'paid';
                  const isSingle = student.roomType === 'single';
                  const approaching = getStudentRentApproachingStatus(student, config);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Col 1: Student Information */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center shrink-0 overflow-hidden border border-indigo-200">
                            {student.photoUrl ? (
                              <img 
                                src={student.photoUrl} 
                                alt={student.fullName} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              student.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block text-sm">
                              {student.fullName}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              📱 {student.phone}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="inline-block text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                            🎓 {student.course || student.studyYear || 'General Batch'}
                          </span>
                          {(student.fatherName || student.guardianName) && (
                            <span className="inline-block text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              पिता: {student.fatherName || student.guardianName}
                            </span>
                          )}
                          {student.hometown && (
                            <span className="inline-block text-[9px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              📍 {student.hometown}
                            </span>
                          )}
                          {student.parentPhone && (
                            <span className="inline-block text-[9px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                              अभिभावक: {student.parentPhone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Col 2: Room Allocation */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                            🚪 {student.roomNumber || (isSingle ? 'Single Room' : 'Twin Room')}
                          </span>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isSingle 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {isSingle ? '1-सीटर (Single)' : '2-सीटर (Twin)'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          प्रवेश तिथि: <strong className="text-slate-600">{student.checkInDate || 'N/A'}</strong>
                        </span>
                      </td>

                      {/* Col 3: Rent Payment & Ledger */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleRentStatus(student)}
                            className={`text-[10px] font-black px-2.5 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                              isPaid 
                                ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700' 
                                : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                            }`}
                            title="Click to toggle Paid / Pending"
                          >
                            {isPaid ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                <span>Paid (जमा है)</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3 text-rose-500" />
                                <span>Pending (बकाया है)</span>
                              </>
                            )}
                          </button>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${approaching.badgeClass}`}>
                            {approaching.urgencyLabel}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-600 flex items-center gap-1.5 flex-wrap">
                          <span>मासिक: <strong className="text-slate-900 font-bold">₹{student.monthlyRentAmount || (isSingle ? config.singleRoomRent : config.twinRoomRent)}</strong></span>
                          <span>•</span>
                          <span>देय: <strong>{approaching.dueDateFormatted}</strong></span>
                        </div>
                        {approaching.alreadySentForCycle && (
                          <div className="text-[9px] font-bold text-indigo-700 flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5" />
                            <span>ईमेल भेजा गया ({student.lastAutoEmailSentDate || 'Sent'})</span>
                          </div>
                        )}
                        {student.dues && student.dues > 0 ? (
                          <div className="text-[9px] font-bold text-rose-600">
                            पुरानी बकाया राशि: ₹{student.dues}
                          </div>
                        ) : null}
                      </td>

                      {/* Col 4: Dashboard Permission Toggle Switch */}
                      <td className="py-4 px-4 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(student)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                              permitted
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:scale-[1.01]'
                                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:scale-[1.01]'
                            }`}
                            id={`toggle-permission-${student.id}`}
                            title={permitted ? 'Click to revoke dashboard access' : 'Click to grant student dashboard access'}
                          >
                            {permitted ? (
                              <>
                                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                <span>अनुमति दी गई (Allowed)</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5 text-amber-700" />
                                <span>अनुमति दें (Grant Access)</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-500 max-w-xs leading-tight">
                          {permitted
                            ? '✓ यह छात्र अपने नाम और नंबर से डैशबोर्ड खोल सकता है।'
                            : '🔒 अभी यह छात्र डैशबोर्ड नहीं खोल सकता (ओनर की अनुमति जरूरी)।'}
                        </p>
                      </td>

                      {/* Col 5: ID Card Download Limit, Quota & Approval Controls */}
                      <td className="py-4 px-4 space-y-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            (student.idCardDownloadCount || 0) >= (student.idCardDownloadLimit ?? 1)
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            डाउनलोड: {student.idCardDownloadCount || 0} / {student.idCardDownloadLimit ?? 1}
                          </span>
                          {(student.idCardDownloadCount || 0) >= (student.idCardDownloadLimit ?? 1) && (
                            <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                              🔒 लॉक
                            </span>
                          )}
                        </div>

                        {/* Student Requested Permission Alert Box & 1-Click Approve Button */}
                        {student.idCardPermissionRequested && (
                          <div className="bg-amber-50 border border-amber-300 p-2 rounded-xl space-y-1.5">
                            <div className="flex items-center gap-1 text-[10px] font-extrabold text-amber-900">
                              <Bell className="w-3 h-3 text-amber-600 animate-bounce shrink-0" />
                              <span>अनुमति अनुरोध प्राप्त ({student.idCardPermissionRequestedAt || 'Pending'})</span>
                            </div>
                            <button
                              type="button"
                              id={`approve-id-download-${student.id}`}
                              onClick={() => handleApproveIdCardDownload(student)}
                              className="w-full py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                              title="छात्र को 1 बार और डाउनलोड करने की अनुमति दें"
                            >
                              <Check className="w-3 h-3" />
                              <span>+1 डाउनलोड अनुमति दें (Approve)</span>
                            </button>
                          </div>
                        )}

                        {/* Quota Setting (Fixed Number) & Reset */}
                        <div className="flex items-center gap-2 flex-wrap text-[10px]">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-bold">सीमा:</span>
                            <select
                              value={student.idCardDownloadLimit ?? 1}
                              onChange={(e) => handleUpdateDownloadLimit(student, Number(e.target.value))}
                              className="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 font-bold text-slate-800 text-[10px] cursor-pointer"
                              title="निर्धारित करें कि यह छात्र कुल कितनी बार डाउनलोड कर सकता है"
                            >
                              <option value={1}>1 बार (Default)</option>
                              <option value={2}>2 बार</option>
                              <option value={3}>3 बार</option>
                              <option value={5}>5 बार</option>
                              <option value={10}>10 बार</option>
                              <option value={999}>असीमित (Unlimited)</option>
                            </select>
                          </div>

                          {(student.idCardDownloadCount || 0) > 0 && (
                            <button
                              type="button"
                              onClick={() => handleResetDownloadCount(student)}
                              className="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-1.5 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-0.5"
                              title="डाउनलोड काउंटर 0 करें ताकि छात्र फिर से डाउनलोड कर सके"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>रीसेट (0)</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Col 6: Actions */}
                      <td className="py-4 px-4 text-right space-y-1.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Automated Rent Email Reminder Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => setSelectedEmailStudent(student)}
                            className="p-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                            title="किराया ईमेल सूचना देखें व भेजें (Preview & Send Email Notice)"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          {/* WhatsApp */}
                          <a
                            href={`https://wa.me/91${student.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`नमस्ते ${student.fullName}! मोदनवाल बॉयज़ हॉस्टल में आपका स्वागत है। आपका कमरा: ${student.roomNumber || 'आवंटित'}। किराया स्थिति: ${isPaid ? 'जमा है (Paid)' : 'बकाया है (Pending)'}।`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-200 transition-colors"
                            title="Contact on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          {/* Phone Call */}
                          <a
                            href={`tel:${student.phone}`}
                            className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white rounded-lg border border-slate-200 transition-colors"
                            title="Call Student"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {/* Open Student Dashboard Preview */}
                          {onOpenStudentDashboard && student.id && (
                            <button
                              type="button"
                              onClick={() => onOpenStudentDashboard(student.id)}
                              className="p-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                              title="Preview Student Dashboard"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => setEditingStudent(student)}
                            className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="Edit Student Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(student.id || null)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                            title="Delete Student Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {onOpenRentReminders && (
                          <button
                            type="button"
                            onClick={() => onOpenRentReminders(isPaid ? 'paid' : 'pending', student.id)}
                            className="text-[9px] font-bold text-slate-500 hover:text-indigo-600 underline cursor-pointer inline-block"
                          >
                            {isPaid ? 'रसीद भेजें (Send Receipt)' : 'नोटिस भेजें (Send Reminder)'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================= MODAL: ADD NEW STUDENT ======================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-950 to-indigo-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-indigo-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base sm:text-lg text-white">
                    नया छात्र रिकॉर्ड जोड़ें (Add Student Record)
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    यह रिकॉर्ड सीधे फायरस्टोर डेटाबेस में सेव होगा और छात्र को डैशबोर्ड एक्सेस देगा।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateStudent} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: Basic Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>1. व्यक्तिगत विवरण (Personal Details)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      छात्र का पूरा नाम (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="छात्र का पूरा नाम दर्ज करें (Enter Student Name)"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      पिता का नाम (Father's Name)
                    </label>
                    <input
                      type="text"
                      placeholder="पिता का नाम दर्ज करें (Enter Father's Name)"
                      value={newFatherName}
                      onChange={(e) => setNewFatherName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      मोबाइल नंबर (Mobile No - 10 Digits) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10 अंकों का मोबाइल नंबर दर्ज करें (Enter Mobile Number)"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      कोर्स / शाखा (Course / Branch)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. B.Tech CS, BCA, BBA आदि"
                      value={newCourse}
                      onChange={(e) => setNewCourse(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      अध्ययन वर्ष (Study Year)
                    </label>
                    <select
                      value={newStudyYear}
                      onChange={(e) => setNewStudyYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 cursor-pointer"
                    >
                      <option value="1st Year">1st Year (प्रथम वर्ष)</option>
                      <option value="2nd Year">2nd Year (द्वितीय वर्ष)</option>
                      <option value="3rd Year">3rd Year (तृतीय वर्ष)</option>
                      <option value="4th Year">4th Year (चतुर्थ वर्ष)</option>
                      <option value="PG / Other">PG / Post Graduate / Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      गृह जनपद / जिला (Hometown / District)
                    </label>
                    <input
                      type="text"
                      placeholder="गृह जनपद / जिला दर्ज करें (Enter District / Hometown)"
                      value={newHometown}
                      onChange={(e) => setNewHometown(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      पिता / अभिभावक का फोन (Parent Phone)
                    </label>
                    <input
                      type="tel"
                      placeholder="अभिभावक का फोन नंबर दर्ज करें (Enter Parent Phone)"
                      value={newParentPhone}
                      onChange={(e) => setNewParentPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      आधार कार्ड नंबर (Aadhar Number)
                    </label>
                    <input
                      type="text"
                      placeholder="12 अंकों का आधार कार्ड नंबर दर्ज करें (Enter 12-digit Aadhar)"
                      value={newAadhar}
                      onChange={(e) => setNewAadhar(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-indigo-600" />
                      <span>ईमेल पता (Email for Auto Rent Reminders)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="ईमेल पता दर्ज करें (Enter Email Address)"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Room & Rent Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-indigo-600" />
                  <span>2. कमरा आवंटन एवं किराया (Room & Rent)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      कमरे का प्रकार (Room Type) *
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleRoomTypeChange('single')}
                        className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          newRoomType === 'single'
                            ? 'bg-indigo-600 text-white border-indigo-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        1-Seater (Single)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoomTypeChange('twin')}
                        className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          newRoomType === 'twin'
                            ? 'bg-indigo-600 text-white border-indigo-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        2-Seater (Twin)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      कमरा नंबर (Room Number) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="कमरा नंबर दर्ज करें (Enter Room Number)"
                      value={newRoomNumber}
                      onChange={(e) => setNewRoomNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      मासिक किराया (Monthly Rent, ₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newMonthlyRent}
                      onChange={(e) => setNewMonthlyRent(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      जमा सिक्योरिटी (Deposit Paid, ₹)
                    </label>
                    <input
                      type="number"
                      value={newPaidDeposit}
                      onChange={(e) => setNewPaidDeposit(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>किराया देय तारीख (Due Day)</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={newRentDueDay}
                      onChange={(e) => setNewRentDueDay(Math.min(31, Math.max(1, Number(e.target.value) || 1)))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                      title="Day of month when rent is due (1-31)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      चालू माह किराया स्थिति (Status)
                    </label>
                    <select
                      value={newRentStatus}
                      onChange={(e) => setNewRentStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 cursor-pointer"
                    >
                      <option value="pending">Pending (किराया बकाया है)</option>
                      <option value="paid">Paid (किराया जमा हो चुका है)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      प्रवेश तिथि (Check-in Date)
                    </label>
                    <input
                      type="date"
                      value={newCheckInDate}
                      onChange={(e) => setNewCheckInDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Owner Permission for Student Dashboard */}
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-700 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black text-slate-900">
                        स्टूडेंट डैशबोर्ड देखने की अनुमति (Dashboard Access Permission)
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        छात्र अपने नाम और मोबाइल नंबर से अपना कमरा, रसीद, वाई-फाई और मेस मेनू देख सकेगा।
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={newOwnerPermission}
                      onChange={(e) => setNewOwnerPermission(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="text-[10px] font-bold text-indigo-900 bg-white/80 p-2 rounded-xl border border-indigo-150">
                  {newOwnerPermission ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>अनुमति सक्रिय: छात्र अपना नाम ({newName || '...'}) और नंबर डालकर कभी भी अपना डेटा देख सकेगा।</span>
                    </span>
                  ) : (
                    <span className="text-amber-800 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-700 shrink-0" />
                      <span>अनुमति बंद: जब तक आप अनुमति ऑन नहीं करेंगे, छात्र डैशबोर्ड नहीं खोल पाएगा।</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Section 4: Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  विशेष टिप्पणी / नोट (Notes / Remark)
                </label>
                <textarea
                  rows={2}
                  placeholder="विशेष आवश्यकता या टिप्पणी दर्ज करें (Enter Notes / Remarks)..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>डेटाबेस में सुरक्षित करें (Save Student Record)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: EDIT STUDENT RECORD ======================= */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  छात्र विवरण अपडेट करें: {editingStudent.fullName}
                </h3>
                <p className="text-[11px] text-slate-400">
                  फ़ोन: {editingStudent.phone} • कमरा: {editingStudent.roomNumber || 'N/A'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">कमरा नंबर</label>
                  <input
                    type="text"
                    value={editingStudent.roomNumber || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">मासिक किराया (₹)</label>
                  <input
                    type="number"
                    value={editingStudent.monthlyRentAmount || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, monthlyRentAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">पिता का नाम (Father's Name)</label>
                  <input
                    type="text"
                    placeholder="पिता का नाम दर्ज करें"
                    value={editingStudent.fatherName || editingStudent.guardianName || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, fatherName: e.target.value, guardianName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">कोर्स / शाखा (Course / Branch)</label>
                  <input
                    type="text"
                    placeholder="उदा. B.Tech Computer Science"
                    value={editingStudent.course || editingStudent.studyYear || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, course: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">किराया स्थिति</label>
                  <select
                    value={editingStudent.rentStatus || 'pending'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, rentStatus: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="pending">Pending (बकाया)</option>
                    <option value="paid">Paid (जमा है)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">डैशबोर्ड अनुमति</label>
                  <select
                    value={isDashboardPermitted(editingStudent) ? 'granted' : 'denied'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, ownerPermission: e.target.value === 'granted' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="granted">✅ Allowed (अनुमति है)</option>
                    <option value="denied">🔒 Denied (अनुमति रोकें)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">अभिभावक फोन नंबर</label>
                <input
                  type="tel"
                  value={editingStudent.parentPhone || editingStudent.guardianPhone || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value, guardianPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">गृह जनपद / पता</label>
                <input
                  type="text"
                  value={editingStudent.hometown || editingStudent.permanentAddress || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, hometown: e.target.value, permanentAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-indigo-600" />
                    <span>ईमेल पता (Email)</span>
                  </label>
                  <input
                    type="email"
                    value={editingStudent.email || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                    placeholder="ईमेल पता दर्ज करें (Enter Email ID)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>किराया देय तारीख (Due Day 1-31)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={editingStudent.rentDueDay ?? 5}
                    onChange={(e) => setEditingStudent({ ...editingStudent, rentDueDay: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">आधार नंबर</label>
                <input
                  type="text"
                  value={editingStudent.aadharNumber || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, aadharNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* ID Card Download Quota & Permission Controls */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
                      🪪
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">
                        ID कार्ड डाउनलोड सीमा एवं अनुमति (ID Card Download Quota)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        छात्र कितनी बार डाउनलोड कर सकता है एवं अनुमति स्थिति
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                    (editingStudent.idCardDownloadCount || 0) >= (editingStudent.idCardDownloadLimit ?? 1)
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}>
                    उपयोग: {editingStudent.idCardDownloadCount || 0} / {editingStudent.idCardDownloadLimit ?? 1}
                  </span>
                </div>

                {/* If permission requested */}
                {editingStudent.idCardPermissionRequested && (
                  <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <Bell className="w-4 h-4 text-amber-600 animate-bounce shrink-0" />
                      <span>छात्र ने ID कार्ड पुनः डाउनलोड करने की अनुमति मांगी है!</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const currentLimit = editingStudent.idCardDownloadLimit ?? 1;
                        const currentCount = editingStudent.idCardDownloadCount || 0;
                        setEditingStudent({
                          ...editingStudent,
                          idCardDownloadLimit: Math.max(currentCount, currentLimit) + 1,
                          idCardPermissionRequested: false,
                        });
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>+1 डाउनलोड दें (Approve)</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      अधिकतम डाउनलोड सीमा (Download Limit)
                    </label>
                    <select
                      value={editingStudent.idCardDownloadLimit ?? 1}
                      onChange={(e) => setEditingStudent({
                        ...editingStudent,
                        idCardDownloadLimit: Number(e.target.value),
                        idCardPermissionRequested: Number(e.target.value) > (editingStudent.idCardDownloadCount || 0) ? false : editingStudent.idCardPermissionRequested,
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                    >
                      <option value={1}>1 बार (1 Download - Default)</option>
                      <option value={2}>2 बार (2 Downloads)</option>
                      <option value={3}>3 बार (3 Downloads)</option>
                      <option value={5}>5 बार (5 Downloads)</option>
                      <option value={10}>10 बार (10 Downloads)</option>
                      <option value={999}>असीमित (Unlimited Downloads)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      डाउनलोड काउंटर रीसेट (Reset Count)
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditingStudent({
                        ...editingStudent,
                        idCardDownloadCount: 0,
                        idCardPermissionRequested: false,
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>डाउनलोड 0 पर रीसेट करें</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  बंद करें (Close)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateBooking(editingStudent);
                    setEditingStudent(null);
                    showToast(`✓ ${editingStudent.fullName} का रिकॉर्ड अपडेट कर दिया गया!`);
                  }}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>सेव करें (Save Changes)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: DELETE CONFIRMATION ======================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white max-w-sm w-full p-6 rounded-3xl shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">छात्र रिकॉर्ड हटाएं?</h4>
            <p className="text-xs text-slate-500">
              क्या आप सचमुच इस छात्र का रिकॉर्ड डेटाबेस से हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteBooking(deleteConfirmId);
                  setDeleteConfirmId(null);
                  showToast('✓ छात्र रिकॉर्ड सफलतापूर्वक हटा दिया गया!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                हाँ, हटाएं
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: CLEAR ALL CONFIRMATION ======================= */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 font-display">
                सभी छात्र रिकॉर्ड हटाएं? (Delete All Records)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                क्या आप सचमुच डेटाबेस से <strong>सभी {bookings.length} छात्र रिकॉर्ड्स</strong> हमेशा के लिए हटाना चाहते हैं? यह रिकॉर्ड दोबारा वापस नहीं आएंगे।
              </p>
            </div>

            <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 text-left space-y-2">
              <label className="block text-[11px] font-bold text-rose-900">
                पुष्टि करने के लिए नीचे <strong>DELETE</strong> लिखें:
              </label>
              <input
                type="text"
                placeholder="DELETE टाइप करें"
                value={clearAllConfirmText}
                onChange={(e) => setClearAllConfirmText(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-rose-300 text-xs font-mono font-bold text-rose-900 uppercase focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowClearAllModal(false);
                  setClearAllConfirmText('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                disabled={clearAllConfirmText.trim().toUpperCase() !== 'DELETE'}
                onClick={handleClearAllStudents}
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-extrabold transition-all cursor-pointer ${
                  clearAllConfirmText.trim().toUpperCase() === 'DELETE'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                हाँ, सभी हटाएं
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL: AUTOMATED RENT EMAIL PREVIEW & SEND ======================= */}
      <AutomatedRentEmailModal
        isOpen={!!selectedEmailStudent}
        onClose={() => setSelectedEmailStudent(null)}
        student={selectedEmailStudent}
        config={config}
        onMarkRentPaid={(student) => {
          onUpdateBooking({
            ...student,
            rentStatus: 'paid'
          });
          showToast(`✓ ${student.fullName} का किराया जमा (Paid) चिह्नित किया गया!`);
        }}
        onEmailSent={(student, cycleKey) => {
          const nowStr = new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' });
          onUpdateBooking({
            ...student,
            lastAutoEmailSentMonth: cycleKey,
            lastAutoEmailSentDate: nowStr
          });
          showToast(`✓ स्वचालित किराया ईमेल अधिसूचना रिकॉर्ड की गई!`);
        }}
      />

    </div>
  );
}
