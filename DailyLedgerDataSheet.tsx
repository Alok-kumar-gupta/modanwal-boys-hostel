/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  Check, 
  X, 
  Filter, 
  FileSpreadsheet, 
  Users, 
  Sparkles, 
  Receipt, 
  CheckCircle2, 
  Clock,
  ShieldCheck,
  Building,
  Layers,
  FileText
} from 'lucide-react';
import { BookingInquiry, DailyLedgerEntry, HostelConfig } from '../types';
import { triggerFileDownload } from '../lib/pdfExportUtil';

interface DailyLedgerDataSheetProps {
  entries: DailyLedgerEntry[];
  bookings: BookingInquiry[];
  config: HostelConfig;
  onAddEntry: (entry: DailyLedgerEntry) => void;
  onUpdateEntry: (entry: DailyLedgerEntry) => void;
  onDeleteEntry: (id: string) => void;
  onUpdateBooking?: (updated: BookingInquiry) => void;
}

export default function DailyLedgerDataSheet({
  entries,
  bookings,
  config,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onUpdateBooking,
}: DailyLedgerDataSheetProps) {
  // Form State for Quick Daily Entry
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [entryDate, setEntryDate] = useState<string>(todayStr);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [category, setCategory] = useState<DailyLedgerEntry['category']>('rent');
  const [entryType, setEntryType] = useState<'income' | 'expense'>('income');
  const [amountStr, setAmountStr] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<DailyLedgerEntry['paymentMode']>('cash');
  const [notes, setNotes] = useState<string>('');
  const [syncToStudentHistory, setSyncToStudentHistory] = useState<boolean>(true);
  const [formError, setFormError] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string>('');

  // Editing state
  const [editingEntry, setEditingEntry] = useState<DailyLedgerEntry | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');

  // Handle student selection change in form
  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = e.target.value;
    setSelectedStudentId(studentId);
    if (studentId) {
      const student = bookings.find(b => b.id === studentId);
      if (student) {
        setCustomTitle(student.fullName);
        setRoomNumber(student.roomNumber || '');
        if (category === 'rent' && !amountStr) {
          const rentAmt = student.monthlyRentAmount || (student.roomType === 'single' ? (config.singleRoomRent || 4500) : (config.twinRoomRent || 3500));
          setAmountStr(rentAmt.toString());
        }
      }
    } else {
      setCustomTitle('');
      setRoomNumber('');
    }
  };

  // Quick Amount addition buttons helper
  const handleQuickAddAmount = (addVal: number) => {
    const current = parseInt(amountStr || '0', 10);
    const newVal = isNaN(current) ? addVal : current + addVal;
    setAmountStr(newVal.toString());
  };

  const handleSetExactAmount = (exactVal: number) => {
    setAmountStr(exactVal.toString());
  };

  // Save new entry
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('कृपया वैध राशि (Amount ₹) दर्ज करें');
      return;
    }

    const title = customTitle.trim();
    if (!title) {
      setFormError('कृपया छात्र का नाम या विवरण दर्ज करें');
      return;
    }

    const newId = 'ledger_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newEntry: DailyLedgerEntry = {
      id: newId,
      date: entryDate || todayStr,
      titleOrName: title,
      studentId: selectedStudentId || undefined,
      roomNumber: roomNumber.trim() || undefined,
      category,
      entryType,
      amount: parsedAmount,
      paymentMode,
      notes: notes.trim() || undefined,
      recordedBy: 'Caretaker',
      timestamp: new Date().toISOString(),
    };

    onAddEntry(newEntry);

    // If synced to student record and it's income
    if (syncToStudentHistory && selectedStudentId && entryType === 'income' && onUpdateBooking) {
      const targetStudent = bookings.find(b => b.id === selectedStudentId);
      if (targetStudent) {
        const historyRecord = {
          id: 'pay_' + Date.now(),
          month: entryDate.substring(0, 7), // "YYYY-MM"
          amount: parsedAmount,
          status: 'paid' as const,
          paymentDate: entryDate,
          paymentMode: (paymentMode === 'cash' ? 'cash' : paymentMode === 'upi' ? 'upi' : 'bank') as any,
          type: (category === 'rent' ? 'rent' : category === 'cooler' ? 'cooler' : category === 'electric' ? 'electric' : 'other') as any,
          notes: notes ? `${category}: ${notes}` : `Daily Ledger Entry (${category})`,
        };

        const updatedHistory = [...(targetStudent.paymentHistory || []), historyRecord];
        const updatedStudent: BookingInquiry = {
          ...targetStudent,
          rentStatus: category === 'rent' ? 'paid' : targetStudent.rentStatus,
          paymentHistory: updatedHistory,
        };
        onUpdateBooking(updatedStudent);
      }
    }

    // Reset Form Fields partially (keep date)
    setAmountStr('');
    setNotes('');
    if (!selectedStudentId) {
      setCustomTitle('');
      setRoomNumber('');
    }
    setSuccessToast(`✓ ₹${parsedAmount.toLocaleString('en-IN')} की एंट्री डेटा शीट में सुरक्षित हो गई!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Update existing entry
  const handleUpdateExistingEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    onUpdateEntry(editingEntry);
    setEditingEntry(null);
    setSuccessToast('✓ एंट्री सफलतापूर्वक अपडेट हो गई!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Filtered entries list
  const filteredEntries = useMemo(() => {
    return entries.filter(item => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (item.titleOrName || '').toLowerCase().includes(q);
        const matchesRoom = (item.roomNumber || '').toLowerCase().includes(q);
        const matchesNotes = (item.notes || '').toLowerCase().includes(q);
        const matchesAmount = item.amount.toString().includes(q);
        const matchesCategory = (item.category || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesRoom && !matchesNotes && !matchesAmount && !matchesCategory) {
          return false;
        }
      }

      // 2. Date Filter
      if (dateFilter === 'today') {
        if (item.date !== todayStr) return false;
      } else if (dateFilter === 'this_month') {
        const currentYearMonth = todayStr.substring(0, 7);
        if (!item.date.startsWith(currentYearMonth)) return false;
      } else if (dateFilter === 'custom') {
        if (customStartDate && item.date < customStartDate) return false;
        if (customEndDate && item.date > customEndDate) return false;
      }

      // 3. Type Filter
      if (typeFilter !== 'all' && item.entryType !== typeFilter) {
        return false;
      }

      // 4. Category Filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      // 5. Mode Filter
      if (modeFilter !== 'all' && item.paymentMode !== modeFilter) {
        return false;
      }

      return true;
    });
  }, [entries, searchQuery, dateFilter, customStartDate, customEndDate, typeFilter, categoryFilter, modeFilter, todayStr]);

  // Overall Live Financial Totals Calculation
  const totals = useMemo(() => {
    // Current Month Prefix "YYYY-MM"
    const currentMonthPrefix = todayStr.substring(0, 7);

    let todayIncome = 0;
    let todayExpense = 0;
    let monthIncome = 0;
    let monthExpense = 0;
    let grandTotalIncome = 0;
    let grandTotalExpense = 0;

    entries.forEach(entry => {
      const amt = Number(entry.amount) || 0;
      if (entry.entryType === 'income') {
        grandTotalIncome += amt;
        if (entry.date === todayStr) todayIncome += amt;
        if (entry.date.startsWith(currentMonthPrefix)) monthIncome += amt;
      } else {
        grandTotalExpense += amt;
        if (entry.date === todayStr) todayExpense += amt;
        if (entry.date.startsWith(currentMonthPrefix)) monthExpense += amt;
      }
    });

    const netCashBalance = grandTotalIncome - grandTotalExpense;
    const todayNet = todayIncome - todayExpense;
    const monthNet = monthIncome - monthExpense;

    // Filtered Totals
    let filteredIncome = 0;
    let filteredExpense = 0;
    filteredEntries.forEach(entry => {
      const amt = Number(entry.amount) || 0;
      if (entry.entryType === 'income') filteredIncome += amt;
      else filteredExpense += amt;
    });

    return {
      todayIncome,
      todayExpense,
      todayNet,
      monthIncome,
      monthExpense,
      monthNet,
      grandTotalIncome,
      grandTotalExpense,
      netCashBalance,
      filteredIncome,
      filteredExpense,
      filteredNet: filteredIncome - filteredExpense,
      totalCount: entries.length,
      filteredCount: filteredEntries.length,
    };
  }, [entries, filteredEntries, todayStr]);

  // Comprehensive Excel / CSV Export with ALL Student Details & Full Totals
  const handleExportComprehensiveExcelCSV = () => {
    // 1. Header Information Section
    const fileHeaders = [
      `"MODANWAL BOYS HOSTEL - COMPLETE DAILY DATA SHEET & FINANCIAL REGISTER"`,
      `"Caretaker: ${config.caretakerName || 'Alok Kumar Gupta'} | Contact: ${config.phone || '8887968504'} | Generated: ${new Date().toLocaleString('en-IN')}"`,
      `""`,
    ];

    // 2. Summary Block
    const summaryBlock = [
      `"=== FINANCIAL SUMMARY OVERVIEW ==="`,
      `"Total Registered Active Students:","${bookings.length}"`,
      `"Grand Total Collections (कुल प्राप्त राशि):","₹${totals.grandTotalIncome.toLocaleString('en-IN')}"`,
      `"Grand Total Expenses (कुल खर्च):","₹${totals.grandTotalExpense.toLocaleString('en-IN')}"`,
      `"Net Available Cash Balance (शुद्ध कैश बैलेंस):","₹${totals.netCashBalance.toLocaleString('en-IN')}"`,
      `"Today Collection (आज का कलेक्शन):","₹${totals.todayIncome.toLocaleString('en-IN')}"`,
      `"This Month Collection (इस महीने का कलेक्शन):","₹${totals.monthIncome.toLocaleString('en-IN')}"`,
      `""`,
    ];

    // 3. Daily Ledger Sheet Section
    const ledgerTableTitle = [`"=== PART 1: DAILY CASH & AMOUNT TRANSACTIONS DATA SHEET ==="`];
    const ledgerHeaders = [
      'Entry ID',
      'Date (तारीख)',
      'Student / Party Name (नाम / पार्टी)',
      'Room No',
      'Category (मद)',
      'Type (आय / खर्च)',
      'Amount (₹)',
      'Payment Mode (माध्यम)',
      'Notes / Remarks (विवरण)',
      'Recorded Timestamp'
    ];

    const ledgerRows = entries.map(item => [
      `"${item.id}"`,
      `"${item.date}"`,
      `"${(item.titleOrName || '').replace(/"/g, '""')}"`,
      `"${(item.roomNumber || '-').replace(/"/g, '""')}"`,
      `"${(item.category || '').toUpperCase()}"`,
      `"${item.entryType === 'income' ? 'INCOME (+)' : 'EXPENSE (-)'}"`,
      `"${item.amount}"`,
      `"${(item.paymentMode || 'cash').toUpperCase()}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
      `"${item.timestamp || ''}"`
    ]);

    const ledgerSubtotalRow = [
      `"TOTAL TRANSACTIONS: ${entries.length}"`,
      `""`,
      `""`,
      `""`,
      `"TOTAL INCOME:"`,
      `"₹${totals.grandTotalIncome}"`,
      `"TOTAL EXPENSE:"`,
      `"₹${totals.grandTotalExpense}"`,
      `"NET BALANCE:"`,
      `"₹${totals.netCashBalance}"`
    ];

    // 4. Students Master Register Section
    const studentsTableTitle = [`""`, `"=== PART 2: REGISTERED STUDENTS MASTER ROSTER & FEE STATUS ==="`];
    const studentHeaders = [
      'Student Name',
      'Mobile Phone',
      'Room Number',
      'Room Type',
      'Monthly Rent (₹)',
      'Paid Security Deposit (₹)',
      'Current Rent Status',
      'Total Paid in History (₹)',
      'Dues (₹)',
      'Amount Visible to Student in Portal',
      'Father Name',
      'Parent Phone',
      'Course & Year',
      'Hometown',
      'Check-in Date'
    ];

    const studentRows = bookings.map(b => {
      const historyPaidSum = (b.paymentHistory || [])
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      return [
        `"${(b.fullName || '').replace(/"/g, '""')}"`,
        `"${(b.phone || '').replace(/"/g, '""')}"`,
        `"${(b.roomNumber || '-').replace(/"/g, '""')}"`,
        `"${(b.roomType || 'single').toUpperCase()}"`,
        `"${b.monthlyRentAmount || ''}"`,
        `"${b.paidDeposit || ''}"`,
        `"${(b.rentStatus || 'pending').toUpperCase()}"`,
        `"${historyPaidSum}"`,
        `"${b.dues || 0}"`,
        `"${b.allowViewRentAmount ? 'YES (Visible)' : 'NO (Hidden)'}"`,
        `"${(b.fatherName || '').replace(/"/g, '""')}"`,
        `"${(b.parentPhone || b.guardianPhone || '').replace(/"/g, '""')}"`,
        `"${(b.course || '')} ${b.studyYear || ''}"`,
        `"${(b.hometown || '').replace(/"/g, '""')}"`,
        `"${b.checkInDate || ''}"`
      ];
    });

    const totalStudentsMonthlyRent = bookings.reduce((sum, b) => sum + (b.monthlyRentAmount || 0), 0);
    const totalStudentsDeposits = bookings.reduce((sum, b) => sum + (b.paidDeposit || 0), 0);
    const totalStudentsDues = bookings.reduce((sum, b) => sum + (b.dues || 0), 0);

    const studentsSubtotalRow = [
      `"TOTAL STUDENTS: ${bookings.length}"`,
      `""`,
      `""`,
      `"TOTAL MONTHLY RENT:"`,
      `"₹${totalStudentsMonthlyRent}"`,
      `"TOTAL DEPOSITS: ₹${totalStudentsDeposits}"`,
      `""`,
      `""`,
      `"TOTAL DUES: ₹${totalStudentsDues}"`,
      `""`,
      `""`,
      `""`,
      `""`,
      `""`,
      `""`
    ];

    // Combine all sections into complete CSV content
    const fullCsvContent = [
      ...fileHeaders,
      ...summaryBlock,
      ...ledgerTableTitle,
      ledgerHeaders.join(','),
      ...ledgerRows.map(r => r.join(',')),
      ledgerSubtotalRow.join(','),
      ...studentsTableTitle,
      studentHeaders.join(','),
      ...studentRows.map(r => r.join(',')),
      studentsSubtotalRow.join(',')
    ].join('\n');

    // Create Blob with UTF-8 BOM so Excel opens Hindi & English text accurately
    const blob = new Blob(['\uFEFF' + fullCsvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `Modanwal_Hostel_DataSheet_Ledger_${todayStr}.csv`;
    triggerFileDownload(blob, filename);
  };

  return (
    <div className="space-y-6" id="daily-ledger-data-sheet-container">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="p-1 hover:bg-emerald-700 rounded-lg text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Financial Ledger & Cash Book</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display text-white">
              Daily Ledger & Accounts Sheet
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Record daily rent, security deposits, maintenance fees, and expenses. Total collections, monthly sums, and net cash balance calculate automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportComprehensiveExcelCSV}
              id="btn-download-full-excel-datasheet"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer"
              title="Download full Excel sheet with all students, daily entries & total calculations"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>📥 Export Excel Sheet</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800">
          {/* Today Collection */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Today Collection</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-lg sm:text-xl font-black text-emerald-400 mt-1 font-mono">
              ₹{totals.todayIncome.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-slate-400 block mt-0.5">Today's Total Income</span>
          </div>

          {/* This Month Collection */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">This Month</span>
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-lg sm:text-xl font-black text-indigo-300 mt-1 font-mono">
              ₹{totals.monthIncome.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-slate-400 block mt-0.5">Month Collection</span>
          </div>

          {/* Grand Total Income */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Total Income</span>
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-lg sm:text-xl font-black text-amber-300 mt-1 font-mono">
              ₹{totals.grandTotalIncome.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-slate-400 block mt-0.5">All-time Income</span>
          </div>

          {/* Total Expense */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Total Expenses</span>
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-lg sm:text-xl font-black text-rose-300 mt-1 font-mono">
              ₹{totals.grandTotalExpense.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-slate-400 block mt-0.5">All-time Expenses</span>
          </div>

          {/* Net Balance */}
          <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border border-indigo-400/30 rounded-2xl p-3.5 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-200">Net Balance</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-lg sm:text-xl font-black text-emerald-300 mt-1 font-mono">
              ₹{totals.netCashBalance.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-indigo-200/80 block mt-0.5">Available Cash In Hand</span>
          </div>
        </div>
      </div>

      {/* ===================== QUICK DAILY ENTRY FORM ===================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Quick Daily Entry
              </h3>
              <p className="text-[11px] text-slate-500">
                Enter amount and party name to record transaction immediately
              </p>
            </div>
          </div>

          {/* Type Toggle: Income vs Expense */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setEntryType('income')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                entryType === 'income' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>➕ Income</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryType('expense')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                entryType === 'expense' 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>➖ Expense</span>
            </button>
          </div>
        </div>

        {formError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSaveEntry} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* Registered Student Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Student (Optional)
              </label>
              <select
                value={selectedStudentId}
                onChange={handleStudentSelect}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="">-- Other / Manual Name --</option>
                {bookings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.fullName} {b.roomNumber ? `(Room ${b.roomNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Name / Title */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Name / Description *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul, Room 102, Grocery store"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="rent">🏠 Room Rent</option>
                <option value="deposit">🛡️ Security Deposit</option>
                <option value="mess">🍱 Mess / Food</option>
                <option value="cooler">❄️ Cooler Facility</option>
                <option value="electric">⚡ Electricity</option>
                <option value="advance">💵 Advance Rent</option>
                <option value="maintenance">🔧 Maintenance</option>
                <option value="expense">🛒 Daily Expense</option>
                <option value="other">🏷️ Other</option>
              </select>
            </div>

            {/* Amount ₹ Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount (₹) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="e.g. 4500"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 bg-indigo-50/40 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-black text-indigo-900 dark:text-indigo-200 font-mono focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute left-2.5 top-2.5 text-xs font-bold text-indigo-500">₹</span>
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="cash">💵 Cash</option>
                <option value="upi">📱 UPI / PhonePe / GPay</option>
                <option value="bank">🏦 Bank Transfer</option>
                <option value="online">💳 Online</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Quick Amount Suggestion Chips & Notes */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500">Quick:</span>
              {[500, 1000, 2000, 3500, 4000, 4500, 5000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSetExactAmount(val)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold font-mono transition-colors cursor-pointer"
                >
                  ₹{val}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-auto flex-1 max-w-md">
              <input
                type="text"
                placeholder="Remarks / Note (optional e.g. July Rent, Grocery)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              id="btn-add-daily-ledger-entry"
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Save Entry</span>
            </button>
          </div>
        </form>
      </div>

      {/* ===================== DATA SHEET TABLE & FILTERS ===================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-5">
        
        {/* Table Filters & Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, room, description or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="all">📅 All Dates</option>
              <option value="today">🟢 Today</option>
              <option value="this_month">🔵 This Month</option>
              <option value="custom">🔍 Custom Range</option>
            </select>

            {dateFilter === 'custom' && (
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>
            )}

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Types</option>
              <option value="income">➕ Income</option>
              <option value="expense">➖ Expense</option>
            </select>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Categories</option>
              <option value="rent">🏠 Rent</option>
              <option value="deposit">🛡️ Deposit</option>
              <option value="mess">🍱 Mess</option>
              <option value="cooler">❄️ Cooler</option>
              <option value="electric">⚡ Electricity</option>
              <option value="advance">💵 Advance</option>
              <option value="maintenance">🔧 Maintenance</option>
              <option value="expense">🛒 Expense</option>
            </select>
          </div>
        </div>

        {/* Tabular Spreadsheet View */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Party / Student</th>
                <th className="p-3">Room</th>
                <th className="p-3">Category</th>
                <th className="p-3">Type</th>
                <th className="p-3">Amount (₹)</th>
                <th className="p-3">Mode</th>
                <th className="p-3">Remarks</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                    <p className="font-bold">No entries found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Use the form above to record daily income or expense</p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Date */}
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {item.date}
                    </td>

                    {/* Title / Student Name */}
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      {item.titleOrName}
                    </td>

                    {/* Room */}
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {item.roomNumber ? (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono font-bold">
                          {item.roomNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 capitalize">
                        {item.category}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="p-3 whitespace-nowrap">
                      {item.entryType === 'income' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                          <ArrowUpRight className="w-3 h-3" /> Income
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full">
                          <ArrowDownRight className="w-3 h-3" /> Expense
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="p-3 font-mono font-black text-sm whitespace-nowrap">
                      <span className={item.entryType === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {item.entryType === 'income' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Payment Mode */}
                    <td className="p-3 uppercase font-mono text-[10px] text-slate-600 dark:text-slate-400">
                      {item.paymentMode || 'cash'}
                    </td>

                    {/* Notes */}
                    <td className="p-3 text-slate-500 max-w-xs truncate" title={item.notes || ''}>
                      {item.notes || '-'}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingEntry(item)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Entry"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete entry for "${item.titleOrName}" (₹${item.amount})?`)) {
                              onDeleteEntry(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Bottom Running Totals Footer Row */}
            {filteredEntries.length > 0 && (
              <tfoot className="bg-slate-50 dark:bg-slate-800/90 border-t-2 border-slate-200 dark:border-slate-700 font-bold text-xs">
                <tr>
                  <td colSpan={5} className="p-3 text-slate-700 dark:text-slate-300">
                    Filtered Entries: <strong className="font-mono">{filteredEntries.length}</strong>
                  </td>
                  <td className="p-3 font-mono font-black text-sm text-slate-900 dark:text-white whitespace-nowrap">
                    <span className="text-emerald-600 dark:text-emerald-400">+₹{totals.filteredIncome.toLocaleString('en-IN')}</span>
                    {totals.filteredExpense > 0 && (
                      <span className="text-rose-600 dark:text-rose-400 text-xs ml-1">(-₹{totals.filteredExpense.toLocaleString('en-IN')})</span>
                    )}
                  </td>
                  <td colSpan={2} className="p-3 text-slate-500 font-mono text-[11px]">
                    Net Sum: ₹{totals.filteredNet.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={handleExportComprehensiveExcelCSV}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </button>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ===================== EDIT ENTRY MODAL ===================== */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span>Edit Entry</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateExistingEntry} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={editingEntry.date}
                  onChange={(e) => setEditingEntry({ ...editingEntry, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Party Name / Description
                </label>
                <input
                  type="text"
                  required
                  value={editingEntry.titleOrName}
                  onChange={(e) => setEditingEntry({ ...editingEntry, titleOrName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={editingEntry.entryType}
                    onChange={(e) => setEditingEntry({ ...editingEntry, entryType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    <option value="income">➕ Income</option>
                    <option value="expense">➖ Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingEntry.amount}
                    onChange={(e) => setEditingEntry({ ...editingEntry, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editingEntry.category}
                    onChange={(e) => setEditingEntry({ ...editingEntry, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    <option value="rent">🏠 Rent</option>
                    <option value="deposit">🛡️ Deposit</option>
                    <option value="mess">🍱 Mess</option>
                    <option value="cooler">❄️ Cooler</option>
                    <option value="electric">⚡ Electricity</option>
                    <option value="advance">💵 Advance</option>
                    <option value="maintenance">🔧 Maintenance</option>
                    <option value="expense">🛒 Expense</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={editingEntry.paymentMode}
                    onChange={(e) => setEditingEntry({ ...editingEntry, paymentMode: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="online">Online</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  value={editingEntry.notes || ''}
                  onChange={(e) => setEditingEntry({ ...editingEntry, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Update Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
