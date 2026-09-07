/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Wifi, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Sparkles, 
  Copy, 
  Check, 
  BookmarkCheck, 
  ShieldCheck, 
  GraduationCap, 
  ChevronRight,
  Receipt,
  IdCard,
  Wrench,
  Utensils,
  FileCheck2,
  QrCode
} from 'lucide-react';
import { BookingInquiry, HostelConfig } from '../types';

interface StudentPortalProps {
  config: HostelConfig;
  bookings: BookingInquiry[];
  onOpenStudentDashboard?: (studentId?: string) => void;
  onOpenSelfRegistrationForm?: () => void;
}

export default function StudentPortal({ config, bookings, onOpenStudentDashboard, onOpenSelfRegistrationForm }: StudentPortalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searched, setSearched] = useState(false);
  const [matchedStudent, setMatchedStudent] = useState<BookingInquiry | null>(null);
  const [wifiCopied, setWifiCopied] = useState(false);

  const handleSearchStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    if (!cleanPhone) {
      setMatchedStudent(null);
      return;
    }

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

  const wifiSsid = config.wifiSsid || 'Modanwal_HighSpeed_WiFi';
  const wifiPassword = config.wifiPassword || 'ModanwalHostel@2026';
  const wifiQrData = `WIFI:T:WPA;S:${wifiSsid};P:${wifiPassword};;`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(wifiQrData)}`;

  return (
    <section className="py-20 bg-slate-50/60 dark:bg-slate-900/50 border-t border-b border-slate-200/80 dark:border-slate-800" id="student-portal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Clean Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase px-3.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 shadow-3xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Digital Student Portal</span>
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            छात्र पोर्टल एवं वाई-फाई गेटवे
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            हॉस्टल में रहने वाले छात्र अपना किराया रिकॉर्ड, रसीद, आईडी कार्ड और हाई-स्पीड वाई-फाई एक्सेस आसानी से देख सकते हैं।
          </p>
        </div>

        {/* Clean 2-Column Responsive Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Card: Fast Phone Verification & Wi-Fi Access */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BookmarkCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                    Quick Verification & Wi-Fi
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    पंजीकृत मोबाइल नंबर दर्ज करें
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                🟢 Live
              </span>
            </div>

            <form onSubmit={handleSearchStudent} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="10 अंकों का फोन नंबर दर्ज करें"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900 dark:text-white placeholder-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
              >
                जांचें
              </button>
            </form>

            {/* Results Area */}
            {searched && (
              <div className="pt-2 animate-fade-in">
                {matchedStudent ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">छात्र का नाम:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{matchedStudent.fullName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">कमरा नंबर:</span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900">
                          {matchedStudent.roomNumber || 'Awaiting'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">स्टेटस:</span>
                        {matchedStudent.status === 'approved' ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> स्वीकृत (Approved)
                          </span>
                        ) : (
                          <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> पेंडिंग (Pending)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Wi-Fi Details if Approved */}
                    {matchedStudent.status === 'approved' && !config.hideWifiGateway && (
                      <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                            <Wifi className="w-3.5 h-3.5" /> High-Speed Wi-Fi
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyWifi}
                            className="text-[10px] font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          >
                            {wifiCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{wifiCopied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                          <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                            <span className="block text-[9px] text-slate-400">SSID:</span>
                            <span className="font-bold text-slate-200">{wifiSsid}</span>
                          </div>
                          <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                            <span className="block text-[9px] text-slate-400">Pass:</span>
                            <span className="font-bold text-slate-200">{wifiPassword}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Button to Open Full Student Dashboard */}
                    {onOpenStudentDashboard && (
                      <button
                        type="button"
                        onClick={() => onOpenStudentDashboard(matchedStudent.id)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-primary-600 hover:from-indigo-700 hover:to-primary-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>पूरा स्टूडेंट डैशबोर्ड खोलें (Open Dashboard)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-center space-y-2">
                    <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                      कोई रिकॉर्ड नहीं मिला (No Record Found)
                    </p>
                    <p className="text-[11px] text-rose-600 dark:text-rose-400">
                      कृपया वही नंबर डालें जिससे आपने हॉस्टल में आवेदन किया था।
                    </p>
                    {onOpenSelfRegistrationForm && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={onOpenSelfRegistrationForm}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>नए छात्र एडमिशन फॉर्म भरें (New Admission Form)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Card: Student Dashboard Features Hub */}
          <div className="lg:col-span-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800/40 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-300 border border-white/10">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  Student Self-Service Portal
                </h3>
                <p className="text-xs text-indigo-200">
                  सभी छात्र सेवाएं एक ही डिजिटल डैशबोर्ड में
                </p>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-amber-400/10 rounded-2xl border border-amber-400/20 flex items-start gap-2.5 col-span-2">
                <FileCheck2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-amber-300">Hostel Rent Agreement & Rules</h4>
                    <p className="text-[10px] text-slate-300">सख्त नियम पुस्तिका एवं डाउनलोड करने योग्य PDF फॉर्म</p>
                  </div>
                  <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md uppercase">PDF</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-2.5">
                <Receipt className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Rent Receipts</h4>
                  <p className="text-[10px] text-slate-300">किराया रसीदें व खाता</p>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-2.5">
                <IdCard className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Digital ID Card</h4>
                  <p className="text-[10px] text-slate-300">पहचान पत्र डाउनलोड</p>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-2.5">
                <Wifi className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Wi-Fi Gateway</h4>
                  <p className="text-[10px] text-slate-300">इंटरनेट QR कोड</p>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-2.5">
                <Wrench className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Complaints & Help</h4>
                  <p className="text-[10px] text-slate-300">कमरे की मरम्मत</p>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            {onOpenStudentDashboard && (
              <button
                type="button"
                onClick={() => onOpenStudentDashboard()}
                className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-xl"
                id="portal-open-full-dashboard-btn"
              >
                <span>Student Portal Dashboard खोलें</span>
                <ChevronRight className="w-4 h-4 text-slate-900" />
              </button>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
