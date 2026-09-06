/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  CheckCircle, 
  X, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  User, 
  Filter, 
  Hammer, 
  Info,
  ChevronDown,
  Sparkles,
  GraduationCap,
  Phone,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MaintenanceLog } from '../types';
import { 
  subscribeToMaintenanceLogs, 
  addMaintenanceLog, 
  updateMaintenanceLog, 
  deleteMaintenanceLog 
} from '../lib/hostelService';

const SEED_MAINTENANCE_LOGS: MaintenanceLog[] = [];

export default function MaintenanceTab() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'plumbing' | 'electrical' | 'furniture' | 'appliance' | 'internet' | 'other'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'student' | 'owner'>('all');

  // Form Modals / Expanders
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);

  // New Log Form State
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newIssueType, setNewIssueType] = useState<'plumbing' | 'electrical' | 'furniture' | 'appliance' | 'internet' | 'other'>('other');
  const [newDescription, setNewDescription] = useState('');
  const [newSeverity, setNewSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [newAssignedTo, setNewAssignedTo] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newPreferredTime, setNewPreferredTime] = useState('');
  const [newSource, setNewSource] = useState<'owner' | 'student'>('owner');

  // Edit Log Form State
  const [editRoomNumber, setEditRoomNumber] = useState('');
  const [editIssueType, setEditIssueType] = useState<'plumbing' | 'electrical' | 'furniture' | 'appliance' | 'internet' | 'other'>('other');
  const [editDescription, setEditDescription] = useState('');
  const [editSeverity, setEditSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [editStatus, setEditStatus] = useState<'pending' | 'in-progress' | 'resolved'>('pending');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editResolvedDate, setEditResolvedDate] = useState('');
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentPhone, setEditStudentPhone] = useState('');
  const [editPreferredTime, setEditPreferredTime] = useState('');
  const [editSource, setEditSource] = useState<'owner' | 'student'>('owner');

  // Connect to Firestore Real-time
  useEffect(() => {
    const unsubscribe = subscribeToMaintenanceLogs(SEED_MAINTENANCE_LOGS, (updatedLogs) => {
      setLogs(updatedLogs);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim() || !newDescription.trim()) return;

    const newLog: MaintenanceLog = {
      id: `m-${Date.now()}`,
      roomNumber: newRoomNumber.trim(),
      issueType: newIssueType,
      description: newDescription.trim(),
      severity: newSeverity,
      status: 'pending',
      reportedDate: new Date().toISOString().split('T')[0],
      assignedTo: newAssignedTo.trim() || undefined,
      cost: newCost ? parseFloat(newCost) : undefined,
      notes: newNotes.trim() || undefined,
      studentName: newStudentName.trim() || undefined,
      studentPhone: newStudentPhone.trim() || undefined,
      preferredTime: newPreferredTime.trim() || undefined,
      source: newSource
    };

    try {
      await addMaintenanceLog(newLog);
      // Reset form
      setNewRoomNumber('');
      setNewIssueType('other');
      setNewDescription('');
      setNewSeverity('medium');
      setNewAssignedTo('');
      setNewCost('');
      setNewNotes('');
      setNewStudentName('');
      setNewStudentPhone('');
      setNewPreferredTime('');
      setNewSource('owner');
      setIsAddFormOpen(false);
    } catch (err) {
      console.error('Error adding maintenance log:', err);
    }
  };

  const handleStartEdit = (log: MaintenanceLog) => {
    setEditingLog(log);
    setEditRoomNumber(log.roomNumber);
    setEditIssueType(log.issueType);
    setEditDescription(log.description);
    setEditSeverity(log.severity);
    setEditStatus(log.status);
    setEditAssignedTo(log.assignedTo || '');
    setEditCost(log.cost ? String(log.cost) : '');
    setEditNotes(log.notes || '');
    setEditResolvedDate(log.resolvedDate || '');
    setEditStudentName(log.studentName || '');
    setEditStudentPhone(log.studentPhone || '');
    setEditPreferredTime(log.preferredTime || '');
    setEditSource(log.source || 'owner');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;

    const resolvedDateVal = editStatus === 'resolved' 
      ? (editResolvedDate || new Date().toISOString().split('T')[0]) 
      : undefined;

    const updated: MaintenanceLog = {
      ...editingLog,
      roomNumber: editRoomNumber.trim(),
      issueType: editIssueType,
      description: editDescription.trim(),
      severity: editSeverity,
      status: editStatus,
      assignedTo: editAssignedTo.trim() || undefined,
      cost: editCost ? parseFloat(editCost) : undefined,
      notes: editNotes.trim() || undefined,
      resolvedDate: resolvedDateVal,
      studentName: editStudentName.trim() || undefined,
      studentPhone: editStudentPhone.trim() || undefined,
      preferredTime: editPreferredTime.trim() || undefined,
      source: editSource
    };

    try {
      await updateMaintenanceLog(updated);
      setEditingLog(null);
    } catch (err) {
      console.error('Error updating maintenance log:', err);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this maintenance record? (क्या आप सचमुच इस मरम्मत रिकॉर्ड को हटाना चाहते हैं?)')) return;
    try {
      await deleteMaintenanceLog(id);
    } catch (err) {
      console.error('Error deleting maintenance log:', err);
    }
  };

  const handleQuickResolve = async (log: MaintenanceLog) => {
    const updated: MaintenanceLog = {
      ...log,
      status: 'resolved',
      resolvedDate: new Date().toISOString().split('T')[0]
    };
    try {
      await updateMaintenanceLog(updated);
    } catch (err) {
      console.error('Error resolving log:', err);
    }
  };

  // Stats helper calculations
  const pendingCount = logs.filter(l => l.status === 'pending').length;
  const inProgressCount = logs.filter(l => l.status === 'in-progress').length;
  const resolvedCount = logs.filter(l => l.status === 'resolved').length;
  const totalCost = logs.reduce((sum, l) => sum + (l.cost || 0), 0);
  const studentRequestsCount = logs.filter(l => l.source === 'student' || Boolean(l.studentName || l.studentPhone)).length;

  // Filter and search logic
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.assignedTo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.studentPhone || '').includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesType = typeFilter === 'all' || log.issueType === typeFilter;
    const matchesSource = sourceFilter === 'all' || 
      (sourceFilter === 'student' ? (log.source === 'student' || Boolean(log.studentName || log.studentPhone)) : (!log.source || log.source === 'owner'));

    return matchesSearch && matchesStatus && matchesSeverity && matchesType && matchesSource;
  });

  const getIssueTypeLabel = (type: string) => {
    switch(type) {
      case 'plumbing': return 'Plumbing (नलसाजी)';
      case 'electrical': return 'Electrical (बिजली)';
      case 'furniture': return 'Furniture (फर्नीचर)';
      case 'appliance': return 'Appliance (उपकरण)';
      case 'internet': return 'Internet/WiFi (इंटरनेट)';
      default: return 'Other (अन्य)';
    }
  };

  const getIssueColor = (type: string) => {
    switch(type) {
      case 'plumbing': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'electrical': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'furniture': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'appliance': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'internet': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-6" id="maintenance-dashboard-root">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-xl text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-500" />
            <span>Maintenance & Repairs (मरम्मत और रखरखाव)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track room-wise repairs, utility maintenance requests, technician assignments, and cost analysis.
          </p>
        </div>
        <button
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
          id="btn-add-maintenance"
        >
          {isAddFormOpen ? (
            <>
              <X className="w-4 h-4" />
              <span>Cancel (रद्द करें)</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>New Repair Request (नया अनुरोध)</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4" id="maintenance-stats-container">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending (लंबित)</span>
            <span className="block font-display font-black text-lg text-slate-900">{pendingCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
            <Hammer className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Progress (जारी)</span>
            <span className="block font-display font-black text-lg text-slate-900">{inProgressCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolved (हल हुआ)</span>
            <span className="block font-display font-black text-lg text-slate-900">{resolvedCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">From Students (छात्र)</span>
            <span className="block font-display font-black text-lg text-purple-900">{studentRequestsCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expenses (खर्च)</span>
            <span className="block font-display font-black text-lg text-slate-900">₹{totalCost.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Add New Request Form Panel */}
      <AnimatePresence>
        {isAddFormOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            id="add-maintenance-panel"
          >
            <form onSubmit={handleCreateLog} className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-200">Log New Maintenance & Repair Request</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Room Number */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Room or Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="Room or Area (102, Kitchen, Corridor)"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none text-white"
                  />
                </div>

                {/* Issue Type */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Category *</label>
                  <select
                    value={newIssueType}
                    onChange={(e) => setNewIssueType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none text-white cursor-pointer"
                  >
                    <option value="plumbing">Plumbing (नल का काम)</option>
                    <option value="electrical">Electrical (बिजली का काम)</option>
                    <option value="furniture">Furniture (लकड़ी/फर्नीचर)</option>
                    <option value="appliance">Appliance (उपकरण मरम्मत)</option>
                    <option value="internet">Internet/WiFi (वाईफाई)</option>
                    <option value="other">Other (अन्य)</option>
                  </select>
                </div>

                {/* Severity */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Priority *</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none text-white cursor-pointer"
                  >
                    <option value="low">Low Priority (कम)</option>
                    <option value="medium">Medium Priority (मध्यम)</option>
                    <option value="high">High Priority (उच्च/तुरंत)</option>
                  </select>
                </div>

                {/* Source */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Source (स्रोत)</label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none text-white cursor-pointer"
                  >
                    <option value="owner">🏢 Caretaker/Owner</option>
                    <option value="student">🎓 Student Reported</option>
                  </select>
                </div>
              </div>

              {/* Student Details (Optional) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Student Name</label>
                  <input
                    type="text"
                    placeholder="Student Name (optional)"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Student Phone</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Preferred Visit Time</label>
                  <input
                    type="text"
                    placeholder="Preferred Time (Morning / Evening)"
                    value={newPreferredTime}
                    onChange={(e) => setNewPreferredTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Issue Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe the issue clearly so technicians can understand..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Assigned To */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Assigned Technician</label>
                  <input
                    type="text"
                    placeholder="Technician Name (Electrician / Plumber)"
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none text-white"
                  />
                </div>

                {/* Estimated Cost */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Estimated/Incurred Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="Amount in ₹"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none text-white"
                  />
                </div>
              </div>

              {/* Resolution Notes */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Internal Notes</label>
                <input
                  type="text"
                  placeholder="Any extra details, contact numbers, parts to purchase..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-colors cursor-pointer"
                >
                  Save Task (सुरक्षित करें)
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3" id="maintenance-filters-panel">
        <div className="flex items-center justify-between text-slate-400 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Filter & Search Options</span>
          </div>
          <span className="text-[10px] font-medium text-slate-400">
            Showing <strong>{filteredLogs.length}</strong> of <strong>{logs.length}</strong> records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative col-span-1 sm:col-span-2 md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search room, student, desc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 bg-slate-50/50"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700 bg-white cursor-pointer"
            >
              <option value="all">All Statuses (सभी स्थिति)</option>
              <option value="pending">Pending (लंबित)</option>
              <option value="in-progress">In-Progress (काम चालू)</option>
              <option value="resolved">Resolved (सुलझा हुआ)</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700 bg-white cursor-pointer"
            >
              <option value="all">All Sources (सभी स्रोत)</option>
              <option value="student">🎓 Student Portal ({studentRequestsCount})</option>
              <option value="owner">🏢 Caretaker/Internal</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700 bg-white cursor-pointer"
            >
              <option value="all">All Priorities (सभी)</option>
              <option value="high">High Priority (उच्च)</option>
              <option value="medium">Medium Priority (मध्यम)</option>
              <option value="low">Low Priority (निम्न)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700 bg-white cursor-pointer"
            >
              <option value="all">All Categories (सभी श्रेणियां)</option>
              <option value="plumbing">Plumbing (नलसाजी)</option>
              <option value="electrical">Electrical (बिजली)</option>
              <option value="furniture">Furniture (फर्नीचर)</option>
              <option value="appliance">Appliance (उपकरण)</option>
              <option value="internet">Internet/WiFi (इंटरनेट)</option>
              <option value="other">Other (अन्य)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main List Area */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden" id="maintenance-logs-table-wrapper">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Loading maintenance log records in real-time...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Info className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold">No maintenance logs found matching the filters.</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">Use the filters above to broaden your search, or log a new task using the "New Repair Request" button.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4 w-28">Room / Area</th>
                    <th className="p-4 w-32">Category</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 w-28">Severity</th>
                    <th className="p-4 w-32">Status</th>
                    <th className="p-4 w-32">Cost / Assignment</th>
                    <th className="p-4 text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Room */}
                      <td className="p-4 font-display font-extrabold text-slate-900">
                        <div>{log.roomNumber}</div>
                        {log.source === 'student' || log.studentName || log.studentPhone ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-md mt-1">
                            <GraduationCap className="w-2.5 h-2.5" /> Student
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md mt-1">
                            🏢 Internal
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getIssueColor(log.issueType)}`}>
                          {getIssueTypeLabel(log.issueType).split(' ')[0]}
                        </span>
                      </td>

                      {/* Description & Student Reporter Info */}
                      <td className="p-4 space-y-1.5 max-w-sm">
                        <p className="font-medium text-slate-800 line-clamp-2">{log.description}</p>
                        
                        {/* Student Reporter details if any */}
                        {(log.studentName || log.studentPhone || log.preferredTime) && (
                          <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-2 text-[11px] space-y-1 text-purple-900">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold flex items-center gap-1 truncate">
                                <GraduationCap className="w-3 h-3 text-purple-600 shrink-0" />
                                {log.studentName || 'Student'}
                              </span>
                              {log.studentPhone && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <a
                                    href={`tel:${log.studentPhone}`}
                                    title="Call Student"
                                    className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-purple-100 rounded transition-colors"
                                  >
                                    <Phone className="w-3 h-3" />
                                  </a>
                                  <a
                                    href={`https://wa.me/91${log.studentPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${log.studentName || ''}, regarding your maintenance request for Room ${log.roomNumber}: ${log.description}`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="WhatsApp Student"
                                    className="p-1 text-emerald-600 hover:bg-emerald-100 rounded transition-colors"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                            </div>
                            {log.preferredTime && (
                              <p className="text-[10px] text-purple-700">
                                <span className="font-bold">Preferred Time:</span> {log.preferredTime}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {log.reportedDate}</span>
                          {log.resolvedDate && (
                            <span className="text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-md font-bold">
                              Resolved: {log.resolvedDate}
                            </span>
                          )}
                        </div>
                        {log.notes && (
                          <p className="text-[10px] text-slate-500 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            <span className="font-bold">Note:</span> {log.notes}
                          </p>
                        )}
                      </td>

                      {/* Severity */}
                      <td className="p-4">
                        {log.severity === 'high' && (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-red-100">
                            <AlertTriangle className="w-3 h-3" /> High
                          </span>
                        )}
                        {log.severity === 'medium' && (
                          <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-orange-100">
                            <Clock className="w-3 h-3" /> Medium
                          </span>
                        )}
                        {log.severity === 'low' && (
                          <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            Low
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {log.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl font-black text-[10px] border border-amber-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>Pending</span>
                          </span>
                        )}
                        {log.status === 'in-progress' && (
                          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl font-black text-[10px] border border-blue-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            <span>In Progress</span>
                          </span>
                        )}
                        {log.status === 'resolved' && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl font-black text-[10px] border border-emerald-100">
                            <Check className="w-3 h-3" />
                            <span>Resolved</span>
                          </span>
                        )}
                      </td>

                      {/* Cost & Assignment */}
                      <td className="p-4 space-y-1">
                        {log.assignedTo ? (
                          <span className="text-[11px] text-slate-600 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[100px]">{log.assignedTo}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                        )}
                        <span className="block font-bold text-slate-900 text-xs">
                          {log.cost ? `₹${log.cost.toLocaleString('en-IN')}` : '₹0.00'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-1.5">
                        {log.status !== 'resolved' && (
                          <button
                            onClick={() => handleQuickResolve(log)}
                            title="Mark as Resolved"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg border border-slate-100 hover:border-emerald-100 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleStartEdit(log)}
                          title="Edit Request"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          title="Delete Request"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-100 hover:border-rose-100 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Bento-List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors text-slate-800">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-extrabold text-sm text-slate-900">{log.roomNumber}</span>
                        {log.source === 'student' || log.studentName || log.studentPhone ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                            <GraduationCap className="w-2.5 h-2.5" /> Student
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[10px] text-slate-400">{log.reportedDate}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold border ${getIssueColor(log.issueType)}`}>
                        {getIssueTypeLabel(log.issueType).split(' ')[0]}
                      </span>
                      {log.severity === 'high' && (
                        <span className="text-red-700 bg-red-50 border border-red-100 text-[9px] font-bold px-1.5 py-0.5 rounded-md">High</span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-700 leading-relaxed">{log.description}</p>

                  {/* Student details on mobile */}
                  {(log.studentName || log.studentPhone || log.preferredTime) && (
                    <div className="bg-purple-50/80 border border-purple-100 rounded-xl p-2.5 text-[11px] space-y-1.5 text-purple-900">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                          {log.studentName || 'Student'} {log.studentPhone && `(${log.studentPhone})`}
                        </span>
                        {log.studentPhone && (
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${log.studentPhone}`}
                              className="px-2 py-1 bg-white border border-purple-200 text-purple-700 rounded-lg text-[10px] font-bold flex items-center gap-1"
                            >
                              <Phone className="w-2.5 h-2.5" /> Call
                            </a>
                            <a
                              href={`https://wa.me/91${log.studentPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${log.studentName || ''}, regarding your maintenance request for Room ${log.roomNumber}: ${log.description}`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs"
                            >
                              <MessageSquare className="w-2.5 h-2.5" /> WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                      {log.preferredTime && (
                        <p className="text-[10px] text-purple-700">
                          <span className="font-bold">Preferred Time:</span> {log.preferredTime}
                        </p>
                      )}
                    </div>
                  )}

                  {log.notes && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] text-slate-600 italic">
                      <span className="font-black text-slate-700">Note:</span> {log.notes}
                    </div>
                  )}

                  {/* Status, Costs and Assignment on Mobile */}
                  <div className="bg-slate-50/70 rounded-xl p-2.5 flex items-center justify-between text-[11px] gap-2 border border-slate-100">
                    <div className="space-y-1">
                      <span className="block text-[8px] text-slate-400 uppercase font-bold">Assigned</span>
                      <span className="font-medium text-slate-700 flex items-center gap-1 truncate max-w-[120px]">
                        <User className="w-3 h-3 text-slate-400" />
                        {log.assignedTo || 'Unassigned'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[8px] text-slate-400 uppercase font-bold">Cost</span>
                      <span className="font-extrabold text-slate-900">
                        {log.cost ? `₹${log.cost.toLocaleString('en-IN')}` : '₹0.00'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[8px] text-slate-400 uppercase font-bold text-right">Status</span>
                      <div className="text-right">
                        {log.status === 'pending' && (
                          <span className="inline-flex px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 font-bold text-[9px]">Pending</span>
                        )}
                        {log.status === 'in-progress' && (
                          <span className="inline-flex px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 font-bold text-[9px]">Working</span>
                        )}
                        {log.status === 'resolved' && (
                          <span className="inline-flex px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[9px]">Resolved</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50">
                    {log.status !== 'resolved' && (
                      <button
                        onClick={() => handleQuickResolve(log)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold cursor-pointer"
                      >
                        <Check className="w-3 h-3" /> Mark Resolved
                      </button>
                    )}
                    <button
                      onClick={() => handleStartEdit(log)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer hover:bg-slate-50"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 text-[10px] font-bold cursor-pointer hover:bg-rose-50"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal Overlay */}
      <AnimatePresence>
        {editingLog && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]" id="edit-log-modal-overlay">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden text-slate-800 flex flex-col max-h-[92vh]"
            >
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <h3 className="font-display font-black text-sm flex items-center gap-1.5 uppercase tracking-wider">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  <span>Edit Maintenance Record</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-left overflow-y-auto flex-1 scrollbar-none">
                {/* Room, Status and Source */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Room / Area *</label>
                    <input
                      type="text"
                      required
                      value={editRoomNumber}
                      onChange={(e) => setEditRoomNumber(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Status *</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                    >
                      <option value="pending">Pending (लंबित)</option>
                      <option value="in-progress">In-Progress (काम जारी)</option>
                      <option value="resolved">Resolved (ठीक हो गया)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Source *</label>
                    <select
                      value={editSource}
                      onChange={(e) => setEditSource(e.target.value as any)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                    >
                      <option value="owner">🏢 Owner/Caretaker</option>
                      <option value="student">🎓 Student Reported</option>
                    </select>
                  </div>
                </div>

                {/* Student Details in Edit */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Student Name</label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={editStudentName}
                      onChange={(e) => setEditStudentName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs bg-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Student Phone</label>
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={editStudentPhone}
                      onChange={(e) => setEditStudentPhone(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs bg-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Preferred Time</label>
                    <input
                      type="text"
                      placeholder="Time"
                      value={editPreferredTime}
                      onChange={(e) => setEditPreferredTime(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs bg-white outline-none"
                    />
                  </div>
                </div>

                {/* Category and Severity */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Category *</label>
                    <select
                      value={editIssueType}
                      onChange={(e) => setEditIssueType(e.target.value as any)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                    >
                      <option value="plumbing">Plumbing (नलसाजी)</option>
                      <option value="electrical">Electrical (बिजली)</option>
                      <option value="furniture">Furniture (फर्नीचर)</option>
                      <option value="appliance">Appliance (उपकरण)</option>
                      <option value="internet">Internet/WiFi (इंटरनेट)</option>
                      <option value="other">Other (अन्य)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Severity *</label>
                    <select
                      value={editSeverity}
                      onChange={(e) => setEditSeverity(e.target.value as any)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Issue Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                  />
                </div>

                {/* Assignment & Costs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Assigned Technician</label>
                    <input
                      type="text"
                      placeholder="Technician Name (Electrician / Plumber)"
                      value={editAssignedTo}
                      onChange={(e) => setEditAssignedTo(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase">Expense Cost (₹)</label>
                    <input
                      type="number"
                      placeholder="Amount in ₹"
                      value={editCost}
                      onChange={(e) => setEditCost(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Date Resolved */}
                {editStatus === 'resolved' && (
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase font-extrabold text-emerald-600">Resolution Date (हल की तारीख) *</label>
                    <input
                      type="date"
                      required
                      value={editResolvedDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEditResolvedDate(e.target.value)}
                      className="w-full border border-emerald-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-none bg-emerald-50/20"
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase">Internal Notes</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingLog(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
