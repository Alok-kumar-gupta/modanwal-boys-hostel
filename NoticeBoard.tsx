/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bell, AlertTriangle, Info, Calendar, Sparkles, CheckCircle2, ChevronRight, Pin } from 'lucide-react';
import { NoticeItem } from '../types';

interface NoticeBoardProps {
  notices: NoticeItem[];
  onOpenOwnerNoticeManager?: () => void;
}

export default function NoticeBoard({ notices, onOpenOwnerNoticeManager }: NoticeBoardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredNotices = notices.filter(n => {
    if (selectedCategory === 'all') return true;
    return n.category === selectedCategory || (selectedCategory === 'urgent' && n.priority === 'high');
  });

  return (
    <section className="py-12 bg-slate-900 text-white border-y border-slate-800" id="hostel-notice-board">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span>डिजिटल सूचना पट्ट • Live Notice Board</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              हॉस्टल ताजा अपडेट एवं महत्वपूर्ण सूचनाएं
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              मेस टाइमिंग, वाई-फाई मेंटेनेंस, नए नियम और प्रवेश संबंधित आधिकारिक सूचनाएं।
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'सभी (All)' },
              { id: 'urgent', label: 'जरूरी (Urgent)' },
              { id: 'announcement', label: 'घोषणा (Announce)' },
              { id: 'maintenance', label: 'मेंटेनेंस (Maintenance)' },
              { id: 'wifi', label: 'वाई-फाई (Wi-Fi)' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notices Grid or Empty State */}
        {filteredNotices.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl border border-slate-800 p-8 text-center space-y-2">
            <Info className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="font-display font-bold text-sm text-slate-300">
              इस समय कोई नई सूचना सक्रिय नहीं है
            </h3>
            <p className="text-xs text-slate-500">
              हॉस्टल मैनेजमेंट द्वारा जारी की गई नई सूचनाएं यहाँ स्वतः लाइव प्रदर्शित होंगी।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotices.map((notice) => {
              const isUrgent = notice.priority === 'high' || notice.category === 'urgent';
              return (
                <div
                  key={notice.id}
                  className={`relative p-5 rounded-2xl border transition-all ${
                    isUrgent
                      ? 'bg-amber-950/20 border-amber-500/40 text-slate-200'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                  }`}
                >
                  {notice.isPinned && (
                    <div className="absolute top-3 right-3 text-amber-400">
                      <Pin className="w-4 h-4 fill-amber-400" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                        isUrgent
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {notice.category.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {notice.createdAt || 'हाल ही में'}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-white mb-2 line-clamp-2">
                    {notice.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line line-clamp-4">
                    {notice.content}
                  </p>

                  {notice.postedBy && (
                    <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                      <span>जारीकर्ता: <strong className="text-slate-200">{notice.postedBy}</strong></span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> अधिकृत
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
