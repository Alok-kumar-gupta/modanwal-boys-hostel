/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  User, 
  Upload, 
  Trash2, 
  Camera,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
  Phone,
  Layers,
  FileText,
  RotateCcw,
  Wifi,
  Key,
  Flame,
  Clock,
  BadgeCheck,
  Award,
  GraduationCap,
  Calendar,
  ExternalLink,
  Lock,
  Unlock,
  Send,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import qrcodeGen from 'qrcode-generator';
import { BookingInquiry, HostelConfig } from '../types';
import { 
  buildStudentVerificationUrl,
  buildStudentVerificationQRText,
  getStudentQRData,
} from '../lib/verificationUtil';
import { StudentQRCodeCanvas } from './StudentQRCodeCanvas';
import { 
  drawIdCardToCanvas, 
  generateIdCardPDF,
  generateStudentQRCode,
  drawQRCodeToCanvasElement,
  triggerFileDownload, 
  printDocumentSheet 
} from '../lib/pdfExportUtil';
import { updateBookingInquiry } from '../lib/hostelService';

interface DigitalIdCardExportProps {
  student: BookingInquiry;
  config: HostelConfig;
  onUpdateStudent?: (updated: BookingInquiry) => void;
}

/**
 * Compresses and resizes an uploaded image file client-side to ensure
 * clean, high-DPI rendering on ID cards and safe storage within Firestore
 * (typically down to 40-80 KB).
 */
function compressAndOptimizePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDimension = 600;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.88);
        resolve(compressed);
      };
      img.onerror = () => reject(new Error('Failed to parse uploaded image file.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

const COURSE_PRESETS = [
  'B.Tech (Computer Science & Engg)',
  'B.Tech (Civil / Mechanical / EE)',
  'BCA (Bachelor of Computer Applications)',
  'MCA (Master of Computer Applications)',
  'B.Pharm (Bachelor of Pharmacy)',
  'D.Pharm (Diploma in Pharmacy)',
  'BBA (Bachelor of Business Admin)',
  'MBA (Master of Business Admin)',
  'B.Sc / M.Sc (Science)',
  'BA / MA (Arts & Humanities)',
  'B.Com / M.Com (Commerce)',
  'Polytechnic / Diploma',
];

export default function DigitalIdCardExport({ 
  student, 
  config,
  onUpdateStudent 
}: DigitalIdCardExportProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'png-front' | 'png-back' | 'pdf' | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [includeQrCode, setIncludeQrCode] = useState<boolean>(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>(() => {
    try {
      const qrData = getStudentQRData(student, config, 'text');
      const qr = (typeof qrcodeGen === 'function' ? qrcodeGen : (qrcodeGen as any)?.default || qrcodeGen)(0, 'M');
      qr.addData(qrData);
      qr.make();
      return qr.createDataURL(4, 2);
    } catch (e) {
      return '';
    }
  });
  const [isGeneratingQR, setIsGeneratingQR] = useState<boolean>(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ID Card Download Quota and Owner Permission controls (Default 1 download limit)
  const downloadLimit = student.idCardDownloadLimit !== undefined ? student.idCardDownloadLimit : 1;
  const downloadCount = student.idCardDownloadCount !== undefined ? student.idCardDownloadCount : 0;
  const isDownloadLocked = downloadCount >= downloadLimit;
  const hasRequestedPermission = Boolean(student.idCardPermissionRequested);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Helper to record successful download and update Firestore
  const recordDownloadUsage = async () => {
    const nextCount = (student.idCardDownloadCount || 0) + 1;
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const updatedStudent: BookingInquiry = {
      ...student,
      idCardDownloadCount: nextCount,
      idCardLastDownloadedAt: nowStr,
      // Once the granted download is consumed, reset permission request flag
      idCardPermissionRequested: false,
    };
    if (student.id) {
      try {
        await updateBookingInquiry(updatedStudent);
      } catch (err) {
        console.warn('Could not save download count to Firestore:', err);
      }
    }
    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
  };

  // Helper for student to request permission from owner to download again
  const handleRequestOwnerPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
      const updatedStudent: BookingInquiry = {
        ...student,
        idCardPermissionRequested: true,
        idCardPermissionRequestedAt: nowStr,
      };
      if (student.id) {
        await updateBookingInquiry(updatedStudent);
      }
      if (onUpdateStudent) {
        onUpdateStudent(updatedStudent);
      }
      setDownloadSuccess('✓ ओनर को पुनः डाउनलोड की अनुमति का अनुरोध भेज दिया गया है! ओनर के अप्रूव करते ही आप डाउनलोड कर सकेंगे।');
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (err) {
      console.error('Failed to request owner permission:', err);
      setPhotoError('अनुमति अनुरोध भेजने में समस्या आई। कृपया पुनः प्रयास करें या WhatsApp करें।');
      setTimeout(() => setPhotoError(null), 5000);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // Course selection state (synced with student profile)
  const initialCourse = student.course || student.studyYear || 'B.Tech (Computer Science & Engg)';
  const [selectedCourse, setSelectedCourse] = useState<string>(initialCourse);
  const [isCustomCourse, setIsCustomCourse] = useState<boolean>(() => {
    return Boolean(initialCourse && !COURSE_PRESETS.includes(initialCourse));
  });
  const [customCourseInput, setCustomCourseInput] = useState<string>(() => {
    return initialCourse && !COURSE_PRESETS.includes(initialCourse) ? initialCourse : '';
  });

  // Sync if student data updates externally
  useEffect(() => {
    const val = student.course || student.studyYear;
    if (val) {
      setSelectedCourse(val);
      if (!COURSE_PRESETS.includes(val)) {
        setIsCustomCourse(true);
        setCustomCourseInput(val);
      } else {
        setIsCustomCourse(false);
      }
    }
  }, [student.course, student.studyYear]);

  // Handle course change
  const handleCourseChange = async (newCourseVal: string) => {
    if (newCourseVal === 'custom') {
      setIsCustomCourse(true);
      return;
    }
    setIsCustomCourse(false);
    setSelectedCourse(newCourseVal);
    const updatedStudent: BookingInquiry = {
      ...student,
      course: newCourseVal,
      studyYear: newCourseVal,
      photoUrl: photoDataUrl || student.photoUrl,
    };
    if (student.id) {
      try {
        await updateBookingInquiry(updatedStudent);
      } catch (err) {
        console.warn('Could not save course to Firestore:', err);
      }
    }
    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
  };

  const handleCustomCourseInput = async (newCustomVal: string) => {
    setCustomCourseInput(newCustomVal);
    setSelectedCourse(newCustomVal);
    const updatedStudent: BookingInquiry = {
      ...student,
      course: newCustomVal,
      studyYear: newCustomVal,
      photoUrl: photoDataUrl || student.photoUrl,
    };
    if (student.id) {
      try {
        await updateBookingInquiry(updatedStudent);
      } catch (err) {
        console.warn('Could not save custom course to Firestore:', err);
      }
    }
    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
  };

  // Accurate admission date resolution & clean Indian formatted date string (DD-MMM-YYYY)
  const admissionDateStr = useMemo(() => {
    const raw = student.checkInDate || (student as any).admissionDate || (student as any).entryDate || student.timestamp?.split('T')[0] || '';
    if (!raw || raw.toLowerCase() === 'immediately') {
      return '01-Aug-2026';
    }
    // Standard ISO YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      try {
        const [year, month, day] = raw.split('-');
        const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) {
        return raw;
      }
    }
    return raw;
  }, [student.checkInDate, (student as any).admissionDate, (student as any).entryDate, student.timestamp]);

  // Photo state with persistence in profile and local backup
  const storageKey = `hostel_student_photo_${student.id || student.phone}`;
  const [photoDataUrl, setPhotoDataUrl] = useState<string>(() => {
    if (student.photoUrl) return student.photoUrl;
    try {
      return localStorage.getItem(storageKey) || '';
    } catch {
      return '';
    }
  });

  // Keep state synced if student profile data updates externally
  useEffect(() => {
    if (student.photoUrl) {
      setPhotoDataUrl(student.photoUrl);
    } else {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) setPhotoDataUrl(saved);
      } catch (e) {
        // ignore
      }
    }
  }, [student.photoUrl, storageKey]);

  // Generate offline QR Code encoded with universal verification link
  useEffect(() => {
    let isMounted = true;
    setIsGeneratingQR(true);

    const effectiveStudent: BookingInquiry = {
      ...student,
      course: selectedCourse || student.course || student.studyYear,
      studyYear: selectedCourse || student.studyYear,
      photoUrl: photoDataUrl || student.photoUrl,
    };
    const qrData = getStudentQRData(effectiveStudent, config, 'text');

    // Direct synchronous-like render to canvas ref if DOM canvas is available
    if (qrCanvasRef.current) {
      drawQRCodeToCanvasElement(qrCanvasRef.current, qrData, {
        size: 260,
        margin: 8,
        dark: '#0f172a',
        light: '#ffffff',
        errorCorrectionLevel: 'M',
      })
        .then(url => {
          if (isMounted && url) {
            setQrDataUrl(url);
            setIsGeneratingQR(false);
          }
        })
        .catch(err => {
          console.warn('Direct canvas draw deferred to fallback:', err);
        });
    }

    // Universal data URL generator with automatic SVG / canvas fallback
    generateStudentQRCode(qrData, {
      width: 280,
      margin: 8,
      dark: '#0f172a',
      light: '#ffffff',
      errorCorrectionLevel: 'M',
    })
      .then(url => {
        if (isMounted && url) {
          setQrDataUrl(url);
          setIsGeneratingQR(false);
        }
      })
      .catch(err => {
        console.warn('generateStudentQRCode error:', err);
        if (isMounted) setIsGeneratingQR(false);
      });

    return () => {
      isMounted = false;
    };
  }, [student, config, selectedCourse, photoDataUrl]);

  // Handle Photo File Upload with hidden input and persist in student profile
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPG, PNG, or WebP).');
      setTimeout(() => setPhotoError(null), 4000);
      return;
    }

    // Check size limit (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Photo file size should be less than 5MB.');
      setTimeout(() => setPhotoError(null), 4000);
      return;
    }

    setIsSavingPhoto(true);
    setPhotoError(null);

    try {
      // 1. Client-side compression and optimization
      const compressedDataUrl = await compressAndOptimizePhoto(file);
      setPhotoDataUrl(compressedDataUrl);

      // 2. Persist locally for instant offline preview
      try {
        localStorage.setItem(storageKey, compressedDataUrl);
      } catch (err) {
        console.warn('Could not write to localStorage:', err);
      }

      // 3. Persist in Student's profile data & Firestore database
      const updatedStudent: BookingInquiry = {
        ...student,
        photoUrl: compressedDataUrl,
      };

      if (student.id) {
        try {
          await updateBookingInquiry(updatedStudent);
        } catch (dbErr) {
          console.warn('Firestore update warning (cached locally):', dbErr);
        }
      }

      // 4. Notify parent component to update memory state
      if (onUpdateStudent) {
        onUpdateStudent(updatedStudent);
      }

      setDownloadSuccess('Student photo successfully saved to profile!');
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch (err: any) {
      console.error('Photo processing failed:', err);
      setPhotoError(err.message || 'Failed to process student photo.');
      setTimeout(() => setPhotoError(null), 4000);
    } finally {
      setIsSavingPhoto(false);
      // Reset input value so same file can be re-selected if desired
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove photo from profile and local state
  const handleRemovePhoto = async () => {
    setIsSavingPhoto(true);
    try {
      setPhotoDataUrl('');
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}

      const updatedStudent: BookingInquiry = {
        ...student,
        photoUrl: '',
      };

      if (student.id) {
        try {
          await updateBookingInquiry(updatedStudent);
        } catch (dbErr) {
          console.warn('Firestore remove warning:', dbErr);
        }
      }

      if (onUpdateStudent) {
        onUpdateStudent(updatedStudent);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setDownloadSuccess('Student photo removed from profile.');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error('Error removing photo:', err);
    } finally {
      setIsSavingPhoto(false);
    }
  };

  // Download Single Side PNG (Front or Back)
  const handleDownloadPNG = async (side: 'front' | 'back') => {
    if (isDownloadLocked) {
      setPhotoError(`आई.डी. कार्ड डाउनलोड सीमा समाप्त हो चुकी है (${downloadCount}/${downloadLimit})। पुनः डाउनलोड करने हेतु ओनर से अनुमति का अनुरोध करें।`);
      setTimeout(() => setPhotoError(null), 5000);
      return;
    }

    setIsExporting(true);
    setExportType(side === 'front' ? 'png-front' : 'png-back');
    try {
      const effectiveStudent: BookingInquiry = {
        ...student,
        course: selectedCourse,
        studyYear: selectedCourse,
        photoUrl: photoDataUrl || student.photoUrl,
      };
      const canvas = await drawIdCardToCanvas(
        effectiveStudent, 
        config, 
        qrDataUrl || undefined, 
        photoDataUrl || undefined, 
        side,
        { includeQrCode, qrContentType: 'text' }
      );
      const dataUrl = canvas.toDataURL('image/png');
      const filename = `Hostel_ID_Card_${side.toUpperCase()}_${(student.fullName || 'Student').replace(/\s+/g, '_')}.png`;
      triggerFileDownload(dataUrl, filename);

      // Record successful download and decrement remaining quota
      await recordDownloadUsage();

      setDownloadSuccess(`HD ${side === 'front' ? 'Front' : 'Back'} Pass downloaded successfully!`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error(`Failed to export ${side} PNG ID card:`, err);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Download Full Official Double-Sided A4 PDF Pass
  const handleDownloadPDF = async () => {
    if (isDownloadLocked) {
      setPhotoError(`आई.डी. कार्ड डाउनलोड सीमा समाप्त हो चुकी है (${downloadCount}/${downloadLimit})। पुनः डाउनलोड करने हेतु ओनर से अनुमति का अनुरोध करें।`);
      setTimeout(() => setPhotoError(null), 5000);
      return;
    }

    setIsExporting(true);
    setExportType('pdf');
    try {
      const effectiveStudent: BookingInquiry = {
        ...student,
        course: selectedCourse,
        studyYear: selectedCourse,
        photoUrl: photoDataUrl || student.photoUrl,
      };
      const pdf = await generateIdCardPDF(
        effectiveStudent, 
        config, 
        photoDataUrl || undefined, 
        qrDataUrl || undefined,
        { includeQrCode, qrContentType: 'text' }
      );
      const studentNameSlug = (student.fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Hostel_ID_Card_${studentNameSlug}.pdf`;
      
      // Clean, single, robust download: Generate PDF Blob and download
      const blob = pdf.output('blob');
      triggerFileDownload(blob, filename);

      // Record successful download and decrement remaining quota
      await recordDownloadUsage();

      setDownloadSuccess('Student ID Card PDF downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err: any) {
      console.error('Failed to export PDF ID card:', err);
      // Resilient fallback: try generating with vector avatar and direct save
      try {
        const fallbackStudent: BookingInquiry = {
          ...student,
          course: selectedCourse,
          studyYear: selectedCourse,
        };
        const pdf = await generateIdCardPDF(fallbackStudent, config, undefined, qrDataUrl || undefined, { includeQrCode, qrContentType: 'text' });
        const studentNameSlug = (student.fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `Hostel_ID_Card_${studentNameSlug}.pdf`;
        pdf.save(filename);
        await recordDownloadUsage();
        setDownloadSuccess('Student ID Card PDF downloaded successfully!');
        setTimeout(() => setDownloadSuccess(null), 4000);
      } catch (fallbackErr) {
        setPhotoError('PDF download failed. Please try downloading HD PNG or use Print.');
        setTimeout(() => setPhotoError(null), 5000);
      }
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Print Active ID Pass Sheet
  const handlePrint = async () => {
    if (isDownloadLocked) {
      setPhotoError(`आई.डी. कार्ड डाउनलोड सीमा समाप्त हो चुकी है (${downloadCount}/${downloadLimit})। पुनः प्रिंट करने हेतु ओनर से अनुमति का अनुरोध करें।`);
      setTimeout(() => setPhotoError(null), 5000);
      return;
    }

    const title = config.hostelName || 'Modanwal Boys Hostel';
    if (cardRef.current) {
      printDocumentSheet(`${title} Resident Smart Pass - ${student.fullName}`, cardRef.current);
    } else {
      window.print();
    }
    await recordDownloadUsage();
  };

  const hostelTitle = config.hostelName || 'Modanwal Boys Hostel';
  const studentUid = `MBH-2026-${(student.id || student.phone || '101').replace(/[^0-9]/g, '').slice(-5)}`;

  return (
    <div className="space-y-6">
      
      {/* Hidden File Input Linked to Buttons */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/webp"
        onChange={handlePhotoSelect}
        className="hidden"
        id="student-id-photo-input"
        aria-label="Upload student portrait photo"
      />

      {/* ID Card Download Quota & Permission Alert Banner */}
      {isDownloadLocked ? (
        <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm space-y-3.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-black text-sm sm:text-base text-slate-900">
                    आई.डी. कार्ड डाउनलोड सीमा समाप्त (Download Limit Reached)
                  </h3>
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-rose-200">
                    {downloadCount}/{downloadLimit} उपयोग
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  सुरक्षा नियमों के अनुसार आपका ID कार्ड केवल <strong>{downloadLimit} बार</strong> डाउनलोड किया जा सकता है। आप अपने सभी <strong>{downloadCount}</strong> डाउनलोड उपयोग कर चुके हैं। पुनः डाउनलोड करने हेतु ओनर से अनुमति का अनुरोध करें। ओनर द्वारा अप्रूव करते ही आप दोबारा 1 बार डाउनलोड कर सकेंगे।
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-amber-200/80">
            {hasRequestedPermission ? (
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-3.5 py-2 rounded-xl text-xs font-black border border-amber-300">
                <Clock className="w-4 h-4 text-amber-700 animate-pulse shrink-0" />
                <span>⏳ ओनर को अनुमति का अनुरोध भेजा गया है ({student.idCardPermissionRequestedAt || 'प्रतीक्षाधीन'})। ओनर के अप्रूव करते ही आपका कार्ड अनलॉक हो जाएगा।</span>
              </div>
            ) : (
              <button
                type="button"
                id="btn-request-owner-permission"
                onClick={handleRequestOwnerPermission}
                disabled={isRequestingPermission}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRequestingPermission ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <Key className="w-4 h-4 text-amber-400" />
                )}
                <span>🙋‍♂️ ओनर से दोबारा डाउनलोड की अनुमति मांगें (Request Permission)</span>
              </button>
            )}

            {config.phone && (
              <a
                href={`https://wa.me/${config.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `नमस्ते ओनर सर! मुझे अपने स्टूडेंट ID कार्ड को दोबारा डाउनलोड करने की अनुमति चाहिए।\nछात्र: ${student.fullName}\nकमरा नंबर: ${student.roomNumber || 'N/A'}\nकृपया ओनर पोर्टल से 'Approve +1 Download' करें। धन्यवाद!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>ओनर को WhatsApp पर बताएं</span>
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">
              ID कार्ड डाउनलोड कोटा: <strong className="font-black text-emerald-800">{downloadLimit - downloadCount} डाउनलोड शेष</strong> (कुल सीमा: {downloadLimit} बार, प्रयुक्त: {downloadCount})
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">
            * 1 बार डाउनलोड के पश्चात दोबारा डाउनलोड के लिए ओनर की अनुमति अनिवार्य होगी।
          </span>
        </div>
      )}

      {/* Action Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Campus Student Smart Pass (सत्यापित डिजिटल आई.डी. कार्ड)</span>
          </div>
          <h2 className="text-xl font-display font-black text-slate-900">
            Resident Identity & Gate Access Card
          </h2>
          <p className="text-xs text-slate-500">
            Official CR-80 format pass with biometric photo, academic course badge, scannable student verification QR code, and gate clearance.
          </p>
        </div>

        {/* Download & Print Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Download PDF Button */}
          <button
            type="button"
            id="btn-download-smart-id-pdf"
            onClick={handleDownloadPDF}
            disabled={isExporting || isDownloadLocked}
            className={`px-4 py-2.5 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 ${
              isDownloadLocked
                ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 text-white cursor-pointer disabled:opacity-50'
            }`}
            title={isDownloadLocked ? 'डाउनलोड सीमा समाप्त - ओनर से अनुमति प्राप्त करें' : 'Download printable A4 sheet with Front and Back sides'}
          >
            {isExporting && exportType === 'pdf' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Generating PDF...</span>
              </>
            ) : isDownloadLocked ? (
              <>
                <Lock className="w-4 h-4 text-slate-400" />
                <span>Download PDF (Locked)</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Download PDF (A4 शीट)</span>
              </>
            )}
          </button>

          {/* Download PNG Button */}
          <button
            type="button"
            id="btn-download-smart-id-png"
            onClick={() => handleDownloadPNG(activeSide)}
            disabled={isExporting || isDownloadLocked}
            className={`px-3.5 py-2.5 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 ${
              isDownloadLocked
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white cursor-pointer disabled:opacity-50'
            }`}
            title={isDownloadLocked ? 'डाउनलोड सीमा समाप्त - ओनर से अनुमति प्राप्त करें' : `Download ${activeSide} pass as high-res PNG image`}
          >
            {isExporting && exportType?.startsWith('png') ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : isDownloadLocked ? (
              <Lock className="w-4 h-4 text-slate-400" />
            ) : (
              <Download className="w-4 h-4 text-emerald-400" />
            )}
            <span>HD PNG ({activeSide === 'front' ? 'Front' : 'Back'})</span>
          </button>

          {/* Direct Print Button */}
          <button
            type="button"
            id="btn-print-smart-id-pass"
            onClick={handlePrint}
            disabled={isDownloadLocked}
            className={`px-3.5 py-2.5 font-bold text-xs rounded-xl border transition-colors flex items-center gap-2 ${
              isDownloadLocked
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 cursor-pointer'
            }`}
            title={isDownloadLocked ? 'डाउनलोड सीमा समाप्त - ओनर से अनुमति प्राप्त करें' : 'Print ID card immediately'}
          >
            {isDownloadLocked ? (
              <Lock className="w-4 h-4 text-slate-400" />
            ) : (
              <Printer className="w-4 h-4 text-slate-700" />
            )}
            <span>Print Pass (प्रिंट करें)</span>
          </button>
        </div>
      </div>

      {/* Photo Upload & Student Profile Persistence Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-3xl border border-indigo-900 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 relative">
              <Camera className="w-6 h-6 text-amber-400" />
              {photoDataUrl && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                  ✓
                </span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm text-white flex items-center gap-2 flex-wrap">
                <span>विद्यार्थी फोटो प्रबंधन (Student Passport Photo)</span>
                {photoDataUrl ? (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Photo Synced with ID & PDF
                  </span>
                ) : (
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Photo Recommended
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Upload your portrait to print it directly onto your official ID card and PDF gate pass.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* User-Friendly Photo Upload Button linked to hidden file input */}
            <button
              type="button"
              id="btn-upload-student-photo"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSavingPhoto}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSavingPhoto ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Saving Photo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{photoDataUrl ? 'Change Photo (फोटो बदलें)' : 'Upload Photo (फोटो लगाएं)'}</span>
                </>
              )}
            </button>

            {photoDataUrl && (
              <button
                type="button"
                id="btn-remove-student-photo"
                onClick={handleRemovePhoto}
                disabled={isSavingPhoto}
                className="px-3 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Remove photo and reset to initials"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {photoError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{photoError}</span>
        </div>
      )}

      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Course Option Selector Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-indigo-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>विद्यार्थी कोर्स विकल्प (Student Academic Course)</span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                Card & PDF Sync
              </span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Select or type your course to update your Digital ID Card & Official PDF Pass.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Course Dropdown */}
          <select
            id="select-student-course"
            value={isCustomCourse ? 'custom' : selectedCourse}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer flex-1 md:flex-initial"
          >
            {COURSE_PRESETS.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
            <option value="custom">✏️ Other / Custom Course (अन्य कोर्स)...</option>
          </select>

          {isCustomCourse && (
            <div className="flex items-center gap-1.5 w-full md:w-auto">
              <input
                type="text"
                id="input-custom-course"
                value={customCourseInput}
                onChange={(e) => handleCustomCourseInput(e.target.value)}
                placeholder="Type course name (e.g. B.Tech CSE)"
                className="px-3 py-2 text-xs border border-indigo-300 rounded-xl text-slate-900 bg-indigo-50/40 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-bold flex-1 md:w-56"
              />
            </div>
          )}
        </div>
      </div>

      {/* Front / Back Side View Switcher */}
      <div className="flex items-center justify-center gap-3">
        <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1 shadow-inner">
          <button
            type="button"
            id="tab-view-front-card"
            onClick={() => setActiveSide('front')}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSide === 'front'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Front Side (Photo & Details)</span>
          </button>

          <button
            type="button"
            id="tab-view-back-card"
            onClick={() => setActiveSide('back')}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSide === 'back'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Back Side (Rules)</span>
          </button>
        </div>
      </div>

      {/* Interactive Renderable ID Card Canvas Container */}
      <div className="flex justify-center p-2 sm:p-4">
        <div 
          ref={cardRef}
          id="id-card-print-area"
          className="w-full max-w-lg bg-white rounded-3xl overflow-hidden border-2 border-slate-900 shadow-2xl text-slate-900 font-sans relative transition-all"
          style={{ minHeight: '560px' }}
        >
          {/* ============================================================= */}
          {/* CLEAN MODERN INSET BORDER & PRECISION CORNER ACCENTS           */}
          {/* ============================================================= */}
          <div className="absolute inset-2 sm:inset-3 border border-slate-200/90 rounded-[22px] pointer-events-none z-20">
            {/* Top-Left Corner Modern Accent */}
            <div className="absolute -top-[1.5px] -left-[1.5px] w-3.5 h-3.5 border-t-2 border-l-2 border-indigo-600 rounded-tl-sm" />
            {/* Top-Right Corner Modern Accent */}
            <div className="absolute -top-[1.5px] -right-[1.5px] w-3.5 h-3.5 border-t-2 border-r-2 border-indigo-600 rounded-tr-sm" />
            {/* Bottom-Left Corner Modern Accent */}
            <div className="absolute -bottom-[1.5px] -left-[1.5px] w-3.5 h-3.5 border-b-2 border-l-2 border-indigo-600 rounded-bl-sm" />
            {/* Bottom-Right Corner Modern Accent */}
            <div className="absolute -bottom-[1.5px] -right-[1.5px] w-3.5 h-3.5 border-b-2 border-r-2 border-indigo-600 rounded-br-sm" />
          </div>

          {activeSide === 'front' ? (
            /* ============================================================= */
            /* FRONT VIEW: CLEAN MODERN SMART RESIDENT ID PASS               */
            /* ============================================================= */
            <div className="bg-slate-50">
              {/* Card Top Header Band (Deep Executive Slate-Navy) */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white pt-5 pb-3.5 px-5 sm:px-6 relative border-b-4 border-indigo-600">
                
                {/* Lanyard Slot Punch Hole (Top Center) */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-3.5 bg-slate-950 rounded-full border-2 border-slate-700 shadow-inner flex items-center justify-center">
                  <div className="w-16 h-1 bg-slate-800 rounded-full" />
                </div>

                {/* Institution Title & Pass Metadata Header */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 to-indigo-700/40 border border-indigo-400/40 flex items-center justify-center shrink-0 shadow-sm">
                      <Building2 className="w-5 h-5 text-indigo-200" />
                    </div>
                    <div>
                      <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white uppercase block leading-tight">
                        {hostelTitle}
                      </span>
                      <p className="text-[10.5px] text-amber-300 font-bold tracking-wide flex items-center gap-1.5">
                        <span>मोदनवाल ब्वायज हॉस्टल</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-300">तिंदोला, बाराबंकी</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 self-start sm:self-auto">
                    <span className="text-[11px] font-black text-indigo-200 uppercase tracking-wider block bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-400/30">
                      Resident ID Pass
                    </span>
                    <span className="text-[9.5px] font-semibold text-slate-300 block mt-0.5">
                      Session 2026-27
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9.5px] text-slate-300 pt-1.5 border-t border-slate-800 font-medium">
                  <span>Helpline: <strong className="text-white font-bold">{config.phone || '+91 99361 80282'}</strong></span>
                  <span className="text-indigo-300 font-bold uppercase tracking-wider">Tindola, Barabanki (U.P.)</span>
                </div>
              </div>

              {/* Profile Photo & Student Details */}
              <div className="p-5 sm:p-6 space-y-4 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/60 relative">
                
                {/* Header Identity Row: Profile Photo + Primary Information */}
                <div className="flex items-start gap-4 sm:gap-6">
                  {/* Dedicated Prominent Profile Photo Frame */}
                  <div className="relative group shrink-0">
                    {/* Modern Precision Double Bezel with Elegant Shadow */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative p-[3px] rounded-2xl bg-gradient-to-b from-slate-200 via-indigo-100 to-slate-300 shadow-md ring-1 ring-slate-900/10 cursor-pointer transition-transform duration-200 active:scale-95 hover:shadow-lg"
                      title={photoDataUrl ? "Click to change student photo" : "Click to upload student photo"}
                    >
                      {/* Inner Dark Precision Bezel */}
                      <div className="p-[2px] bg-slate-950 rounded-[14px]">
                        {/* Crisp Photo Viewport - Prominent Frame with 3:4 aspect ratio */}
                        <div className="w-28 sm:w-34 h-38 sm:h-44 rounded-[12px] overflow-hidden bg-slate-100 relative flex items-center justify-center">
                          {photoDataUrl ? (
                            <>
                              <img 
                                src={photoDataUrl} 
                                alt={student.fullName}
                                className="w-full h-full object-cover object-top transition-all duration-300 group-hover:scale-105"
                                style={{
                                  imageRendering: '-webkit-optimize-contrast',
                                  filter: 'contrast(1.03) saturate(1.02)'
                                }}
                              />
                              {/* Hover Action Overlay */}
                              <div className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold backdrop-blur-[1px]">
                                <Camera className="w-5 h-5 mb-0.5 text-indigo-300" />
                                <span>Change Photo</span>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white flex flex-col items-center justify-center p-2 text-center relative group-hover:bg-slate-900 transition-colors">
                              <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center mb-1 text-indigo-300 font-black text-2xl font-display">
                                {student.fullName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wide flex items-center gap-1">
                                <Camera className="w-3 h-3" /> Add Photo
                              </span>
                              <span className="text-[8px] text-slate-400 mt-0.5">Passport Size</span>
                              <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                                <Upload className="w-5 h-5 mb-0.5 text-indigo-300" />
                                <span>Upload Now</span>
                              </div>
                            </div>
                          )}

                          {/* Technical Corner Registration Notches (4 corners) */}
                          <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
                          <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
                          <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
                          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

                          {/* Dedicated Photo Verified Watermark Tag on Photo Frame */}
                          <div className="absolute bottom-1.5 inset-x-2 bg-slate-950/90 backdrop-blur-xs py-0.5 px-1 rounded-full border border-indigo-400/40 flex items-center justify-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            <span className="text-[7.5px] font-black tracking-wider text-amber-300 uppercase">
                              Photo Verified
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Camera quick upload badge button (hidden during print) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="absolute -bottom-1 -right-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white p-1.5 rounded-full shadow-lg cursor-pointer border-2 border-white ring-1 ring-slate-900/20 print:hidden"
                      title="Upload / change photo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Student Header info with RFID & Primary Details */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    
                    {/* Header Badges: Resident Pass & RFID */}
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-900 text-[9.5px] font-black px-2.5 py-0.5 rounded-md uppercase">
                        <BadgeCheck className="w-3 h-3 text-indigo-600" />
                        <span>Resident Pass</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                        <Wifi className="w-3.5 h-3.5 text-indigo-600 rotate-90" />
                        <span>RFID PASS</span>
                      </div>
                    </div>

                    {/* Full Name */}
                    <h3 className="font-display font-black text-xl sm:text-2xl text-slate-900 truncate tracking-tight">
                      {student.fullName}
                    </h3>
                    
                    {/* Father's Name */}
                    <div className="text-xs sm:text-sm text-slate-700 font-semibold truncate flex items-center gap-1.5">
                      <span className="text-slate-400 font-medium text-[11px]">S/o:</span>
                      <strong className="text-slate-900 font-bold">
                        {student.fatherName || student.guardianName || 'Guardian on Record'}
                      </strong>
                    </div>

                    {/* Course Badge */}
                    <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md max-w-full">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">Course: {selectedCourse}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[11px] text-indigo-950 font-mono font-black bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        UID: {studentUid}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Active Resident</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Structured 6-Tile Information Grid (Organized in clear cards) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-white p-3.5 rounded-2xl border border-slate-200/90 text-xs shadow-xs">
                  
                  {/* Grid Item 1: Father's Name */}
                  <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                      <User className="w-2.5 h-2.5 text-indigo-500" />
                      <span>Father's Name (पिता)</span>
                    </div>
                    <span className="font-bold text-slate-900 text-xs block truncate mt-0.5" title={student.fatherName || student.guardianName || 'On Record'}>
                      {student.fatherName || student.guardianName || 'On Record'}
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-medium">
                      Parent / Guardian
                    </span>
                  </div>

                  {/* Grid Item 2: Room Allotment */}
                  <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                      <Building2 className="w-2.5 h-2.5 text-indigo-500" />
                      <span>Room Allotment (कमरा)</span>
                    </div>
                    <span className="font-black text-indigo-950 text-sm font-mono block mt-0.5">
                      Room {student.roomNumber || '101'}
                    </span>
                    <span className="text-[9.5px] text-indigo-600 font-bold capitalize">
                      {student.roomType === 'single' ? 'Single AC (1-Seater)' : 'Twin AC (2-Seater)'}
                    </span>
                  </div>

                  {/* Grid Item 3: Course / Branch */}
                  <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                      <GraduationCap className="w-2.5 h-2.5 text-indigo-500" />
                      <span>Course (पाठ्यक्रम)</span>
                    </div>
                    <span className="font-bold text-indigo-950 block truncate text-xs mt-0.5" title={selectedCourse}>
                      {selectedCourse}
                    </span>
                    <span className="text-[9.5px] text-indigo-600 font-medium">
                      Hostel Resident
                    </span>
                  </div>

                  {/* Grid Item 4: Entry Date (Accurately reflecting admission date) */}
                  <div className="p-2 rounded-xl bg-indigo-50/50 border border-indigo-100/80">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-indigo-600 uppercase">
                      <Calendar className="w-2.5 h-2.5 text-indigo-600" />
                      <span>Entry Date (प्रवेश तिथि)</span>
                    </div>
                    <span className="font-black text-slate-900 block font-mono text-xs mt-0.5">
                      {admissionDateStr}
                    </span>
                    <span className="text-[9.5px] text-emerald-700 font-extrabold flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Admission Record</span>
                    </span>
                  </div>

                  {/* Grid Item 5: Resident Mobile */}
                  <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                      <Phone className="w-2.5 h-2.5 text-indigo-500" />
                      <span>Resident Mobile (मोबाइल)</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono block text-xs mt-0.5">
                      {student.phone || 'N/A'}
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-medium">
                      Primary Contact
                    </span>
                  </div>

                  {/* Grid Item 6: Emergency Contact */}
                  <div className="p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                      <Phone className="w-2.5 h-2.5 text-rose-500" />
                      <span>Emergency No. (आपातकालीन)</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono block text-xs mt-0.5">
                      {student.parentPhone || student.guardianPhone || config.phone || 'On Record'}
                    </span>
                    <span className="text-[9.5px] text-slate-500 font-medium">
                      Parent / Guardian
                    </span>
                  </div>

                </div>

                {/* Verification & Safety Assurance Strip */}
                <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-emerald-50/90 border border-emerald-200/80">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-[10.5px] font-extrabold text-emerald-900 truncate">
                      ✓ OFFICIAL RESIDENT IDENTITY CARD • MODANWAL BOYS HOSTEL
                    </span>
                  </div>
                  <div className="text-[9.5px] font-black text-slate-700 font-mono shrink-0 hidden sm:block">
                    Helpline: {config.phone || '+91 9839631889'}
                  </div>
                </div>

              </div>

              {/* Bottom Code 128 Barcode & Warden Signature Strip */}
              <div className="bg-slate-950 text-white px-5 py-3 flex items-center justify-between border-t border-slate-800">
                {/* Barcode representation */}
                <div>
                  <div className="h-6 flex items-center gap-0.5">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1].map((w, idx) => (
                      <div 
                        key={idx} 
                        style={{ width: `${w * 1.5}px` }} 
                        className={`h-full ${idx % 2 === 0 ? 'bg-white' : 'bg-transparent'}`} 
                      />
                    ))}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                    *{studentUid}*
                  </div>
                </div>

                {/* Center location tag */}
                <div className="hidden sm:block text-center text-[9px] text-slate-400 font-medium">
                  <span>Tindola, Barabanki (U.P.)</span>
                </div>

                {/* Warden Signature Stamp (No Authorization Badge) */}
                <div className="text-right">
                  <div className="text-sky-300 font-serif italic text-xs">
                    Hostel Warden
                  </div>
                  <div className="text-[8px] font-bold text-slate-300 uppercase">
                    Warden / Management (वार्डन)
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================= */
            /* BACK VIEW: RULES, EMERGENCY NUMBERS & HELPLINE                */
            /* ============================================================= */
            <div className="bg-slate-50 text-slate-900">
              
              {/* Magnetic Swipe Stripe */}
              <div className="bg-slate-950 h-12 w-full flex items-center justify-between px-5 relative">
                <div className="w-24 h-3 bg-slate-900 rounded-full border border-slate-700" />
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  MAGNETIC STRIPE / NFC PASS
                </span>
              </div>

              <div className="p-6 space-y-4 text-xs">
                
                {/* Header title */}
                <div className="border-b border-slate-200 pb-2">
                  <h3 className="font-display font-black text-sm text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-700" />
                    <span>Hostel Code of Conduct & Resident Guidelines</span>
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    मोदनवाल ब्वायज हॉस्टल • महत्वपूर्ण नियम एवं सुरक्षा निर्देश
                  </p>
                </div>

                {/* 3 Essential Rules */}
                <div className="space-y-2 text-[11px] text-slate-700">
                  <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">1. Gate Curfew (10:30 PM):</strong>
                      <p className="text-[10px] text-slate-500 mt-0.5">Main entrance gate closes strictly at 10:30 PM. Late entry requires prior warden clearance.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <Flame className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">2. Prohibited Substances & Appliances:</strong>
                      <p className="text-[10px] text-slate-500 mt-0.5">Smoking, alcohol, immersion heater rods, and induction cooktops are strictly banned.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <Key className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">3. Non-Transferable ID Pass:</strong>
                      <p className="text-[10px] text-slate-500 mt-0.5">This card belongs exclusively to the student resident. Must be shown upon security request.</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Directory */}
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 space-y-1.5">
                  <h4 className="font-extrabold text-[11px] text-amber-950 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-700" />
                    <span>24/7 Emergency Directory</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-500">Hostel Warden:</span>
                      <strong className="block text-slate-900 font-mono">{config.phone || '+91 9839631889'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Police Emergency:</span>
                      <strong className="block text-slate-900 font-mono text-indigo-950">112</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Medical Ambulance:</span>
                      <strong className="block text-slate-900 font-mono text-indigo-950">108</strong>
                    </div>
                  </div>
                </div>

                {/* Permanent Residence & Return Address (No SRMU) */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-[10px] space-y-1">
                  <span className="font-extrabold text-slate-900 block">Permanent Residence:</span>
                  <p className="text-slate-600 truncate">
                    {student.hometown || 'Uttar Pradesh (Home District on Record)'} • Phone: {student.phone}
                  </p>
                  <p className="text-rose-700 font-bold pt-1 border-t border-slate-100">
                    If found, please return to: Modanwal Boys Hostel, Tindola, Barabanki (U.P.) - 225003
                  </p>
                </div>

              </div>

              {/* Bottom Card Strip with Entry Date */}
              <div className="bg-slate-900 text-slate-400 py-2.5 px-4 text-center text-[9px] font-mono">
                Property of Modanwal Boys Hostel • Entry Date: {admissionDateStr} • UID: {studentUid}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

