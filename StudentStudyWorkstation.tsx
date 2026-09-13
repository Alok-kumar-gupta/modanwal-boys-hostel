/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Target, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Trophy, 
  Calendar,
  Layers,
  Award,
  BookMarked
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BookingInquiry, StudentPrepTask } from '../types';

interface StudentStudyWorkstationProps {
  student: BookingInquiry;
  onGoalCompleted?: () => void;
}

const EXAM_REVISION_NOTES = [
  {
    topic: 'UP GK & Important Facts (उत्तर प्रदेश विशेष)',
    points: [
      'राजधानी: लखनऊ (1921 से आंशिक, 1935 से पूर्ण)',
      'सर्वाधिक क्षेत्रफल वाला जिला: लखीमपुर खीरी',
      'न्यूनतम क्षेत्रफल वाला जिला: हापुड़',
      'सर्वाधिक साक्षरता वाला जिला: गौतम बुद्ध नगर (नोएडा)',
      'उत्तर प्रदेश का राजकीय पशु: बारहसिंगा, राजकीय पक्षी: सारस/क्रौंच'
    ]
  },
  {
    topic: 'Indian Polity & Key Articles (भारतीय संविधान)',
    points: [
      'अनुच्छेद 14: विधि के समक्ष समानता',
      'अनुच्छेद 21: प्राण एवं दैहिक स्वतंत्रता का संरक्षण (Right to Privacy)',
      'अनुच्छेद 32: संवैधानिक उपचारों का अधिकार (संविधान की आत्मा)',
      'अनुच्छेद 40: ग्राम पंचायतों का संगठन'
    ]
  },
  {
    topic: 'Maths & Reasoning Quick Tricks (गणित एवं तर्कशक्ति)',
    points: [
      'Square of number ending with 5: e.g. 65² = (6×7) + 25 = 4225',
      'Pythagorean Triplets: (3,4,5), (5,12,13), (7,24,25), (8,15,17)',
      'Divisibility by 11: Difference between sum of odd & even place digits is 0 or multiple of 11.'
    ]
  }
];

export default function StudentStudyWorkstation({ student, onGoalCompleted }: StudentStudyWorkstationProps) {
  // Focus Timer state
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'deep_focus' | 'stopwatch'>('pomodoro');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<any>(null);

  // Daily Study Goal Tracker
  const [targetHours, setTargetHours] = useState<number>(6);
  const [completedMinutes, setCompletedMinutes] = useState<number>(180); // 3 hours initially
  const [targetExam, setTargetExam] = useState<string>('UP Police SI / Constable & Competitive Exams');

  // Daily Tasks Checklist
  const [tasks, setTasks] = useState<StudentPrepTask[]>([
    { id: '1', text: 'Solve 50 Reasoning practice questions', completed: true, createdAt: 'Today' },
    { id: '2', text: 'Revise UP GK History & Geography notes', completed: true, createdAt: 'Today' },
    { id: '3', text: 'Daily Current Affairs & Hindi Grammar mock test', completed: false, createdAt: 'Today' },
    { id: '4', text: 'Quantitative Aptitude (Percentage & Ratio 20 sums)', completed: false, createdAt: 'Today' }
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  // Scratchpad
  const [scratchpadNote, setScratchpadNote] = useState<string>(() => {
    return localStorage.getItem(`modanwal_scratchpad_${student.id || student.phone}`) || '• Formula: Speed = Distance / Time\n• Key Revision: Fundamental Rights Articles 12-35\n• Next test series at 6:00 PM';
  });

  // Streaks & Achievements
  const [streakDays, setStreakDays] = useState<number>(5);
  const [hasCelebratedToday, setHasCelebratedToday] = useState(false);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (timerMode === 'stopwatch') {
          setStopwatchSeconds(prev => {
            const next = prev + 1;
            if (next % 60 === 0) {
              setCompletedMinutes(m => m + 1);
            }
            return next;
          });
        } else {
          setSecondsLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsRunning(false);
              triggerConfettiCelebration();
              // Add completed time
              const addedMins = timerMode === 'pomodoro' ? 25 : 50;
              setCompletedMinutes(m => m + addedMins);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timerMode]);

  const handleModeChange = (mode: 'pomodoro' | 'deep_focus' | 'stopwatch') => {
    setIsRunning(false);
    setTimerMode(mode);
    if (mode === 'pomodoro') setSecondsLeft(25 * 60);
    if (mode === 'deep_focus') setSecondsLeft(50 * 60);
    if (mode === 'stopwatch') setStopwatchSeconds(0);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    if (timerMode === 'pomodoro') setSecondsLeft(25 * 60);
    if (timerMode === 'deep_focus') setSecondsLeft(50 * 60);
    if (timerMode === 'stopwatch') setStopwatchSeconds(0);
  };

  const triggerConfettiCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti trigger', e);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Daily Goal percentage
  const totalTargetMinutes = targetHours * 60;
  const progressPercent = Math.min(100, Math.round((completedMinutes / (totalTargetMinutes || 1)) * 100));

  // Check 100% completion celebration
  useEffect(() => {
    if (progressPercent >= 100 && !hasCelebratedToday) {
      setHasCelebratedToday(true);
      triggerConfettiCelebration();
      if (onGoalCompleted) onGoalCompleted();
    }
  }, [progressPercent, hasCelebratedToday, onGoalCompleted]);

  // Tasks actions
  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks(prev => [
      ...prev,
      { id: `t-${Date.now()}`, text: newTaskText.trim(), completed: false, createdAt: 'Today' }
    ]);
    setNewTaskText('');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Save scratchpad
  const handleScratchpadChange = (val: string) => {
    setScratchpadNote(val);
    localStorage.setItem(`modanwal_scratchpad_${student.id || student.phone}`, val);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="student-study-workstation">
      
      {/* Top Banner: Study Goals & Consecutive Streak */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white border border-indigo-900/50 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{streakDays}-Day Goal Streak (लक्ष्य निरंतरता)</span>
              </span>
              <span className="text-xs text-indigo-300 font-medium">
                Target: {targetExam}
              </span>
            </div>
            <h2 className="font-display font-black text-2xl text-white tracking-tight">
              विद्यार्थी सेल्फ-स्टडी वर्कस्टेशन • Focus Hub
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              स्मार्ट पोमोडोरो टाइमर, दैनिक अध्ययन लक्ष्य ट्रैकर, रिवीज़न नोट्स एवं टास्क चेकलिस्ट।
            </p>
          </div>

          {/* Quick Confetti & Trophy Button */}
          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerConfettiCelebration();
                setCompletedMinutes(m => m + 30);
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs px-4 py-3 rounded-2xl shadow-md transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-slate-950" />
              <span>+30 Min Study Completed</span>
            </button>
          </div>
        </div>

        {/* Daily Goal Progress Bar */}
        <div className="mt-5 pt-4 border-t border-indigo-900/60 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-indigo-200 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-400" />
              Daily Study Target: {(completedMinutes / 60).toFixed(1)} / {targetHours} Hours
            </span>
            <span className="font-extrabold text-emerald-400 font-mono text-sm">
              {progressPercent}% Achieved
            </span>
          </div>
          
          <div className="w-full bg-slate-800/80 rounded-full h-3 p-0.5 border border-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercent >= 100 
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-sm shadow-emerald-500/50' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0h (Start)</span>
            <span>25%</span>
            <span>50% (Milestone)</span>
            <span>75%</span>
            <span className="text-emerald-400 font-bold">100% (Target Goal)</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Focus Timer & Scratchpad (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Cabin Focus Timer Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    Hostel Cabin Focus Timer
                  </h3>
                  <p className="text-[11px] text-slate-400">Deep study sessions with chime feedback</p>
                </div>
              </div>

              {/* Mode Selectors */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleModeChange('pomodoro')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timerMode === 'pomodoro' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  25m Pomodoro
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('deep_focus')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timerMode === 'deep_focus' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  50m Deep Focus
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('stopwatch')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timerMode === 'stopwatch' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Stopwatch
                </button>
              </div>
            </div>

            {/* Huge Digital Clock Display */}
            <div className="py-4">
              <div className="font-mono font-black text-6xl sm:text-7xl text-slate-900 tracking-tight select-none">
                {timerMode === 'stopwatch' ? formatTimer(stopwatchSeconds) : formatTimer(secondsLeft)}
              </div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-2 block">
                {isRunning ? '🔥 Active Study Session Running' : 'Session Paused / Ready'}
              </span>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className={`px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isRunning ? 'Pause Session' : 'Start Focus Session'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetTimer}
                className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Rough Notes Scratchpad */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-purple-600" />
                Cabin Rough Notes & Formula Scratchpad (रफ नोट्स)
              </h3>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                Auto-saved in browser
              </span>
            </div>
            <textarea
              rows={4}
              value={scratchpadNote}
              onChange={(e) => handleScratchpadChange(e.target.value)}
              placeholder="Quick formulas, key points, or today's study targets..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

        </div>

        {/* Right Column: Tasks Checklist & Exam Revision Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Daily Prep Targets Checklist */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Daily Prep Targets (दैनिक लक्ष्य)
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {tasks.filter(t => t.completed).length} of {tasks.length} done
              </span>
            </div>

            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add new study target..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Tasks List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 text-xs ${
                    task.completed 
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-500 line-through' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                    <span className="font-medium leading-tight">{task.text}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Exam Revision Deck */}
          <div className="bg-slate-900 p-6 rounded-3xl text-white border border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Rapid Exam Revision Deck (महत्वपूर्ण तथ्य)
              </h3>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                UP Exams
              </span>
            </div>

            <div className="space-y-3">
              {EXAM_REVISION_NOTES.map((note, idx) => (
                <div key={idx} className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-1.5">
                  <h4 className="font-bold text-xs text-amber-300">{note.topic}</h4>
                  <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                    {note.points.map((p, pIdx) => (
                      <li key={pIdx} className="leading-relaxed">{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
