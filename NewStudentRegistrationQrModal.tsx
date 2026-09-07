/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  X, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  Building, 
  ShieldCheck, 
  Sparkles, 
  Smartphone, 
  Users, 
  Eye, 
  CheckCircle2,
  Clock,
  ArrowRight,
  Settings2,
  RotateCcw,
  Globe,
  Info
} from 'lucide-react';
import { BookingInquiry, HostelConfig } from '../types';
import { generateStudentQRCode, drawQRCodeToCanvasElement } from '../lib/qrCodeUtil';

interface NewStudentRegistrationQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HostelConfig;
  bookings: BookingInquiry[];
  onOpenSelfRegistrationForm: () => void;
  onOpenReviewApprovals?: () => void;
}

export default function NewStudentRegistrationQrModal({
  isOpen,
  onClose,
  config,
  bookings,
  onOpenSelfRegistrationForm,
  onOpenReviewApprovals
}: NewStudentRegistrationQrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [showDomainEditor, setShowDomainEditor] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mbh_custom_admission_domain') || '';
    }
    return '';
  });
  const [activeCustomDomain, setActiveCustomDomain] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mbh_custom_admission_domain') || '';
    }
    return '';
  });
  const [domainStatusMsg, setDomainStatusMsg] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute clean base URL
  const getCleanBaseUrl = (): string => {
    if (activeCustomDomain.trim()) {
      let d = activeCustomDomain.trim();
      if (!d.startsWith('http://') && !d.startsWith('https://')) {
        d = `https://${d}`;
      }
      return d.replace(/\/+$/, '');
    }

    if (typeof window !== 'undefined') {
      let origin = window.location.origin;
      // CRITICAL: ais-dev- is a private container only accessible inside the active AI Studio session.
      // Phone scanners or outside users cannot open ais-dev-, getting 'Page Not Found' (404/auth failure).
      // Automatically convert it to the public preview container ais-pre-!
      if (origin.includes('ais-dev-')) {
        origin = origin.replace('ais-dev-', 'ais-pre-');
      }
      let path = window.location.pathname;
      if (path.endsWith('/index.html')) {
        path = path.slice(0, -11);
      }
      path = path.replace(/\/+$/, '');
      return `${origin}${path}`;
    }

    return 'https://ais-pre-at6hsde7brqiqn75g6mgew-482445399479.asia-east1.run.app';
  };

  const baseUrl = getCleanBaseUrl();
  const registrationUrl = `${baseUrl}/?mode=self-register#self-register`;

  // Count pending QR self-registrations waiting for owner approval
  const pendingSelfRegistrations = bookings.filter(
    (b) => (b.inquiryType === 'self-register' || b.customNotes?.includes('QR')) && (b.status === 'pending' || b.ownerPermission === false)
  );

  // Render QR code to canvas and dataUrl
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsGenerating(true);

    const generate = async () => {
      try {
        // 1. Direct canvas draw
        if (canvasRef.current) {
          const png = await drawQRCodeToCanvasElement(canvasRef.current, registrationUrl, {
            size: 320,
            dark: '#000000',
            light: '#ffffff',
            margin: 2,
            errorCorrectionLevel: 'M'
          });

          if (isMounted) {
            if (png) setQrDataUrl(png);
            setIsGenerating(false);
          }
        }

        // 2. High-res dataUrl generation as fallback and for export
        const dataUrl = await generateStudentQRCode(registrationUrl, {
          width: 400,
          dark: '#000000',
          light: '#ffffff',
          margin: 2,
          errorCorrectionLevel: 'M'
        });

        if (isMounted && dataUrl) {
          setQrDataUrl(dataUrl);
          setIsGenerating(false);
        }
      } catch (err) {
        console.error('Failed to generate admission QR code:', err);
        if (isMounted) setIsGenerating(false);
      }
    };

    // Slight delay so canvas is guaranteed in DOM
    const timer = setTimeout(generate, 60);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, registrationUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(registrationUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleDownloadQr = () => {
    let url = qrDataUrl;
    if (!url && canvasRef.current) {
      url = canvasRef.current.toDataURL('image/png');
    }
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.hostelName.replace(/\s+/g, '_')}_Admission_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `🏨 *${config.hostelName} - New Student Admission Form*\n\nनमस्ते! हॉस्टल में नए प्रवेश (Room Allotment) हेतु नीचे दिए गए लिंक को खोलें और अपना विवरण भरें:\n\n👉 ${registrationUrl}\n\nकेयरटेकर द्वारा अप्रूवल के बाद आपका स्टूडेंट पोर्टल चालू हो जाएगा।\n📞 केयरटेकर: ${config.caretakerName} (${config.phone})`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSaveCustomDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customDomainInput.trim();
    if (!clean) {
      handleResetDomain();
      return;
    }
    localStorage.setItem('mbh_custom_admission_domain', clean);
    setActiveCustomDomain(clean);
    setDomainStatusMsg('✓ डोमेन सफलतापूर्वक अपडेट हो गया! QR कोड रीफ्रेश किया गया।');
    setTimeout(() => setDomainStatusMsg(''), 3000);
  };

  const handleResetDomain = () => {
    localStorage.removeItem('mbh_custom_admission_domain');
    setActiveCustomDomain('');
    setCustomDomainInput('');
    setDomainStatusMsg('✓ ओरिजिनल लाइव वेबसाइट लिंक रीसेट कर दिया गया!');
    setTimeout(() => setDomainStatusMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden text-slate-900 dark:text-slate-100 print:border-none print:shadow-none print:w-full print:max-w-none"
        id="owner-admission-qr-modal"
      >
        {/* Header (Hidden in Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>नया छात्र प्रवेश QR पोस्टर</span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  Admission QR
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                गेट या रिसेप्शन पर लगाने हेतु स्टैंडी/पोस्टर
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
          
          {/* Pending Approvals Alert Banner */}
          {pendingSelfRegistrations.length > 0 && onOpenReviewApprovals && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 rounded-xl flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200 print:hidden">
              <div className="flex items-center gap-2.5 text-xs">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
                <span>
                  <strong>{pendingSelfRegistrations.length} नए छात्रों</strong> ने QR स्कैन करके फॉर्म भरा है जो आपकी मंज़ूरी की प्रतीक्षा में हैं।
                </span>
              </div>
              <button
                onClick={onOpenReviewApprovals}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>रिव्यू करें</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Direct Form Test Button (Primary Action for Owner) */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200 print:hidden shadow-xs">
            <div className="text-left">
              <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>सीधे यहीं छात्र एडमिशन फॉर्म खोलें व टेस्ट करें:</span>
              </div>
              <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 mt-0.5">
                बिना मोबाइल स्कैन किए, आप स्वयं भी छात्र का फॉर्म तुरंत भर सकते हैं।
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSelfRegistrationForm();
              }}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>छात्र फॉर्म खोलें (Open Form)</span>
            </button>
          </div>

          {/* Printable QR Standee / Card */}
          <div 
            className="bg-gradient-to-b from-slate-50 to-indigo-50/40 dark:from-slate-800/50 dark:to-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-5 sm:p-6 text-center space-y-4 shadow-sm"
            id="printable-admission-qr-card"
          >
            {/* Poster Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MODANWAL BOYS HOSTEL • ADMISSION QR</span>
              </div>
              <h2 className="text-lg sm:text-xl font-display font-extrabold text-slate-900 dark:text-white pt-1">
                {config.hostelName}
              </h2>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 font-bold">
                📱 मोबाइल कैमरे से स्कैन करें और नया प्रवेश फॉर्म भरें (Scan to Register)
              </p>
            </div>

            {/* QR Code Canvas Display - Direct DOM Vector Canvas */}
            <div className="relative inline-block bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 shadow-md">
              <canvas 
                ref={canvasRef} 
                width={320} 
                height={320}
                className="w-56 h-56 sm:w-64 sm:h-64 mx-auto block bg-white rounded-lg shadow-inner" 
                id="admission-qr-canvas"
              />
              
              {isGenerating && (
                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-2 text-slate-500 rounded-2xl">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold">QR कोड तैयार हो रहा है...</span>
                </div>
              )}
            </div>

            {/* Step by Step Hindi Instructions */}
            <div className="bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
              <span className="font-extrabold text-indigo-900 dark:text-indigo-300 text-[11px] block uppercase tracking-wider">
                📌 छात्र हेतु 3 आसान चरण (3 Easy Steps):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                  <span>मोबाइल कैमरे या गूगल लेंस से QR स्कैन करें।</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                  <span>नाम, फोन, कॉलेज, आधार व कमरा चुनें।</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                  <span>केयरटेकर अप्रूवल के बाद पोर्टल लॉगिन करें!</span>
                </div>
              </div>
            </div>

            {/* Poster Footer with Caretaker Contact */}
            <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-center gap-3">
              <span>👤 केयरटेकर: <strong className="text-slate-800 dark:text-slate-200">{config.caretakerName}</strong></span>
              <span>•</span>
              <span>📞 संपर्क: <strong className="text-slate-800 dark:text-slate-200">{config.phone}</strong></span>
            </div>
          </div>

          {/* Scanned Destination Link Info & Domain Control */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 text-left space-y-2 text-xs print:hidden">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold text-indigo-950 dark:text-indigo-200 text-[11px] flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>QR कोड स्कैन करने पर यह लिंक खुलेगा:</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDomainEditor(!showDomainEditor)}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-bold bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                  title="डोमेन बदलें या कस्टम लिंक सेट करें"
                >
                  <Settings2 className="w-3 h-3" />
                  <span>{showDomainEditor ? 'एडिटर छुपाएं' : 'डोमेन बदलें (Edit Domain)'}</span>
                </button>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-100/60 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                  {activeCustomDomain ? 'कस्टम डोमेन सक्रिय' : '✓ लाइव ऑटो डोमेन'}
                </span>
              </div>
            </div>

            {/* Domain Editor Form */}
            {showDomainEditor && (
              <form onSubmit={handleSaveCustomDomain} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2.5">
                <div className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p>
                    यदि आपने अपनी वेबसाइट को <strong>Firebase Hosting, Vercel</strong> या अपने <strong>कस्टम डोमेन (जैसे: modanwalhostel.in)</strong> पर पब्लिश किया है, तो वह डोमेन यहाँ लिखकर सेव करें। QR कोड उसी डोमेन से नया लिंक बना देगा!
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={customDomainInput}
                      onChange={(e) => setCustomDomainInput(e.target.value)}
                      placeholder="e.g. https://modanwalboyshostel.web.app"
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-colors"
                  >
                    सेव करें
                  </button>
                  {activeCustomDomain && (
                    <button
                      type="button"
                      onClick={handleResetDomain}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                      title="ओरिजिनल लिंक रीसेट करें"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>रीसेट</span>
                    </button>
                  )}
                </div>

                {domainStatusMsg && (
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {domainStatusMsg}
                  </p>
                )}
              </form>
            )}

            {/* Active URL bar */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900">
              <p className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 truncate flex-1 select-all" title={registrationUrl}>
                {registrationUrl}
              </p>
              <a
                href={registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold shrink-0 flex items-center gap-1 transition-colors"
                title="नए ब्राउज़र टैब में खोलें"
              >
                <ExternalLink className="w-3 h-3" />
                <span>टेस्ट करें</span>
              </a>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 print:hidden">
            {/* Download PNG */}
            <button
              onClick={handleDownloadQr}
              className="px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 dark:text-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer shadow-xs"
              title="QR कोड की हाई-क्वालिटी PNG डाउनलोड करें"
            >
              <Download className="w-4 h-4" />
              <span>डाउनलोड QR</span>
            </button>

            {/* Print Poster */}
            <button
              onClick={handlePrint}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
              title="गेट/रिसेप्शन के लिए पोस्टर प्रिंट करें"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिंट पोस्टर</span>
            </button>

            {/* Share WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer shadow-xs"
              title="व्हाट्सएप पर एडमिशन लिंक भेजें"
            >
              <Share2 className="w-4 h-4" />
              <span>व्हाट्सएप शेयर</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
              title="डायरेक्ट लिंक कॉपी करें"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'कॉपी हो गया!' : 'लिंक कॉपी करें'}</span>
            </button>
          </div>

          {/* Quick Troubleshooting Tip Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 p-3.5 rounded-2xl text-left space-y-2 text-xs text-slate-600 dark:text-slate-300 print:hidden">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs">
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>मोबाइल स्कैन में 'Page Not Found' क्यों आता है और इसका समाधान:</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 pl-1 leading-relaxed">
              <li>
                <strong>AI Studio शेयरिंग:</strong> जब तक आप ऊपर दाईं तरफ (Top-Right) दिए गए <span className="text-indigo-600 dark:text-indigo-400 font-bold">"Share"</span> बटन को दबाकर ऐप को शेयर नहीं करते, तब तक गूगल सुरक्षा कारणों से बाहरी मोबाइल फोन पर इसे ब्लॉक रखता है। Share दबाते ही किसी भी मोबाइल पर यह तुरंत खुलेगा।
              </li>
              <li>
                <strong>बिना मोबाइल स्कैन के सीधा फॉर्म:</strong> ऊपर हरे बटन <span className="text-emerald-600 dark:text-emerald-400 font-bold">"छात्र फॉर्म खोलें (Open Form)"</span> पर क्लिक करें—कंप्यूटर पर ही 1 सेकंड में पूरा फॉर्म खुल जाएगा।
              </li>
              <li>
                <strong>कस्टम डोमेन / लाइव लिंक:</strong> यदि आप अपनी वेबसाइट किसी डोमेन पर होस्ट कर रहे हैं, तो <span className="text-indigo-600 dark:text-indigo-400 font-bold">'डोमेन बदलें'</span> में वह लिंक डाल दें, QR कोड हमेशा के लिए पक्का बन जाएगा।
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
