import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Utensils, 
  Clock, 
  Sparkles, 
  Copy, 
  Check, 
  Calendar, 
  MessageSquare,
  BookmarkCheck,
  ShieldCheck,
  Zap,
  RotateCw
} from 'lucide-react';
import { BookingInquiry, HostelConfig } from '../types';

interface StudentPortalProps {
  config: HostelConfig;
  bookings: BookingInquiry[];
}

const MESS_MENU_WEEKLY = [
  { day: 'Monday (सोमवार)', breakfast: 'Aloo Paratha & Curd 🥛', lunch: 'Dal Fry, Jeera Rice, Roti, Seasonal Mix Veg 🍛', dinner: 'Kadhi Chawal, Dry Aloo Methi, Roti, Salad 🥗' },
  { day: 'Tuesday (मंगलवार)', breakfast: 'Poha & Hot Milk 🥛', lunch: 'Aloo Gobhi, Chana Dal, Rice, Fresh Rotis 🍲', dinner: 'Matar Paneer (Special), Basmati Rice, Roti, Sweet Kheer 🍨' },
  { day: 'Wednesday (बुधवार)', breakfast: 'Veg Sandwich & Ginger Tea ☕', lunch: 'Lauki Kofta, Yellow Dal, Steamed Rice, Roti 🍛', dinner: 'Egg Curry or Paneer Bhurji, Masala Dal, Roti, Salad 🥚' },
  { day: 'Thursday (गुरुवार)', breakfast: 'Suji Upma & Tea ☕', lunch: 'Rajma Masala, Steamed Rice, Butter Roti, Curd 🍛', dinner: 'Aloo Gajar Matar, Dal Tadka, Roti, Roasted Papad 🫓' },
  { day: 'Friday (शुक्रवार)', breakfast: 'Aloo Puri & Pickle 🍲', lunch: 'Mix Dal, Seasonal Veg, Rice, Butter Roti 🥗', dinner: 'Special Soyabean Chunks Curry, Jeera Rice, Soft Roti 🍲' },
  { day: 'Saturday (शनिवार)', breakfast: 'Bread Butter / Jam & Tea ☕', lunch: 'Black Chana Masala, Khichdi with Ghee & Papad 🍛', dinner: 'Veg Biryani, Mixed Veg Raita, Roti, Sweet Gulab Jamun 🧆' },
  { day: 'Sunday (रविवार)', breakfast: 'Special Chole Bhature 🎉', lunch: 'Kashmiri Dum Aloo, Dal Fry, Jeera Rice, Soft Roti 🍛', dinner: 'Special Butter Paneer Masala, Butter Naan/Roti, Kheer, Salad 🍲' }
];

export default function StudentPortal({ config, bookings }: StudentPortalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searched, setSearched] = useState(false);
  const [matchedStudent, setMatchedStudent] = useState<BookingInquiry | null>(null);
  
  // Wi-Fi credentials copy helper
  const [wifiCopied, setWifiCopied] = useState(false);

  // Washing Machine Scheduler State
  const [selectedMachine, setSelectedMachine] = useState<'machine-1' | 'machine-2'>('machine-1');
  const [laundrySlots, setLaundrySlots] = useState<{ [key: string]: string }>({}); // slotTime -> studentName
  const [slotName, setSlotName] = useState('');
  const [selectedSlotTime, setSelectedSlotTime] = useState('09:00 AM - 10:00 AM');

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
  }, []);

  const handleSearchStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    if (!cleanPhone) {
      setMatchedStudent(null);
      return;
    }

    // Match by phone number suffix or direct search
    const found = bookings.find(b => {
      const bPhone = b.phone.replace(/[^0-9]/g, '');
      return bPhone.endsWith(cleanPhone) || cleanPhone.endsWith(bPhone);
    });

    setMatchedStudent(found || null);
  };

  const handleCopyWifi = () => {
    const wifiText = `SSID: ${config.wifiSsid || 'Modanwal_HighSpeed_WiFi'}\nPassword: ${config.wifiPassword || 'ModanwalHostel@2026'}`;
    navigator.clipboard.writeText(wifiText).then(() => {
      setWifiCopied(true);
      setTimeout(() => setWifiCopied(false), 2000);
    });
  };

  const handleBookLaundrySlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotName.trim()) {
      alert('Please enter your name to reserve a slot!');
      return;
    }
    const key = `${selectedMachine}_${selectedSlotTime}`;
    const newSlots = {
      ...laundrySlots,
      [key]: slotName.trim()
    };
    setLaundrySlots(newSlots);
    localStorage.setItem('modanwal_laundry_slots', JSON.stringify(newSlots));
    setSlotName('');
    alert(`Successfully reserved washing machine slot for ${selectedSlotTime}!`);
  };

  const handleResetSlot = (slotKey: string) => {
    const updated = { ...laundrySlots };
    delete updated[slotKey];
    setLaundrySlots(updated);
    localStorage.setItem('modanwal_laundry_slots', JSON.stringify(updated));
  };

  // Pre-configured dynamic slots
  const TIME_SLOTS = [
    '08:00 AM - 09:00 AM',
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM'
  ];

  // Get current Indian day
  const indianDayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday etc
  // Align Sunday as index 6, Monday as 0
  const adjustedDayIdx = indianDayIndex === 0 ? 6 : indianDayIndex - 1;
  const menuList = config.customMenu && config.customMenu.length === 7 
    ? config.customMenu 
    : MESS_MENU_WEEKLY;
  const currentDayMenu = menuList[adjustedDayIdx];

  // Generate real WiFi QR connection format
  const qrData = `WIFI:T:WPA;S:${encodeURIComponent(config.wifiSsid || 'Modanwal_HighSpeed_WiFi')};P:${encodeURIComponent(config.wifiPassword || 'ModanwalHostel@2026')};;`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`;

  const showFoodMenu = !config.hideFoodMenu;
  const showSuggestionBox = false;
  const showRightSide = showFoodMenu || showSuggestionBox;

  return (
    <section className="py-16 bg-slate-50 border-t border-b border-slate-200" id="student-portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-extrabold uppercase px-3 py-1 rounded-full border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Student Corner & Wi-Fi Gateway
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            डिजिटल छात्र हब & वाई-फाई पोर्टल
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Approved students can instantly connect to high-speed hostel Wi-Fi, view monthly rent status, check the delicious mess menu, and book washing machine slots!
          </p>
        </div>

        {/* Outer Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Left Block: Booking Status & WiFi Finder (8 Cols on Desktop, 12 if right side is hidden) */}
          <div className={`${showRightSide ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-8`}>
            
            {/* Live Search Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-lg text-slate-900 flex items-center gap-2">
                    <BookmarkCheck className="w-5 h-5 text-indigo-600" />
                    Check Booking & Access Wi-Fi (आवेदन एवं वाईफाई जांचें)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Enter the registered mobile phone number you used during the booking form.
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-emerald-200">
                    🟢 Live System
                  </span>
                </div>
              </div>

              <form onSubmit={handleSearchStudent} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter registered Phone Number (e.g. 8887968504)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 font-medium font-mono"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm py-3 px-6 rounded-2xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Verify Status & WiFi
                </button>
              </form>

              {/* Status Display Area */}
              {searched && (
                <div className="animate-fadeIn">
                  {matchedStudent ? (
                    <div className="space-y-6">
                      
                      {/* Booking Info Box */}
                      <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Student Name:</span>
                            <span className="text-sm font-extrabold text-slate-900">{matchedStudent.fullName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Course/Year:</span>
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {matchedStudent.studyYear || 'General Student'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Assigned Room:</span>
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-mono">
                              {matchedStudent.roomNumber || 'Awaiting assignment (जल्द मिलेगा)'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-200/60 pt-3 md:pt-0 md:pl-5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Inquiry Status:</span>
                            {matchedStudent.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                Booking Approved (स्वीकृत)
                              </span>
                            ) : matchedStudent.status === 'rejected' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                Cancelled / Left
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                Pending Verification
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Rent Status:</span>
                            {matchedStudent.status === 'approved' ? (
                              matchedStudent.rentStatus === 'paid' ? (
                                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                                  PAID (किराया जमा है)
                                </span>
                              ) : (
                                <span className="inline-block bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded animate-bounce">
                                  DUE (किराया बकाया है)
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-slate-400 italic">Verify first</span>
                            )}
                          </div>

                          {matchedStudent.status === 'approved' && matchedStudent.monthlyRentAmount && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Monthly Rate:</span>
                              <span className="text-xs font-bold text-slate-700">₹{matchedStudent.monthlyRentAmount}/month</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CONDITION: APPROVED WIFI ACCESS DISPLAY */}
                      {matchedStudent.status === 'approved' ? (
                        !config.hideWifiGateway ? (
                          <div className="border border-indigo-100 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-white p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                            
                            {/* QR Code Col */}
                            <div className="md:col-span-4 flex flex-col items-center text-center space-y-2">
                              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center">
                                <img 
                                  src={qrCodeUrl} 
                                  alt="Wi-Fi QR Code" 
                                  className="w-36 h-36 object-contain"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <span className="text-[10px] text-slate-400 font-bold tracking-tight">
                                Scan this QR Code with your Phone Camera to Connect Instantly!
                              </span>
                            </div>

                            {/* Credentials Col */}
                            <div className="md:col-span-8 space-y-4">
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                                  <Wifi className="w-3 h-3 text-indigo-600 animate-pulse" />
                                  Active High-Speed Wi-Fi
                                </span>
                                <h4 className="font-display font-bold text-base text-slate-900">
                                  Enjoy Seamless Wireless Access
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  Your account is validated! Use these credentials or scan the generated barcode to auto-connect on any device.
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-white p-3 rounded-xl border border-slate-200">
                                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Wi-Fi Name (SSID)</span>
                                  <span className="block text-xs font-extrabold text-slate-800 font-mono select-all">{config.wifiSsid || 'Modanwal_HighSpeed_WiFi'}</span>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-slate-200">
                                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Password</span>
                                  <span className="block text-xs font-extrabold text-slate-800 font-mono select-all">{config.wifiPassword || 'ModanwalHostel@2026'}</span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={handleCopyWifi}
                                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  {wifiCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span>{wifiCopied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
                                </button>
                              </div>
                            </div>

                          </div>
                        ) : (
                          <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100/50 text-indigo-900 text-xs font-bold leading-relaxed">
                            📡 Wi-Fi Portal details are managed directly by the caretaker. Please contact <strong>{config.caretakerName} ({config.phone})</strong> to receive your internet access credentials.
                          </div>
                        )
                      ) : (
                        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 space-y-2">
                          <h4 className="font-bold text-xs flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            Wi-Fi Security Lock (सुरक्षित वाई-फाई)
                          </h4>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            Wi-Fi passwords are secure and only visible once the hostel caretaker/owner approves your hostel booking. Contact caretaker <strong>{config.caretakerName} ({config.phone})</strong> to approve your registration!
                          </p>
                        </div>
                      )}

                      {/* Stored Documents View for students */}
                      {matchedStudent.documents && matchedStudent.documents.length > 0 && (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Your Stored Documents (जमा किए गए दस्तावेज़):
                          </span>
                          <div className="flex gap-2 flex-wrap">
                            {matchedStudent.documents.map((doc, dIdx) => (
                              <span key={dIdx} className="bg-white border border-slate-200 text-slate-600 text-[10px] font-medium px-2.5 py-1 rounded-lg">
                                📄 {doc.name} (Uploaded)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                      <XCircle className="w-8 h-8 text-rose-500 mx-auto" />
                      <h4 className="font-bold text-sm text-slate-900">No Booking Record Found</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Please check if the phone number matches the one typed in your registration or room configuration form. Contact <strong>{config.phone}</strong> for help.
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Smart Washing Machine Scheduler (Attractive Perk!) */}
            {!config.hideLaundryScheduler && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-amber-200">
                    <Zap className="w-3 h-3 text-amber-500" />
                    Student Comfort Perks
                  </span>
                  <h3 className="font-display font-extrabold text-lg text-slate-900 flex items-center gap-2">
                    Smart Washing Machine Scheduler (लॉन्ड्री स्लॉट बुकिंग)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Avoid lines! Reserve your preferred 1-hour laundry washing slot in advance.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Book Form (5 cols) */}
                <form onSubmit={handleBookLaundrySlot} className="md:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Reserve A New Slot
                  </h4>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">Select Washer</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMachine('machine-1')}
                        className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          selectedMachine === 'machine-1'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Washer #1 (Sanyo)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMachine('machine-2')}
                        className={`flex-1 py-1.5 px-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          selectedMachine === 'machine-2'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Washer #2 (LG Smart)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">Available Hours</label>
                    <select
                      value={selectedSlotTime}
                      onChange={(e) => setSelectedSlotTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none font-medium"
                    >
                      {TIME_SLOTS.map((time, idx) => (
                        <option key={idx} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={slotName}
                      onChange={(e) => setSlotName(e.target.value)}
                      placeholder="e.g. Alok Gupta"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors cursor-pointer"
                  >
                    Confirm Slot Reservation
                  </button>
                </form>

                {/* Slots Grid Display (7 cols) */}
                <div className="md:col-span-7 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center justify-between">
                    <span>Active Laundry Schedule</span>
                    <span className="text-[10px] text-slate-400 capitalize">Showing {selectedMachine.replace('-', ' ')}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {TIME_SLOTS.map((time, sIdx) => {
                      const key = `${selectedMachine}_${time}`;
                      const reservedBy = laundrySlots[key];
                      return (
                        <div 
                          key={sIdx} 
                          className={`p-2 rounded-xl border text-[11px] flex flex-col justify-between transition-all ${
                            reservedBy 
                              ? 'bg-rose-50/50 border-rose-100 text-rose-900' 
                              : 'bg-emerald-50/20 border-emerald-100/60 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-[10px]">{time.split(' - ')[0]}</span>
                            {reservedBy ? (
                              <span className="text-[9px] font-extrabold text-rose-600 bg-rose-100/60 px-1.5 py-0.2 rounded">Busy</span>
                            ) : (
                              <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-100/60 px-1.5 py-0.2 rounded">Free</span>
                            )}
                          </div>
                          
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="font-semibold truncate max-w-[120px]">
                              {reservedBy ? `👤 ${reservedBy}` : 'Unreserved Slot'}
                            </span>
                            {reservedBy && (
                              <button
                                type="button"
                                onClick={() => handleResetSlot(key)}
                                className="text-[9px] text-slate-400 hover:text-slate-600 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200"
                                title="Free this slot"
                              >
                                Free
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

            </div>

          {/* Right Side: Interactive Smart Food Menu & Suggestions (4 Cols on Desktop) */}
          {showRightSide && (
            <div className="lg:col-span-4 space-y-8">
              
              {/* Food Menu Card */}
              {showFoodMenu && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-emerald-200">
                        {config.foodMenuBadge || '🍱 Pure Veg Foods'}
                      </span>
                      <h3 className="font-display font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                        <Utensils className="w-4 h-4 text-emerald-600" />
                        Today's Hot Mess Menu
                      </h3>
                    </div>
                    <div className="bg-emerald-500 text-white rounded-full p-2">
                      <Utensils className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Dynamic current day indicator */}
                  <div className="bg-gradient-to-br from-emerald-50 to-indigo-50/50 p-4 rounded-2xl border border-emerald-100/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        {currentDayMenu.day}
                      </span>
                      <span className="inline-block bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        Active Today
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-700 pt-1">
                      <div className="flex gap-2">
                        <span className="font-extrabold text-slate-400 min-w-[50px]">🥣 Breakfast:</span>
                        <span className="font-semibold text-slate-800">{currentDayMenu.breakfast}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-extrabold text-slate-400 min-w-[50px]">☀️ Lunch:</span>
                        <span className="font-semibold text-slate-800">{currentDayMenu.lunch}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-extrabold text-slate-400 min-w-[50px]">🌙 Dinner:</span>
                        <span className="font-semibold text-slate-800">{currentDayMenu.dinner}</span>
                      </div>
                    </div>
                  </div>

                  {/* Weekly menu preview accordion */}
                  <div className="space-y-2 pt-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                      Entire Week Menu (साप्ताहिक भोजन चार्ट)
                    </span>
                    
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {menuList.map((menu, mIdx) => {
                        const isToday = mIdx === adjustedDayIdx;
                        return (
                          <div 
                            key={mIdx} 
                            className={`p-2.5 rounded-xl border text-[11px] transition-all ${
                              isToday 
                                ? 'bg-emerald-500/10 border-emerald-300 ring-1 ring-emerald-300' 
                                : 'bg-slate-50 border-slate-100 hover:bg-slate-100/60'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span>{menu.day}</span>
                              {isToday && <span className="text-[9px] text-emerald-600 font-extrabold">Today</span>}
                            </div>
                            <div className="mt-1 text-[10px] text-slate-500 leading-normal space-y-0.5">
                              <div><span className="font-bold text-slate-400">Brk:</span> {menu.breakfast}</div>
                              <div><span className="font-bold text-slate-400">Lun:</span> {menu.lunch.split(', ').slice(0, 3).join(', ')}...</div>
                              <div><span className="font-bold text-slate-400">Din:</span> {menu.dinner.split(', ').slice(0, 3).join(', ')}...</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestion Box */}
              {showSuggestionBox && (
                <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 shadow-sm border border-slate-800">
                  <div className="space-y-1">
                    <span className="inline-block bg-indigo-500/20 text-indigo-300 text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      Suggestion Box (सुझाव पेटी)
                    </span>
                    <h3 className="font-display font-extrabold text-base text-slate-100 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      Have Feedback or Concerns?
                    </h3>
                    <p className="text-xs text-slate-400">
                      Want to suggest a meal item, report cleaning issues, or request game sports equipment? Ping our owner directly!
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <a
                      href={`https://wa.me/${config.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi Sir, I am a resident student of Modanwal Boys Hostel. I have some suggestions regarding: \n\n`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-200" />
                      <span>Send Suggestion via WhatsApp</span>
                    </a>
                    <span className="block text-[9px] text-slate-500 text-center">
                      Direct connection with <strong>{config.caretakerName}</strong>
                    </span>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </section>
  );
}
