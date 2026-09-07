/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  User,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Home,
  Calendar,
  CreditCard,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wrench,
  Wifi,
  Utensils,
  FileText,
  Sparkles,
  Copy,
  Check,
  Send,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Lock,
  AlertTriangle,
  QrCode,
  ExternalLink,
  Search,
  LogOut,
  ChevronRight,
  BookmarkCheck,
  Info,
  Building,
  Shield,
  FileCheck2,
  Users,
  Smartphone,
  CheckCircle,
  HelpCircle,
  Bell,
  BookOpen,
  Trophy,
  Target,
  Flame,
  IdCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BookingInquiry, HostelConfig, MaintenanceLog, PaymentRecord } from '../types';
import { addMaintenanceLog, subscribeToMaintenanceLogs } from '../lib/hostelService';
import PaymentHistorySection from './PaymentHistorySection';
import StudentStudyWorkstation from './StudentStudyWorkstation';
import { 
  generateRentReceiptPDF, 
  triggerFileDownload, 
  printDocumentSheet 
} from '../lib/pdfExportUtil';
import DigitalIdCardExport from './DigitalIdCardExport';
import StudentRentAgreementDoc from './StudentRentAgreementDoc';

interface StudentDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HostelConfig;
  bookings: BookingInquiry[];
  initialStudentId?: string | null;
  onUpdateBooking?: (booking: BookingInquiry) => void;
}

type StudentTabKey = 
  | 'overview'
  | 'study_hub'
  | 'id_pass'
  | 'rent' 
  | 'maintenance' 
  | 'wifi_laundry' 
  | 'mess' 
  | 'leave_pass' 
  | 'rules';

const WEEKLY_MENU = [
  { day: 'Monday (सोमवार)', breakfast: 'Aloo Paratha & Fresh Curd 🥛', lunch: 'Dal Fry, Jeera Rice, Roti, Seasonal Mix Veg 🍛', dinner: 'Kadhi Chawal, Dry Aloo Methi, Roti, Salad 🥗' },
  { day: 'Tuesday (मंगलवार)', breakfast: 'Poha & Hot Milk 🥛', lunch: 'Aloo Gobhi, Chana Dal, Rice, Fresh Rotis 🍲', dinner: 'Matar Paneer (Special), Basmati Rice, Roti, Sweet Kheer 🍨' },
  { day: 'Wednesday (बुधवार)', breakfast: 'Veg Sandwich & Ginger Tea ☕', lunch: 'Lauki Kofta, Yellow Dal, Steamed Rice, Roti 🍛', dinner: 'Egg Curry or Paneer Bhurji, Masala Dal, Roti, Salad 🥚' },
  { day: 'Thursday (गुरुवार)', breakfast: 'Suji Upma & Tea ☕', lunch: 'Rajma Masala, Steamed Rice, Butter Roti, Curd 🍛', dinner: 'Aloo Gajar Matar, Dal Tadka, Roti, Roasted Papad 🫓' },
  { day: 'Friday (शुक्रवार)', breakfast: 'Aloo Puri & Pickle 🍲', lunch: 'Mix Dal, Seasonal Veg, Rice, Butter Roti 🥗', dinner: 'Special Soyabean Chunks Curry, Jeera Rice, Soft Roti 🍲' },
  { day: 'Saturday (शनिवार)', breakfast: 'Bread Butter / Jam & Tea ☕', lunch: 'Black Chana Masala, Khichdi with Ghee & Papad 🍛', dinner: 'Veg Biryani, Mixed Veg Raita, Roti, Sweet Gulab Jamun 🧆' },
  { day: 'Sunday (रविवार)', breakfast: 'Special Chole Bhature 🎉', lunch: 'Kashmiri Dum Aloo, Dal Fry, Jeera Rice, Soft Roti 🍛', dinner: 'Special Butter Paneer Masala, Butter Naan/Roti, Kheer, Salad 🍲' }
];

export default function StudentDashboardModal({
  isOpen,
  onClose,
  config,
  bookings,
  initialStudentId = null,
  onUpdateBooking
}: StudentDashboardModalProps) {
  // Navigation Tab
  const [activeTab, setActiveTab] = useState<StudentTabKey>('overview');

  // Active Student State
  const [activePhone, setActivePhone] = useState<string>(() => {
    return localStorage.getItem('modanwal_active_student_phone') || '';
  });
  const [activeStudentName, setActiveStudentName] = useState<string>(() => {
    return localStorage.getItem('modanwal_active_student_name') || '';
  });
  const [nameSearchInput, setNameSearchInput] = useState('');
  const [phoneSearchInput, setPhoneSearchInput] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [permissionPendingStudent, setPermissionPendingStudent] = useState<BookingInquiry | null>(null);

  // Helper: check if student has owner's permission
  const isDashboardPermitted = (student: BookingInquiry) => {
    if (student.ownerPermission !== undefined) {
      return student.ownerPermission;
    }
    return student.status === 'approved';
  };

  // Print Receipt View State
  const [showPrintReceipt, setShowPrintReceipt] = useState(false);
  const [selectedReceiptRecord, setSelectedReceiptRecord] = useState<PaymentRecord | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);

  const handleViewReceipt = (record?: PaymentRecord) => {
    setSelectedReceiptRecord(record || null);
    setShowPrintReceipt(true);
  };

  // Maintenance Logger State inside Dashboard
  const [reqIssueType, setReqIssueType] = useState<'plumbing' | 'electrical' | 'furniture' | 'appliance' | 'internet' | 'other'>('electrical');
  const [reqSeverity, setReqSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [reqDescription, setReqDescription] = useState('');
  const [reqPreferredTime, setReqPreferredTime] = useState('Anytime / Urgent (कभी भी)');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSubmitSuccess, setTicketSubmitSuccess] = useState<MaintenanceLog | null>(null);

  // Real-time Maintenance logs
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToMaintenanceLogs([], (logs) => {
      setMaintenanceLogs(logs);
    });
    return unsub;
  }, [isOpen]);

  // Washing Machine State
  const [selectedMachine, setSelectedMachine] = useState<'machine-1' | 'machine-2'>('machine-1');
  const [laundrySlots, setLaundrySlots] = useState<{ [key: string]: string }>({});
  const [selectedSlotTime, setSelectedSlotTime] = useState('09:00 AM - 10:00 AM');
  const [laundrySuccessMsg, setLaundrySuccessMsg] = useState('');

  // Night Pass / Leave Form State
  const [leaveStartDate, setLeaveStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [leaveEndDate, setLeaveEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [leaveReason, setLeaveReason] = useState('Visiting Hometown / Family Function (घर जा रहे हैं)');
  const [parentConfirmed, setParentConfirmed] = useState(true);
  const [leavePassGenerated, setLeavePassGenerated] = useState(false);

  // Food suggestion / feedback
  const [mealSuggestion, setMealSuggestion] = useState('');
  const [mealSuggestionSubmitted, setMealSuggestionSubmitted] = useState(false);

  // Load laundry slots from local storage
  useEffect(() => {
    const saved = localStorage.getItem('modanwal_laundry_slots');
    if (saved) {
      try {
        setLaundrySlots(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  // Find active student object
  const currentStudent = useMemo(() => {
    // If owner opened dashboard directly from owner panel for a specific student id
    if (initialStudentId) {
      const byId = bookings.find(b => b.id === initialStudentId);
      if (byId && isDashboardPermitted(byId)) return byId;
    }

    // Authenticate by active phone AND active name with owner permission check
    if (activePhone) {
      const cleanTarget = activePhone.replace(/[^0-9]/g, '');
      const byPhone = bookings.find(b => {
        const bPhone = (b.phone || '').replace(/[^0-9]/g, '');
        const phoneMatch = bPhone.endsWith(cleanTarget) || cleanTarget.endsWith(bPhone);
        if (!phoneMatch) return false;
        
        if (activeStudentName) {
          const nameA = (b.fullName || '').trim().toLowerCase();
          const nameB = activeStudentName.trim().toLowerCase();
          const nameMatch = nameA === nameB || 
            nameA.includes(nameB) || 
            nameB.includes(nameA) || 
            (nameA.split(' ')[0] && nameB.split(' ')[0] && nameA.split(' ')[0] === nameB.split(' ')[0]);
          return nameMatch;
        }
        return true;
      });

      // Crucial: Student can only view data if owner granted permission!
      if (byPhone && isDashboardPermitted(byPhone)) {
        return byPhone;
      }
    }

    // STRICT: Never automatically fallback to first student or strangers!
    return null;
  }, [bookings, initialStudentId, activePhone, activeStudentName]);

  // Sync initialStudentId with state & permission check
  useEffect(() => {
    if (initialStudentId) {
      const student = bookings.find(b => b.id === initialStudentId);
      if (student) {
        if (isDashboardPermitted(student)) {
          setActivePhone(student.phone);
          setActiveStudentName(student.fullName);
          setPermissionPendingStudent(null);
        } else {
          setPermissionPendingStudent(student);
        }
      }
    }
  }, [initialStudentId, bookings]);

  // If student phone is matched and permitted, keep it in sync
  useEffect(() => {
    if (currentStudent && currentStudent.phone) {
      localStorage.setItem('modanwal_active_student_phone', currentStudent.phone);
      localStorage.setItem('modanwal_active_student_name', currentStudent.fullName);
    }
  }, [currentStudent]);

  // Find roommate if twin sharing
  const roommate = useMemo(() => {
    if (!currentStudent || currentStudent.roomType !== 'twin' || !currentStudent.roomNumber) {
      return null;
    }
    return bookings.find(
      b => b.id !== currentStudent.id && 
           b.status === 'approved' && 
           b.roomNumber && 
           b.roomNumber.toLowerCase() === currentStudent.roomNumber.toLowerCase()
    );
  }, [bookings, currentStudent]);

  // Student specific maintenance tickets
  const myTickets = useMemo(() => {
    if (!currentStudent) return [];
    return maintenanceLogs.filter(log => {
      const roomMatch = currentStudent.roomNumber && log.roomNumber.toLowerCase().includes(currentStudent.roomNumber.toLowerCase());
      const phoneMatch = log.studentPhone && log.studentPhone.replace(/[^0-9]/g, '').endsWith(currentStudent.phone.replace(/[^0-9]/g, ''));
      const nameMatch = log.studentName && log.studentName.toLowerCase().includes(currentStudent.fullName.toLowerCase());
      return roomMatch || phoneMatch || nameMatch;
    });
  }, [maintenanceLogs, currentStudent]);

  // Search/Verify Handler: Requires Name + Mobile No + Owner Permission
  const handleVerifyStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setPermissionPendingStudent(null);

    const cleanName = nameSearchInput.trim().toLowerCase();
    const cleanPhone = phoneSearchInput.replace(/[^0-9]/g, '');

    if (!cleanName) {
      setSearchError('कृपया अपना पूरा नाम दर्ज करें (Please enter your registered full name)');
      return;
    }
    if (cleanPhone.length < 10) {
      setSearchError('कृपया 10-अंकों का वैध मोबाइल नंबर दर्ज करें (Please enter valid 10-digit mobile number)');
      return;
    }

    // Find student matching both phone and name
    const matched = bookings.find(b => {
      const bPhone = (b.phone || '').replace(/[^0-9]/g, '');
      const phoneMatch = bPhone.endsWith(cleanPhone) || cleanPhone.endsWith(bPhone);
      if (!phoneMatch) return false;

      const bName = (b.fullName || '').trim().toLowerCase();
      const nameMatch = bName === cleanName || 
        bName.includes(cleanName) || 
        cleanName.includes(bName) || 
        (bName.split(' ')[0] && cleanName.split(' ')[0] && bName.split(' ')[0] === cleanName.split(' ')[0]);
      return nameMatch;
    });

    if (!matched) {
      setSearchError('नाम या मोबाइल नंबर रिकॉर्ड में नहीं मिला। कृपया वही नाम और नंबर दर्ज करें जो हॉस्टल रजिस्टर में है (या केयरटेकर से संपर्क करें)।');
      return;
    }

    // Check owner permission:
    if (!isDashboardPermitted(matched)) {
      setPermissionPendingStudent(matched);
      return;
    }

    // Authorized & Permitted!
    setActivePhone(matched.phone);
    setActiveStudentName(matched.fullName);
    localStorage.setItem('modanwal_active_student_phone', matched.phone);
    localStorage.setItem('modanwal_active_student_name', matched.fullName);
    setNameSearchInput('');
    setPhoneSearchInput('');
    setSearchError(null);
    setPermissionPendingStudent(null);
  };

  const handleLogoutStudent = () => {
    localStorage.removeItem('modanwal_active_student_phone');
    localStorage.removeItem('modanwal_active_student_name');
    setActivePhone('');
    setActiveStudentName('');
    setPermissionPendingStudent(null);
  };

  const handleCopyWifiCredentials = () => {
    const text = `SSID: ${config.wifiSsid || 'Modanwal_HighSpeed_WiFi'}\nPassword: ${config.wifiPassword || 'ModanwalHostel@2026'}`;
    navigator.clipboard.writeText(text);
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(config.upiId || 'alokkumarguptabst@okaxis');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Submit Maintenance ticket
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    if (!reqDescription.trim()) {
      alert('Please enter issue description (कृपया समस्या का विवरण लिखें)');
      return;
    }

    setIsSubmittingTicket(true);
    const ticket: MaintenanceLog = {
      id: `m-${Date.now()}`,
      roomNumber: currentStudent.roomNumber || 'Room Inquiry',
      issueType: reqIssueType,
      description: reqDescription.trim(),
      severity: reqSeverity,
      status: 'pending',
      reportedDate: new Date().toISOString().split('T')[0],
      studentName: currentStudent.fullName,
      studentPhone: currentStudent.phone,
      source: 'student',
      preferredTime: reqPreferredTime
    };

    try {
      await addMaintenanceLog(ticket);
      setTicketSubmitSuccess(ticket);
      setReqDescription('');

      // Direct WhatsApp notification to owner/caretaker!
      const rawPhone = config.phone.replace(/[^0-9]/g, '');
      const formattedPhone = rawPhone.length === 10 ? '91' + rawPhone : rawPhone;
      let text = `*New Maintenance Complaint from Student:*%0A%0A`;
      text += `• *Room No:* ${ticket.roomNumber}%0A`;
      text += `• *Issue Category:* ${ticket.issueType.toUpperCase()}%0A`;
      text += `• *Priority:* ${ticket.severity.toUpperCase()}%0A`;
      text += `• *Description:* ${ticket.description}%0A`;
      text += `• *Student Name:* ${currentStudent.fullName}%0A`;
      text += `• *Student Phone:* ${currentStudent.phone}%0A`;
      if (ticket.preferredTime) text += `• *Preferred Time:* ${ticket.preferredTime}%0A`;
      text += `• *Date:* ${ticket.reportedDate}%0A%0A`;
      text += `Please inspect and resolve at the earliest.`;
      const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${text}`;
      try {
        window.open(waUrl, '_blank');
      } catch (err) {
        console.warn('Auto open WhatsApp prevented:', err);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit maintenance request. Please try again.');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Book laundry slot
  const handleReserveLaundry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    const key = `${selectedMachine}_${selectedSlotTime}`;
    const newSlots = {
      ...laundrySlots,
      [key]: `${currentStudent.fullName} (${currentStudent.roomNumber || 'Resident'})`
    };
    setLaundrySlots(newSlots);
    localStorage.setItem('modanwal_laundry_slots', JSON.stringify(newSlots));
    setLaundrySuccessMsg(`Slot successfully reserved for ${selectedSlotTime}!`);
    setTimeout(() => setLaundrySuccessMsg(''), 4000);
  };

  // Quick WhatsApp link for leave
  const getWhatsAppLeaveLink = () => {
    if (!currentStudent) return '#';
    let text = `*Hostel Night Out / Leave Application*%0A%0A`;
    text += `• *Student Name:* ${currentStudent.fullName}%0A`;
    text += `• *Room No:* ${currentStudent.roomNumber || 'Resident'}%0A`;
    text += `• *Course / Year:* ${currentStudent.studyYear || 'Student'}%0A`;
    text += `• *Leave From:* ${leaveStartDate}%0A`;
    text += `• *Return Date:* ${leaveEndDate}%0A`;
    text += `• *Reason:* ${leaveReason}%0A`;
    text += `• *Parent Phone:* ${currentStudent.parentPhone || 'Informed & Confirmed'}%0A`;
    text += `• *Parent Permission:* ${parentConfirmed ? 'Yes (Confirmed)' : 'Pending'}%0A%0A`;
    text += `Respected Warden / Caretaker, kindly grant permission for this leave. Thank you!`;
    return `https://wa.me/${config.phone.replace(/[^0-9]/g, '')}?text=${text}`;
  };

  // Wi-Fi QR
  const qrData = `WIFI:T:WPA;S:${encodeURIComponent(config.wifiSsid || 'Modanwal_HighSpeed_WiFi')};P:${encodeURIComponent(config.wifiPassword || 'ModanwalHostel@2026')};;`;
  const wifiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`;

  // UPI Pay URL for dues
  const dueAmount = currentStudent?.monthlyRentAmount || (currentStudent?.roomType === 'single' ? (config.singleRoomRent || 4000) : (config.twinRoomRent || 3000));
  const upiPayString = `upi://pay?pa=${config.upiId || 'alokkumarguptabst@okaxis'}&pn=${encodeURIComponent(config.upiName || 'Modanwal Hostel')}&am=${dueAmount}&cu=INR&tn=${encodeURIComponent(`Hostel Rent - ${currentStudent?.fullName || 'Student'} - ${currentStudent?.roomNumber || ''}`)}`;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPayString)}`;

  // Food Menu list
  const indianDayIndex = new Date().getDay();
  const adjustedDayIdx = indianDayIndex === 0 ? 6 : indianDayIndex - 1;
  const menuList = config.customMenu && config.customMenu.length === 7 ? config.customMenu : WEEKLY_MENU;
  const todayMenu = menuList[adjustedDayIdx];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md overflow-hidden animate-fadeIn" id="student-dashboard-modal">
      <div className="relative w-full max-w-6xl h-[94vh] max-h-[900px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden text-slate-900">
        
        {/* ===================== TOP HEADER BAR ===================== */}
        <header className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-base sm:text-lg text-white tracking-tight truncate">
                  छात्र डैशबोर्ड • Student Portal
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-600/40 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {config.hostelName} • Tindola, Barabanki
              </p>
            </div>
          </div>

          {/* Right actions: active student indicator or switch */}
          <div className="flex items-center gap-2 shrink-0">
            {currentStudent ? (
              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 py-1 px-2.5 rounded-xl text-xs">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center">
                  {currentStudent.fullName.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <span className="block font-bold text-white leading-none truncate max-w-[120px]">
                    {currentStudent.fullName}
                  </span>
                  <span className="block text-[9px] text-indigo-300 leading-none mt-0.5">
                    {currentStudent.roomNumber || 'Resident'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogoutStudent}
                  title="Switch / Logout Student"
                  className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              aria-label="Close Dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ===================== BODY CONTAINER ===================== */}
        {!currentStudent ? (
          /* ===================== STUDENT LOGIN / SEARCH VIEW ===================== */
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-lg bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
              
              {/* If student entered correct credentials but Owner hasn't granted permission yet */}
              {permissionPendingStudent ? (
                <div className="space-y-5 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <span className="inline-block bg-amber-100 text-amber-900 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-200">
                      एक्सेस अनुमति प्रतीक्षारत (Access Permission Required)
                    </span>
                    <h2 className="font-display font-black text-xl text-slate-900">
                      नमस्ते, {permissionPendingStudent.fullName}!
                    </h2>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                      आपका नाम और मोबाइल नंबर रजिस्टर में दर्ज है, परंतु हॉस्टल ओनर द्वारा आपके व्यक्तिगत डैशबोर्ड की <span className="font-bold text-amber-700">अनुमति (Owner Permission)</span> अभी चालू नहीं की गई है।
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-left space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>सुरक्षा नियम (Security Rule)</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-normal">
                      केवल वही छात्र अपना कमरा, किराया रसीद, वाई-फाई और मेस मेनू देख सकते हैं जिन्हें ओनर ने डैशबोर्ड एक्सेस की अनुमति दी है।
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/91${(config.phone || '8887968504').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`नमस्ते सर, मैं ${permissionPendingStudent.fullName} (मोबाइल: ${permissionPendingStudent.phone}) हूँ। कृपया मेरे छात्र डैशबोर्ड (Student Dashboard) की एक्सेस अनुमति चालू कर दीजिए।`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>केयरटेकर से अनुमति मांगें</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setPermissionPendingStudent(null)}
                      className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      <span>वापस जाएं (Back)</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Login Form: Name + Phone */
                <>
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100 shadow-xs">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="font-display font-black text-xl text-slate-900">
                        छात्र सुरक्षित लॉगिन (Student Login)
                      </h2>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        कृपया अपना <strong className="text-slate-700">पंजीकृत नाम</strong> और <strong className="text-slate-700">मोबाइल नंबर</strong> दर्ज करें। ओनर द्वारा अधिकृत छात्र ही अपना डैशबोर्ड खोल सकते हैं।
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleVerifyStudent} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        छात्र का पूरा नाम (Full Name as Registered) *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={nameSearchInput}
                          onChange={(e) => setNameSearchInput(e.target.value)}
                          placeholder="छात्र का पूरा नाम दर्ज करें (Enter Full Name)"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        पंजीकृत मोबाइल नंबर (10-Digit Mobile Number) *
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={phoneSearchInput}
                          onChange={(e) => setPhoneSearchInput(e.target.value)}
                          placeholder="10 अंकों का मोबाइल नंबर दर्ज करें (Enter Mobile Number)"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    {searchError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                        <p className="text-xs text-rose-700 font-medium flex items-start gap-1.5">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                          <span>{searchError}</span>
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>सत्यापित करें एवं डैशबोर्ड खोलें (Verify & Open)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="pt-4 border-t border-slate-100 text-center">
                    <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>डैशबोर्ड केवल आपके पंजीकृत नाम व फोन नंबर से ही खुलेगा।</span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* ===================== LOGGED-IN STUDENT DASHBOARD TABS ===================== */
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden bg-slate-50/70">
            
            {/* Sidebar Navigation */}
            <nav className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200/80 p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0 scrollbar-none">
              
              {/* Student Mini Card on Desktop */}
              <div className="hidden md:block p-3.5 mb-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs overflow-hidden shrink-0 border border-indigo-200">
                    {currentStudent.photoUrl ? (
                      <img 
                        src={currentStudent.photoUrl} 
                        alt={currentStudent.fullName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      currentStudent.fullName.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs text-slate-900 truncate">{currentStudent.fullName}</h3>
                    <p className="text-[10px] font-extrabold text-indigo-700 font-mono">
                      {currentStudent.roomNumber || 'Room Assigned'}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-indigo-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">Rent:</span>
                  <span className={`font-black px-1.5 py-0.5 rounded ${currentStudent.rentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {currentStudent.rentStatus === 'paid' ? 'PAID (जमा)' : 'DUE (बकाया)'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 md:w-full text-left ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile & Allotment (प्रोफाइल)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('study_hub')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 md:w-full text-left ${
                  activeTab === 'study_hub'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span>Study Hub & Focus Timer (अध्ययन)</span>
                </div>
                <span className="text-[9px] font-black bg-amber-400/20 text-amber-700 px-1.5 py-0.5 rounded-full">
                  Focus
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('id_pass')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 md:w-full text-left ${
                  activeTab === 'id_pass'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Digital ID Card & Pass (आई.डी. कार्ड)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('rent')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 md:w-full text-left ${
                  activeTab === 'rent'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Rent & Payment History (किराया व खाता)</span>
                </div>
                {currentStudent.rentStatus === 'pending' && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('maintenance')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 md:w-full text-left ${
                  activeTab === 'maintenance'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4" />
                  <span>Room Repairs (शिकायत)</span>
                </div>
                {myTickets.length > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${activeTab === 'maintenance' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {myTickets.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('wifi_laundry')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 md:w-full text-left ${
                  activeTab === 'wifi_laundry'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Wifi className="w-4 h-4" />
                <span>Wi-Fi & Laundry (सुविधाएं)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('mess')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 md:w-full text-left ${
                  activeTab === 'mess'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>Mess & Meals (मेस मेनू)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('leave_pass')}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 md:w-full text-left ${
                  activeTab === 'leave_pass'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Night Pass (छुट्टी अर्जी)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('rules')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 md:w-full text-left ${
                  activeTab === 'rules'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Rent Agreement & Rules (अनुबंध व नियम)</span>
                </div>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${activeTab === 'rules' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-50 text-indigo-700 font-bold'}`}>
                  PDF
                </span>
              </button>

              <div className="hidden md:block mt-auto pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                <span className="font-bold text-slate-600">Caretaker Helpline:</span>
                <p>{config.caretakerName}</p>
                <a href={`tel:${config.phone.replace(/[^0-9]/g, '')}`} className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {config.phone}
                </a>
              </div>
            </nav>

            {/* Main Content Area for Active Tab */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
              
              {/* ======================================================== */}
              {/* TAB 1: OVERVIEW & PROFILE (मेरा प्रोफाइल) */}
              {/* ======================================================== */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Top Welcome Banner */}
                  <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15 text-indigo-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Resident (सत्यापित छात्र)
                        </span>
                        <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">
                          नमस्ते, {currentStudent.fullName}!
                        </h2>
                        <p className="text-xs text-indigo-200 max-w-xl">
                          Welcome to your digital hostel dashboard. Check your room allotment, download rent receipts, request room maintenance, and access hostel high-speed Wi-Fi.
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center shrink-0">
                        <span className="block text-[10px] font-bold text-indigo-200 uppercase">Assigned Room</span>
                        <span className="block font-display font-black text-xl sm:text-2xl text-white font-mono">
                          {currentStudent.roomNumber || 'Room 101'}
                        </span>
                        <span className="block text-[10px] text-emerald-300 font-bold mt-0.5">
                          {currentStudent.roomType === 'single' ? 'Single Room (सिंगल)' : 'Twin Sharing (डबल)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grid: Personal Details + Room Allotment Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Student Personal Info Card */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-display font-extrabold text-sm text-slate-900 flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-600" />
                          Personal Details (व्यक्तिगत विवरण)
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">ID: {currentStudent.id || 'b-1'}</span>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Full Name:</span>
                          <span className="font-bold text-slate-800">{currentStudent.fullName}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Mobile Number:</span>
                          <span className="font-bold text-slate-800 font-mono">{currentStudent.phone}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Email Address:</span>
                          <span className="font-bold text-slate-800 truncate max-w-[200px]">{currentStudent.email}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Course:</span>
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {currentStudent.course || currentStudent.studyYear || 'B.Tech CS'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Parent / Guardian Phone:</span>
                          <span className="font-bold text-slate-800 font-mono">
                            {currentStudent.parentPhone || currentStudent.guardianPhone || 'On File (उपलब्ध)'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400 font-medium">Entry Date (प्रवेश तिथि):</span>
                          <span className="font-bold text-slate-800">{currentStudent.checkInDate || '2026-08-01'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Room & Facilities Card */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="font-display font-extrabold text-sm text-slate-900 flex items-center gap-2">
                          <Home className="w-4 h-4 text-purple-600" />
                          Room & Amenities (कमरा एवं सुविधाएं)
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Active Allotment
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Room Type:</span>
                          <span className="font-bold text-slate-800">
                            {currentStudent.roomType === 'single' ? 'Single Room (Private)' : 'Twin Sharing (2-bed)'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Monthly Fee:</span>
                          <span className="font-extrabold text-slate-900">
                            {currentStudent.allowViewRentAmount
                              ? `₹${currentStudent.monthlyRentAmount || 4450} / month`
                              : '🔒 केयरटेकर अनुमति पर उपलब्ध'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-50">
                          <span className="text-slate-400 font-medium">Security Deposit:</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {currentStudent.allowViewRentAmount
                              ? `₹${currentStudent.paidDeposit || 3000} (Paid & Refundable)`
                              : '🔒 सुरक्षित (Paid)'}
                          </span>
                        </div>
                        <div className="py-1">
                          <span className="text-slate-400 font-medium block mb-1">Opted Add-ons & Amenities:</span>
                          {currentStudent.addons && currentStudent.addons.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {currentStudent.addons.map((add, idx) => (
                                <span key={idx} className="bg-slate-100 text-slate-700 font-medium text-[10px] px-2 py-0.5 rounded-md border border-slate-200">
                                  ✓ {add}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Standard Room Package</span>
                          )}
                        </div>
                      </div>

                      {/* Roommate if twin sharing */}
                      {roommate && (
                        <div className="bg-purple-50/80 border border-purple-100 rounded-xl p-3 text-xs space-y-1">
                          <span className="text-[10px] font-bold text-purple-700 uppercase flex items-center gap-1">
                            <Users className="w-3 h-3" /> Roommate in {currentStudent.roomNumber}
                          </span>
                          <p className="font-bold text-purple-900">{roommate.fullName} ({roommate.studyYear || 'Student'})</p>
                          <p className="text-[10px] text-purple-700">Phone: {roommate.phone}</p>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Quick Action Bento Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('rules')}
                      className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300/80 hover:border-amber-500 hover:shadow-sm transition-all text-left cursor-pointer group"
                    >
                      <div className="p-2 w-9 h-9 rounded-xl bg-amber-500 text-white group-hover:bg-amber-600 transition-colors flex items-center justify-center mb-2 shadow-xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="block font-black text-xs text-amber-950">Rent Agreement</span>
                      <span className="block text-[10px] text-amber-700 font-bold">Rules & PDF Form</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('rent')}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all text-left cursor-pointer group"
                    >
                      <div className="p-2 w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors flex items-center justify-center mb-2">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="block font-bold text-xs text-slate-800">Payment History</span>
                      <span className="block text-[10px] text-slate-400">View slips & ledger</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('id_pass')}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all text-left cursor-pointer group"
                    >
                      <div className="p-2 w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors flex items-center justify-center mb-2">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="block font-bold text-xs text-slate-800">Digital Pass & ID</span>
                      <span className="block text-[10px] text-slate-400">QR Code pass</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('wifi_laundry')}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all text-left cursor-pointer group"
                    >
                      <div className="p-2 w-9 h-9 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors flex items-center justify-center mb-2">
                        <Wifi className="w-4 h-4" />
                      </div>
                      <span className="block font-bold text-xs text-slate-800">Wi-Fi & Laundry</span>
                      <span className="block text-[10px] text-slate-400">QR code & slots</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('leave_pass')}
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all text-left cursor-pointer group"
                    >
                      <div className="p-2 w-9 h-9 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors flex items-center justify-center mb-2">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <span className="block font-bold text-xs text-slate-800">Night Out Pass</span>
                      <span className="block text-[10px] text-slate-400">Leave application</span>
                    </button>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB: STUDY WORKSTATION & FOCUS HUB (सेल्फ-स्टडी वर्कस्टेशन) */}
              {/* ======================================================== */}
              {activeTab === 'study_hub' && (
                <StudentStudyWorkstation
                  student={currentStudent}
                  onGoalCompleted={() => {
                    // Optional callback
                  }}
                />
              )}

              {/* ======================================================== */}
              {/* TAB: DIGITAL ID CARD & GATE PASS (आई.डी. कार्ड एवं गेट पास) */}
              {/* ======================================================== */}
              {activeTab === 'id_pass' && (
                <DigitalIdCardExport
                  student={currentStudent}
                  config={config}
                  onUpdateStudent={(updated) => {
                    onUpdateBooking?.(updated);
                  }}
                />
              )}

              {/* ======================================================== */}
              {/* TAB 2: RENT & RECEIPTS (किराया एवं डिजिटल रसीद) */}
              {/* ======================================================== */}
              {activeTab === 'rent' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Rent Status Card */}
                  <div className={`p-6 rounded-3xl border ${currentStudent.rentStatus === 'paid' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'} space-y-4`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${currentStudent.rentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {currentStudent.rentStatus === 'paid' ? (
                            <><CheckCircle2 className="w-3 h-3" /> Rent Deposited (किराया जमा है)</>
                          ) : (
                            <><AlertTriangle className="w-3 h-3" /> Payment Due (किराया बकाया है)</>
                          )}
                        </span>
                        <h3 className="font-display font-black text-xl text-slate-900">
                          {currentStudent.rentStatus === 'paid' 
                            ? 'All Dues Cleared for Current Billing Cycle' 
                            : 'Hostel Rent Payment Pending'}
                        </h3>
                        <p className="text-xs text-slate-600">
                          Monthly Rent Amount: <strong>₹{currentStudent.monthlyRentAmount || 4450}</strong> • Due by 5th of every month.
                        </p>
                      </div>

                      {/* Download Receipt Button */}
                      <button
                        type="button"
                        onClick={() => handleViewReceipt()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        <Printer className="w-4 h-4" />
                        <span>View Latest Rent Receipt (रसीद देखें)</span>
                      </button>
                    </div>
                  </div>

                  {/* If Due, UPI Payment Gateway Card */}
                  {currentStudent.rentStatus !== 'paid' && (
                    <div id="student-rent-upi-card" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-4 flex flex-col items-center text-center space-y-2">
                        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                          <img src={upiQrUrl} alt="UPI QR Code" className="w-40 h-40 object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold">
                          Scan with PhonePe, GPay, Paytm or BHIM
                        </span>
                      </div>

                      <div className="md:col-span-8 space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
                            Direct Bank / UPI Transfer
                          </span>
                          <h4 className="font-display font-black text-lg text-slate-900">
                            Pay Monthly Rent Online (ऑनलाइन किराया भरें)
                          </h4>
                          <p className="text-xs text-slate-500">
                            Pay directly to the hostel official account. Once paid, send the screenshot to Caretaker on WhatsApp for instant digital receipt confirmation.
                          </p>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="block text-[9px] font-bold text-slate-400 uppercase">Hostel UPI ID</span>
                            <span className="font-extrabold text-slate-900 font-mono">{config.upiId || 'alokkumarguptabst@okaxis'}</span>
                            <span className="block text-[10px] text-slate-500">Beneficiary: {config.upiName || 'Alok Kumar Gupta'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`https://wa.me/${config.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi Caretaker, I have paid my hostel rent of ₹${currentStudent.monthlyRentAmount || 4450} for Room ${currentStudent.roomNumber || ''}. Please verify and send confirmation receipt. - ${currentStudent.fullName}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Notify Caretaker on WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comprehensive Visual Payment History & Ledger Component */}
                  <PaymentHistorySection
                    student={currentStudent}
                    config={config}
                    onViewReceipt={handleViewReceipt}
                    onOpenUpiModal={() => {
                      const upiCard = document.getElementById('student-rent-upi-card');
                      if (upiCard) {
                        upiCard.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  />

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: ROOM MAINTENANCE & COMPLAINTS (कमरा मरम्मत व शिकायत) */}
              {/* ======================================================== */}
              {activeTab === 'maintenance' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Maintenance Request Form */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-display font-black text-lg text-slate-900 flex items-center gap-2">
                          <Wrench className="w-5 h-5 text-amber-500" />
                          Log Room Maintenance / Issue (कमरा मरम्मत शिकायत)
                        </h3>
                        <p className="text-xs text-slate-400">
                          Report any electrical, plumbing, or furniture issue in your room for immediate caretaker resolution.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl">
                        {currentStudent.roomNumber || 'Room 101'}
                      </span>
                    </div>

                    <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
                      
                      {/* Issue Category & Severity */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Issue Category *</label>
                          <select
                            value={reqIssueType}
                            onChange={(e) => setReqIssueType(e.target.value as any)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="electrical">⚡ Electrical (बल्ब, पंखा, स्विच, सॉकेट)</option>
                            <option value="plumbing">🚰 Plumbing (नल, लीकेज, वाशबेसिन, नाली)</option>
                            <option value="furniture">🪑 Furniture (दरवाजा, कुंडी, बेड, स्टडी टेबल)</option>
                            <option value="appliance">❄️ Appliance (कूलर, गीजर, वाटर प्यूरीफायर)</option>
                            <option value="internet">📶 Wi-Fi / Internet (इंटरनेट सिग्नल समस्या)</option>
                            <option value="other">🧹 Cleaning & Other (साफ-सफाई व अन्य)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Priority Level *</label>
                          <select
                            value={reqSeverity}
                            onChange={(e) => setReqSeverity(e.target.value as any)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="low">🟢 Normal / Low Priority (सामान्य)</option>
                            <option value="medium">🟡 Medium Priority (जरूरी)</option>
                            <option value="high">🔴 High / Emergency (अति आवश्यक)</option>
                          </select>
                        </div>
                      </div>

                      {/* Preferred Visit Time */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Preferred Inspection Time (मिस्त्री आने का उपयुक्त समय)</label>
                        <select
                          value={reqPreferredTime}
                          onChange={(e) => setReqPreferredTime(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                          <option value="Anytime / Urgent (कभी भी)">Anytime / Urgent (किसी भी समय आ सकते हैं)</option>
                          <option value="Morning (08:00 AM - 11:00 AM)">Morning (सुबह 08:00 AM - 11:00 AM)</option>
                          <option value="Afternoon (01:00 PM - 04:00 PM)">Afternoon (दोपहर 01:00 PM - 04:00 PM)</option>
                          <option value="Evening (05:00 PM - 08:00 PM)">Evening (शाम 05:00 PM - 08:00 PM)</option>
                        </select>
                      </div>

                      {/* Description */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Describe The Problem *</label>
                        <textarea
                          required
                          rows={3}
                          value={reqDescription}
                          onChange={(e) => setReqDescription(e.target.value)}
                          placeholder="Describe the issue or repair needed in detail..."
                          className="w-full border border-slate-200 rounded-2xl p-3 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                        />
                      </div>

                      {/* Submit button */}
                      <button
                        type="submit"
                        disabled={isSubmittingTicket}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingTicket ? 'Submitting...' : 'Submit Request to Caretaker (शिकायत दर्ज करें)'}</span>
                      </button>
                    </form>

                    {ticketSubmitSuccess && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-bold">Request Logged Successfully! (टिकट दर्ज हो गया)</p>
                            <p className="text-[11px] text-emerald-700">Ticket ID: {ticketSubmitSuccess.id} • Assigned to caretaker.</p>
                          </div>
                        </div>
                        <a
                          href={`https://wa.me/${config.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`*New Maintenance Request:*%0A• Room: ${ticketSubmitSuccess.roomNumber}%0A• Issue: ${ticketSubmitSuccess.description}%0A• Student: ${currentStudent.fullName} (${currentStudent.phone})`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 self-start sm:self-auto transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Caretaker
                        </a>
                      </div>
                    )}
                  </div>

                  {/* My Previous Maintenance Requests */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-display font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        My Ticket History & Status (मेरी पिछली शिकायतें)
                      </h3>
                      <span className="text-xs text-slate-400">{myTickets.length} tickets recorded</span>
                    </div>

                    {myTickets.length > 0 ? (
                      <div className="space-y-3">
                        {myTickets.map((t) => (
                          <div key={t.id} className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  t.status === 'resolved' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : t.status === 'in-progress' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {t.status === 'resolved' ? '✓ Resolved (ठीक हो गया)' : t.status === 'in-progress' ? '⚙️ In Progress (जारी है)' : '⏳ Pending (स्वीकार हुआ)'}
                                </span>
                                <span className="font-bold text-slate-500 uppercase text-[10px]">{t.issueType}</span>
                                <span className="text-slate-400 text-[10px]">• {t.reportedDate}</span>
                              </div>
                              <p className="font-bold text-slate-800">{t.description}</p>
                              {t.notes && (
                                <p className="text-[10px] text-slate-500 italic">Caretaker Note: {t.notes}</p>
                              )}
                            </div>

                            <a
                              href={`https://wa.me/${config.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi Caretaker, regarding my maintenance request for Room ${t.roomNumber} (${t.description}): is there an update? - ${currentStudent.fullName}`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition-colors text-[11px] font-bold flex items-center gap-1 self-start sm:self-auto"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-600" /> WhatsApp Update
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p>No previous maintenance complaints logged. Everything in your room is in great condition!</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 4: WI-FI & LAUNDRY (वाई-फाई एवं लॉन्ड्री) */}
              {/* ======================================================== */}
              {activeTab === 'wifi_laundry' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Wi-Fi Card */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-4 flex flex-col items-center text-center space-y-2">
                      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                        <img src={wifiQrUrl} alt="Hostel Wi-Fi QR" className="w-36 h-36 object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">
                        Scan with your phone camera to connect immediately
                      </span>
                    </div>

                    <div className="md:col-span-8 space-y-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                          <Wifi className="w-3 h-3" /> High-Speed Unlimited Wi-Fi
                        </span>
                        <h3 className="font-display font-black text-lg text-slate-900">
                          Hostel Resident Wireless Access
                        </h3>
                        <p className="text-xs text-slate-500">
                          Connect all your laptops, phones, and study tablets without limits. Dual-band 5GHz routers placed across all floors.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase">Network SSID</span>
                          <span className="font-mono font-extrabold text-slate-800 select-all">
                            {config.wifiSsid || 'Modanwal_HighSpeed_WiFi'}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase">Password</span>
                          <span className="font-mono font-extrabold text-slate-800 select-all">
                            {config.wifiPassword || 'ModanwalHostel@2026'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyWifiCredentials}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedWifi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedWifi ? 'Password Copied!' : 'Copy Wi-Fi Password'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Washing Machine Scheduler */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-display font-black text-lg text-slate-900 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-600" />
                          Washing Machine Slot Booking (लॉन्ड्री स्लॉट)
                        </h3>
                        <p className="text-xs text-slate-400">
                          Book a 1-hour slot in advance to avoid waiting in line at the laundry area.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMachine('machine-1')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${selectedMachine === 'machine-1' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                          Machine #1 (Ground Floor)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedMachine('machine-2')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${selectedMachine === 'machine-2' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                          Machine #2 (1st Floor)
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleReserveLaundry} className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Select Washing Time Slot *</label>
                        <select
                          value={selectedSlotTime}
                          onChange={(e) => setSelectedSlotTime(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-xs"
                        >
                          <option value="08:00 AM - 09:00 AM">08:00 AM - 09:00 AM (Morning)</option>
                          <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                          <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                          <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                          <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM (Afternoon)</option>
                          <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                          <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM (Evening)</option>
                          <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                        </select>
                      </div>

                      {laundrySlots[`${selectedMachine}_${selectedSlotTime}`] && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                          ⚠️ This slot is currently reserved by: <strong>{laundrySlots[`${selectedMachine}_${selectedSlotTime}`]}</strong>. Please select another slot.
                        </div>
                      )}

                      <button
                        type="submit"
                        className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Reserve Slot for {currentStudent.fullName} ({currentStudent.roomNumber || 'Resident'})
                      </button>

                      {laundrySuccessMsg && (
                        <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> {laundrySuccessMsg}
                        </p>
                      )}
                    </form>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 5: MESS MENU & MEALS (मेस मेनू एवं भोजन) */}
              {/* ======================================================== */}
              {activeTab === 'mess' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Today's Special Card */}
                  <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
                    <div className="relative z-10 space-y-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full text-white">
                        <Utensils className="w-3 h-3" /> Today's Live Menu ({todayMenu.day})
                      </span>
                      <h3 className="font-display font-black text-2xl tracking-tight">
                        आज का स्वादिष्ट भोजन
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
                          <span className="block text-[10px] font-bold text-amber-100 uppercase">Breakfast (सुबह 08:00 - 10:00)</span>
                          <p className="font-bold text-sm text-white mt-1">{todayMenu.breakfast}</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
                          <span className="block text-[10px] font-bold text-amber-100 uppercase">Lunch (दोपहर 01:00 - 03:00)</span>
                          <p className="font-bold text-sm text-white mt-1">{todayMenu.lunch}</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
                          <span className="block text-[10px] font-bold text-amber-100 uppercase">Dinner (रात 08:30 - 10:30)</span>
                          <p className="font-bold text-sm text-white mt-1">{todayMenu.dinner}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Full 7-Day Weekly Chart */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-display font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        Weekly Food Routine (साप्ताहिक मेस समय-सारणी)
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">100% Hygienic & Fresh</span>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs">
                      {menuList.map((item, idx) => (
                        <div key={idx} className={`py-3 grid grid-cols-1 md:grid-cols-12 gap-2 ${idx === adjustedDayIdx ? 'bg-amber-50/60 -mx-3 px-3 rounded-xl' : ''}`}>
                          <div className="md:col-span-3 font-bold text-slate-900 flex items-center gap-2">
                            {idx === adjustedDayIdx && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
                            <span>{item.day}</span>
                          </div>
                          <div className="md:col-span-3 text-slate-700">
                            <span className="text-[10px] text-slate-400 font-bold block">Breakfast:</span>
                            {item.breakfast}
                          </div>
                          <div className="md:col-span-3 text-slate-700">
                            <span className="text-[10px] text-slate-400 font-bold block">Lunch:</span>
                            {item.lunch}
                          </div>
                          <div className="md:col-span-3 text-slate-700">
                            <span className="text-[10px] text-slate-400 font-bold block">Dinner:</span>
                            {item.dinner}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mess Suggestion Box */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 text-xs">
                    <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" /> Sunday Special Dish Wishlist (रविवार विशेष भोजन सुझाव)
                    </h4>
                    <p className="text-slate-500">
                      Have a dish suggestion for the upcoming Sunday feast? Let the cook and caretaker know your favorite meal!
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={mealSuggestion}
                        onChange={(e) => setMealSuggestion(e.target.value)}
                        placeholder="Dish Name / Special Meal Item"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (mealSuggestion.trim()) {
                            setMealSuggestionSubmitted(true);
                            setMealSuggestion('');
                            setTimeout(() => setMealSuggestionSubmitted(false), 4000);
                          }
                        }}
                        className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Submit
                      </button>
                    </div>
                    {mealSuggestionSubmitted && (
                      <p className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Thank you! Your food suggestion has been sent to the hostel mess committee.
                      </p>
                    )}
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 6: NIGHT PASS & LEAVE APPLICATION (नाईट पास / छुट्टी) */}
              {/* ======================================================== */}
              {activeTab === 'leave_pass' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                    <div className="space-y-1 border-b border-slate-100 pb-3">
                      <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        Hostel Gate & Leave Permission
                      </span>
                      <h3 className="font-display font-black text-xl text-slate-900">
                        नाईट आउट / छुट्टी आवेदन (Leave Application)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Going home for the weekend or staying late for college project? Apply for an authorized gate pass directly to the caretaker.
                      </p>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Departure Date (जाने की तारीख) *</label>
                          <input
                            type="date"
                            value={leaveStartDate}
                            onChange={(e) => setLeaveStartDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-bold text-slate-800 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Expected Return Date (लौटने की तारीख) *</label>
                          <input
                            type="date"
                            value={leaveEndDate}
                            onChange={(e) => setLeaveEndDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 font-bold text-slate-800 outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Reason for Leave (कारण) *</label>
                        <select
                          value={leaveReason}
                          onChange={(e) => setLeaveReason(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 font-bold text-slate-800 outline-none cursor-pointer"
                        >
                          <option value="Visiting Hometown / Family Function (घर जा रहे हैं)">Visiting Hometown / Family Function (घर जा रहे हैं)</option>
                          <option value="College Festival / Academic Project (कॉलेज प्रोजेक्ट/फेस्ट)">College Festival / Academic Project (कॉलेज प्रोजेक्ट)</option>
                          <option value="Semester Exam / Practical Preparation (परीक्षा तैयारी)">Semester Exam / Practical Preparation (परीक्षा तैयारी)</option>
                          <option value="Medical Emergency / Doctor Appointment (इलाज हेतु)">Medical Emergency / Doctor Appointment (इलाज हेतु)</option>
                          <option value="Night Out at Relative's Place (रिश्तेदार के यहाँ)">Night Out at Relative's Place (रिश्तेदार के यहाँ)</option>
                        </select>
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="parent-confirm-chk"
                          checked={parentConfirmed}
                          onChange={(e) => setParentConfirmed(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                        />
                        <label htmlFor="parent-confirm-chk" className="text-slate-700 font-medium cursor-pointer">
                          I confirm that my parents/guardians are fully informed and have approved this leave.
                        </label>
                      </div>

                      <div className="pt-2">
                        <a
                          href={getWhatsAppLeaveLink()}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Generate & Send Official WhatsApp Leave Pass</span>
                        </a>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 7: RULES & NOTICES (नियम एवं सूचनाएं) */}
              {/* ======================================================== */}
              {activeTab === 'rules' && (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* Official Hostel Rent Agreement & Strict Rule Book with PDF Export */}
                  <StudentRentAgreementDoc 
                    student={currentStudent} 
                    config={config} 
                  />

                  {/* Notice Board */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-display font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-500" />
                        Hostel Notice Board (नवीनतम सूचनाएं)
                      </h3>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        Official Broadcast
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900">⏰ Main Gate Closing Time</span>
                          <span className="text-[10px] text-amber-700">Strictly Enforced</span>
                        </div>
                        <p className="text-amber-800">
                          Main hostel gates close at <strong>10:30 PM</strong> sharp every night. For late entry after 10:30 PM due to coaching/college projects, please submit a Night Pass in advance.
                        </p>
                      </div>

                      <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-900">💡 Electricity & Power Backup</span>
                          <span className="text-[10px] text-indigo-700">24/7 Supply</span>
                        </div>
                        <p className="text-indigo-800">
                          Hostel inverter and generator power backup is active 24/7. High-power heating coils/induction stoves are strictly prohibited in rooms to avoid short-circuits.
                        </p>
                      </div>

                      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900">🍳 Self-Cooking Kitchen Facility</span>
                          <span className="text-[10px] text-emerald-700">Free Access</span>
                        </div>
                        <p className="text-emerald-800">
                          The communal self-cooking kitchen on the ground floor is open 24/7 with gas stove and cooking utensils. Kindly clean your utensils after use.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Code of Conduct */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 text-xs">
                    <h4 className="font-bold text-slate-900">Code of Conduct & Discipline (आचार संहिता):</h4>
                    <ul className="space-y-2 text-slate-600 list-disc pl-5">
                      <li>Maintain quiet hours between <strong>11:00 PM and 06:00 AM</strong> for uninterrupted exam study.</li>
                      <li>Outside male friends / relatives are permitted in the visitor lobby during daytime (09:00 AM - 07:00 PM) only.</li>
                      <li>Smoking, alcohol, or substance consumption is strictly forbidden and subject to immediate expulsion.</li>
                      <li>Turn off room fans, coolers, and tube lights when leaving the room.</li>
                    </ul>
                  </div>

                </div>
              )}

            </main>
          </div>
        )}

        {/* ===================== PRINTABLE RENT RECEIPT MODAL ===================== */}
        <AnimatePresence>
          {showPrintReceipt && currentStudent && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Receipt Header Actions */}
                <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-400" />
                    Official Hostel Rent Receipt (डिजिटल किराया रसीद)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentStudent) return;
                        const rec: PaymentRecord = selectedReceiptRecord || {
                          id: `rec-${currentStudent.id}`,
                          month: 'Current Month Rent',
                          amount: currentStudent.monthlyRentAmount || 4500,
                          status: currentStudent.rentStatus || 'paid',
                          paymentDate: new Date().toISOString().split('T')[0],
                          paymentMode: 'upi',
                          type: 'rent'
                        };
                        const doc = generateRentReceiptPDF(currentStudent, rec, config);
                        const blob = doc.output('blob');
                        const fname = `Rent_Receipt_${(currentStudent.fullName || 'Student').replace(/\s+/g, '_')}_${(rec.month || 'Current').replace(/\s+/g, '_')}.pdf`;
                        triggerFileDownload(blob, fname);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Download Official PDF Receipt"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('printable-receipt-area');
                        if (el) {
                          printDocumentSheet('Modanwal Boys Hostel Rent Receipt', el);
                        } else {
                          window.print();
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      title="Print or Save PDF"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPrintReceipt(false);
                        setSelectedReceiptRecord(null);
                      }}
                      className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Printable Receipt Paper */}
                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-slate-900 bg-white" id="printable-receipt-area">
                  
                  {/* Top Branding */}
                  <div className="text-center border-b border-slate-200 pb-4 space-y-1">
                    <h2 className="font-display font-black text-xl text-slate-900 uppercase tracking-tight">
                      {config.hostelName}
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Near SRMU Campus, Tindola, Barabanki, Uttar Pradesh • Ph: {config.phone}
                    </p>
                    <div className="inline-block mt-2 px-3 py-0.5 bg-slate-100 rounded-full text-[10px] font-black uppercase text-slate-700 border border-slate-200">
                      Payment Acknowledgment Receipt (डिजिटल रसीद)
                    </div>
                  </div>

                  {/* Metadata Bar */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Receipt Number:</span>
                      <span className="font-mono font-extrabold text-slate-900">
                        MBH-2026-{selectedReceiptRecord?.id?.replace(/[^0-9]/g, '').slice(-4) || currentStudent.id?.replace(/[^0-9]/g, '').slice(-4) || '1042'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Date of Issue:</span>
                      <span className="font-bold text-slate-800">
                        {selectedReceiptRecord?.paymentDate 
                          ? new Date(selectedReceiptRecord.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Resident Student Name:</span>
                      <span className="font-bold text-slate-900">{currentStudent.fullName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Room Number Allotted:</span>
                      <span className="font-extrabold text-indigo-700 font-mono">{currentStudent.roomNumber || 'Room 101'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Room Category:</span>
                      <span className="font-bold text-slate-800">
                        {currentStudent.roomType === 'single' ? 'Single Room (निजी)' : 'Twin Sharing (दो सीटर)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Registered Phone:</span>
                      <span className="font-bold text-slate-800 font-mono">{currentStudent.phone}</span>
                    </div>
                  </div>

                  {/* Breakdown Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="p-2.5">Description</th>
                          <th className="p-2.5 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-2.5 font-medium text-slate-800">
                            {selectedReceiptRecord 
                              ? (selectedReceiptRecord.type === 'rent' 
                                  ? `Monthly Room Rent & Utilities - ${selectedReceiptRecord.month}` 
                                  : (selectedReceiptRecord.notes || selectedReceiptRecord.month))
                              : 'Monthly Room Rent & Utilities'}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold">
                            ₹{(selectedReceiptRecord ? selectedReceiptRecord.amount : (currentStudent.monthlyRentAmount || 4450)).toLocaleString('en-IN')}
                          </td>
                        </tr>
                        {selectedReceiptRecord?.paymentMode && (
                          <tr>
                            <td className="p-2.5 text-slate-500 text-[11px]">Payment Mode / Channel</td>
                            <td className="p-2.5 text-right font-mono text-[11px] font-bold text-indigo-700 uppercase">
                              {selectedReceiptRecord.paymentMode === 'upi' ? 'UPI (Online Transfer)' : selectedReceiptRecord.paymentMode === 'cash' ? 'Cash Handover (नकद)' : 'Bank Transfer'}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="p-2.5 font-medium text-slate-800">24/7 High-Speed Wi-Fi & Electricity Backup</td>
                          <td className="p-2.5 text-right font-mono text-emerald-600 font-bold">INCLUDED</td>
                        </tr>
                        <tr className="bg-slate-50 font-black text-slate-900">
                          <td className="p-2.5">Total Paid Amount:</td>
                          <td className="p-2.5 text-right font-mono text-sm">
                            ₹{(selectedReceiptRecord ? selectedReceiptRecord.amount : (currentStudent.monthlyRentAmount || 4450)).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Payment Status & Seal */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Payment Status</span>
                      <span className={`inline-block px-2.5 py-1 rounded text-xs font-black ${
                        (selectedReceiptRecord ? selectedReceiptRecord.status === 'paid' : currentStudent.rentStatus === 'paid')
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {(selectedReceiptRecord ? selectedReceiptRecord.status === 'paid' : currentStudent.rentStatus === 'paid')
                          ? '✓ PAID & ACKNOWLEDGED' 
                          : 'DUE / PENDING'}
                      </span>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="w-20 h-10 border border-dashed border-indigo-300 rounded-lg flex items-center justify-center text-[9px] font-bold text-indigo-700 mx-auto bg-indigo-50/50">
                        OFFICIAL STAMP
                      </div>
                      <span className="block text-[10px] font-bold text-slate-700">Authorized Signature</span>
                      <span className="block text-[9px] text-slate-400">{config.caretakerName}</span>
                    </div>
                  </div>

                  <p className="text-[9px] text-slate-400 text-center italic pt-4 border-t border-slate-100">
                    This is a computer-generated digital receipt issued by Modanwal Boys Hostel management. Valid for college and parental records.
                  </p>
                </div>

              </div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
