/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Settings, 
  RefreshCw, 
  Eye, 
  Filter, 
  Users, 
  ChevronRight, 
  Sparkles,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { BookingInquiry, HostelConfig, AutomatedRentEmailLog } from '../types';
import { 
  getStudentRentApproachingStatus, 
  executeAutomatedRentEmailScan, 
  ApproachingRentStatus 
} from '../lib/rentEmailAutomation';
import AutomatedRentEmailModal from './AutomatedRentEmailModal';

interface AutomatedRentEmailManagerProps {
  bookings: BookingInquiry[];
  config: HostelConfig;
  onUpdateBooking: (updated: BookingInquiry) => void;
  onUpdateConfig: (updated: HostelConfig) => void;
  onOpenRentReminderModal?: () => void;
}

export default function AutomatedRentEmailManager({
  bookings,
  config,
  onUpdateBooking,
  onUpdateConfig,
  onOpenRentReminderModal
}: AutomatedRentEmailManagerProps) {
  const [filterType, setFilterType] = useState<'all' | 'approaching' | 'due_today' | 'sent' | 'paid'>('all');
  const [selectedStudentForEmail, setSelectedStudentForEmail] = useState<BookingInquiry | null>(null);
  const [selectedLogForEmail, setSelectedLogForEmail] = useState<AutomatedRentEmailLog | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Settings State
  const isEnabled = config.autoRentEmailEnabled !== false; // default true
  const daysNotice = config.autoRentEmailDaysNotice ?? 3;
  const defaultDueDay = config.defaultRentDueDay ?? 5;
  const ccAdmin = config.autoRentEmailCcAdmin !== false;

  // Enrich all approved students with approaching status
  const studentsWithStatus: ApproachingRentStatus[] = useMemo(() => {
    return bookings
      .filter(b => b.status === 'approved')
      .map(student => getStudentRentApproachingStatus(student, config))
      .sort((a, b) => {
        // Prioritize due today, then approaching, then overdue, then safe, then paid
        const getPriority = (s: ApproachingRentStatus) => {
          if (s.isDueToday) return 1;
          if (s.isApproaching) return 2;
          if (s.isOverdue) return 3;
          if (s.alreadySentForCycle) return 4;
          if (s.isPaid) return 6;
          return 5;
        };
        return getPriority(a) - getPriority(b);
      });
  }, [bookings, config]);

  // Aggregate stats
  const approachingCount = studentsWithStatus.filter(s => s.isApproaching || s.isDueToday).length;
  const dueTodayCount = studentsWithStatus.filter(s => s.isDueToday).length;
  const sentThisMonthCount = studentsWithStatus.filter(s => s.alreadySentForCycle).length;
  const paidCount = studentsWithStatus.filter(s => s.isPaid).length;

  // Filtered students for display
  const filteredList = useMemo(() => {
    return studentsWithStatus.filter(item => {
      if (filterType === 'approaching') return item.isApproaching || item.isDueToday;
      if (filterType === 'due_today') return item.isDueToday;
      if (filterType === 'sent') return item.alreadySentForCycle;
      if (filterType === 'paid') return item.isPaid;
      return true;
    });
  }, [studentsWithStatus, filterType]);

  // Collect all sent logs across all students
  const allSentLogs = useMemo(() => {
    const logs: AutomatedRentEmailLog[] = [];
    bookings.forEach(b => {
      if (b.autoEmailLogs) {
        logs.push(...b.autoEmailLogs);
      }
    });
    return logs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }, [bookings]);

  // Run Manual Trigger Scan
  const handleRunManualScan = () => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      const { triggeredLogs, approachingCount } = executeAutomatedRentEmailScan(
        bookings,
        config,
        onUpdateBooking
      );

      const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      onUpdateConfig({
        ...config,
        lastAutoEmailScanTimestamp: `${new Date().toLocaleDateString('en-IN')} ${nowTime}`
      });

      if (triggeredLogs.length > 0) {
        setScanResult(`सफलता! ${triggeredLogs.length} छात्रों को आगामी किराए की ईमेल सूचना सफलतापूर्वक भेज दी गई है।`);
        // Preview the first triggered email in modal
        const firstStudent = bookings.find(b => b.id === triggeredLogs[0].studentId);
        if (firstStudent) {
          setSelectedStudentForEmail(firstStudent);
          setSelectedLogForEmail(triggeredLogs[0]);
        }
      } else {
        setScanResult(
          approachingCount > 0 
            ? `स्कैन पूर्ण! ${approachingCount} छात्रों का किराया निकट है, जिन्हें इस माह पहले ही ईमेल भेजी जा चुकी है।`
            : `स्कैन पूर्ण! वर्तमान में किसी नए छात्र की किराया देय तिथि निकट नहीं है।`
        );
      }
      setIsScanning(false);
    }, 600);
  };

  // Toggle Master Feature
  const handleToggleFeature = (enabled: boolean) => {
    onUpdateConfig({
      ...config,
      autoRentEmailEnabled: enabled
    });
  };

  const handleUpdateNoticeDays = (days: number) => {
    onUpdateConfig({
      ...config,
      autoRentEmailDaysNotice: days
    });
  };

  const handleUpdateDueDay = (day: number) => {
    onUpdateConfig({
      ...config,
      defaultRentDueDay: day
    });
  };

  const handleToggleCc = (cc: boolean) => {
    onUpdateConfig({
      ...config,
      autoRentEmailCcAdmin: cc
    });
  };

  return (
    <div className="space-y-5" id="automated-rent-email-manager">
      
      {/* Top Banner & Control Center */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-400/30 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-300" />
                ऑटोमेटेड ईमेल रिमाइंडर (Smart Rent Automation)
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                isEnabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-700 text-slate-300 border-slate-600'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
                {isEnabled ? 'ऑटो-पायलट सक्रिय (Active)' : 'रोक दिया गया (Paused)'}
              </span>
            </div>
            <h3 className="font-display font-black text-lg sm:text-xl text-white">
              छात्र किराया देय तिथि ईमेल अधिसूचना प्रणाली
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              जब किसी छात्र का कमरा किराया जमा करने की तारीख नजदीक आती है (उदा. <strong>{daysNotice} दिन पहले</strong>), सिस्टम छात्र को स्वचालित ईमेल सूचना भेज देता है जिसमें यूपीआई आईडी, किराया राशि एवं रसीद विवरण शामिल होता है।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={handleRunManualScan}
              disabled={isScanning}
              className="flex-1 lg:flex-initial py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-indigo-900/40 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'स्कैन हो रहा है...' : 'अभी स्कैन करें (Run Check Now)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="py-3 px-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5 border border-white/10"
              title="सेटिंग्स खोलें"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">सेटिंग्स</span>
            </button>
          </div>
        </div>

        {/* Scan Result Feedback Toast */}
        {scanResult && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-200 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{scanResult}</span>
            </div>
            <button 
              onClick={() => setScanResult(null)} 
              className="text-emerald-300 hover:text-white font-black text-sm px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-5 pt-4 border-t border-indigo-900/60">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              किराया निकट (Approaching)
            </span>
            <span className="font-display font-black text-xl text-amber-300">
              {approachingCount}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              अगले {daysNotice} दिनों में देय
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              आज देय (Due Today)
            </span>
            <span className="font-display font-black text-xl text-rose-300">
              {dueTodayCount}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              अंतिम तिथि आज है
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              ईमेल प्रेषित (Sent in Cycle)
            </span>
            <span className="font-display font-black text-xl text-emerald-300">
              {sentThisMonthCount}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              इस महीने सूचित किया गया
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              डिफ़ॉल्ट देय तिथि
            </span>
            <span className="font-display font-black text-xl text-white">
              {defaultDueDay} तारीख
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              प्रत्येक माह
            </span>
          </div>
        </div>
      </div>

      {/* Settings Drawer / Box (collapsible) */}
      {showSettings && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold text-sm text-slate-900">
                ऑटोमेटेड ईमेल रिमाइंडर सेटिंग्स (Automation Rules)
              </h4>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
            >
              बंद करें (Close)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Master Toggle */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 block">
                ऑटो-रिमाइंडर स्थिति (Status)
              </label>
              <p className="text-[11px] text-slate-500 leading-normal">
                चालू रहने पर सिस्टम तिथि निकट आने पर स्वतः छात्रों को ईमेल भेजता रहेगा।
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleToggleFeature(true)}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    isEnabled ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  ✓ चालू (Enabled)
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleFeature(false)}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                    !isEnabled ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  ✕ बंद (Paused)
                </button>
              </div>
            </div>

            {/* Notice Days */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 block">
                कितने दिन पहले ईमेल भेजें? (Advance Notice)
              </label>
              <p className="text-[11px] text-slate-500 leading-normal">
                किराया देय तिथि से कितने दिन पहले छात्र को पहला ईमेल जाना चाहिए।
              </p>
              <select
                value={daysNotice}
                onChange={(e) => handleUpdateNoticeDays(Number(e.target.value))}
                className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={1}>1 दिन पहले (1 Day before due date)</option>
                <option value={2}>2 दिन पहले (2 Days before due date)</option>
                <option value={3}>3 दिन पहले (3 Days before due date - अनुशंसित)</option>
                <option value={5}>5 दिन पहले (5 Days before due date)</option>
                <option value={7}>7 दिन पहले (7 Days before due date)</option>
              </select>
            </div>

            {/* Default Monthly Due Day */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 block">
                मासिक किराया देय तारीख (Default Rent Due Day)
              </label>
              <p className="text-[11px] text-slate-500 leading-normal">
                हॉस्टल के लिए सामान्य देय तारीख (प्रत्येक माह)।
              </p>
              <select
                value={defaultDueDay}
                onChange={(e) => handleUpdateDueDay(Number(e.target.value))}
                className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={1}>1 तारीख (1st of every month)</option>
                <option value={5}>5 तारीख (5th of every month - डिफ़ॉल्ट)</option>
                <option value={10}>10 तारीख (10th of every month)</option>
                <option value={15}>15 तारीख (15th of every month)</option>
                <option value={20}>20 तारीख (20th of every month)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            सभी छात्र ({studentsWithStatus.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('approaching')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filterType === 'approaching' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span>निकट देय तिथि ({approachingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('due_today')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filterType === 'due_today' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <span>आज देय ({dueTodayCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('sent')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filterType === 'sent' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
            }`}
          >
            <span>ईमेल भेजा गया ({sentThisMonthCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('paid')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              filterType === 'paid' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span>जमा / चुकता ({paidCount})</span>
          </button>
        </div>

        {onOpenRentReminderModal && (
          <button
            type="button"
            onClick={onOpenRentReminderModal}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer shrink-0 ml-auto"
          >
            <span>व्हाट्सएप/मैनुअल रिमाइंडर खोलें</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Approaching Students Cards List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800">
              इस फ़िल्टर में कोई छात्र नहीं है
            </h4>
            <p className="text-xs text-slate-400">
              सभी स्वीकृत छात्रों का किराया अपडेटेड है या देय तिथि दूर है।
            </p>
          </div>
        ) : (
          filteredList.map((item) => {
            const { student, dueDateFormatted, daysRemaining, rentAmount, isApproaching, isDueToday, alreadySentForCycle, isPaid, studentEmail, badgeClass, urgencyLabel } = item;

            return (
              <div
                key={student.id}
                className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isDueToday ? 'border-rose-300 bg-rose-50/20' : isApproaching ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200'
                }`}
              >
                {/* Student Info */}
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                    isPaid ? 'bg-emerald-100 text-emerald-800' : isDueToday ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {student.fullName.charAt(0)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900">
                        {student.fullName}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                        {urgencyLabel}
                      </span>
                      {alreadySentForCycle && (
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" />
                          ईमेल प्रेषित ({student.lastAutoEmailSentDate || 'Sent'})
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>कमरा: <strong className="text-slate-800">{student.roomNumber || 'Room Allocated'}</strong> ({student.roomType === 'single' ? 'Single' : 'Twin'})</span>
                      <span>•</span>
                      <span>मोबाइल: <strong className="text-slate-800 font-mono">{student.phone}</strong></span>
                      <span>•</span>
                      <span>ईमेल: <span className="font-mono text-slate-600">{studentEmail}</span></span>
                    </div>

                    <div className="flex items-center gap-3 text-xs pt-0.5">
                      <span className="text-slate-600">
                        मासिक किराया: <strong className="text-indigo-700 font-bold">₹{rentAmount.toLocaleString('en-IN')}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-slate-600">
                        देय तारीख: <strong className="text-slate-900">{dueDateFormatted}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentForEmail(student);
                      setSelectedLogForEmail(null);
                    }}
                    className="py-2 px-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>ईमेल देखें / भेजें (Preview & Send)</span>
                  </button>

                  {!isPaid && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated: BookingInquiry = {
                          ...student,
                          rentStatus: 'paid'
                        };
                        onUpdateBooking(updated);
                      }}
                      className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>जमा दर्ज करें (Paid)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sent Email Audit Log / History */}
      {allSentLogs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                हाल ही में भेजे गए ऑटोमेटेड ईमेल का इतिहास (Recent Automated Email Logs)
              </h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              कुल: {allSentLogs.length} ईमेल प्रेषित
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-2 px-3">छात्र का नाम</th>
                  <th className="py-2 px-3">ईमेल आईडी</th>
                  <th className="py-2 px-3">कमरा</th>
                  <th className="py-2 px-3">किराया देय तिथि</th>
                  <th className="py-2 px-3">प्रेषण समय</th>
                  <th className="py-2 px-3">स्थिति</th>
                  <th className="py-2 px-3 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allSentLogs.slice(0, 5).map((l) => {
                  const studentMatch = bookings.find(b => b.id === l.studentId);
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {l.studentName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {l.studentEmail}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {l.roomNumber}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {l.dueDate} (₹{l.rentAmount})
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {l.sentAt}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 w-fit">
                          <CheckCircle className="w-2.5 h-2.5" />
                          सफलतापूर्वक प्रेषित
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {studentMatch && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentForEmail(studentMatch);
                              setSelectedLogForEmail(l);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] cursor-pointer"
                          >
                            ईमेल देखें &rarr;
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Automated Email Preview Modal */}
      <AutomatedRentEmailModal
        isOpen={!!selectedStudentForEmail}
        onClose={() => {
          setSelectedStudentForEmail(null);
          setSelectedLogForEmail(null);
        }}
        student={selectedStudentForEmail}
        config={config}
        log={selectedLogForEmail}
        onMarkRentPaid={(student) => {
          const updated: BookingInquiry = {
            ...student,
            rentStatus: 'paid'
          };
          onUpdateBooking(updated);
        }}
      />
    </div>
  );
}
