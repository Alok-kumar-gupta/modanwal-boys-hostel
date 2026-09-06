import React, { useEffect, useRef, useState } from 'react';
import { BookingInquiry, HostelConfig } from '../types';
import { 
  buildStudentVerificationUrl, 
  buildStudentVerificationQRText,
  getStudentQRData,
  drawStudentQRCodeToCanvas,
  drawQRCodeToContext,
  getQRMatrix,
  QRCodeDrawOptions 
} from '../lib/verificationUtil';
import { ExternalLink, CheckCircle2, ShieldCheck } from 'lucide-react';
import qrcodeGen from 'qrcode-generator';

export interface StudentQRCodeCanvasProps {
  student: BookingInquiry;
  config: HostelConfig;
  size?: number;
  className?: string;
  options?: QRCodeDrawOptions;
  showScanBadge?: boolean;
  showExternalLink?: boolean;
  mode?: 'text' | 'url';
  onGenerated?: (dataUrl: string) => void;
}

/**
 * Canvas-based Student Verification QR Code Component.
 * 
 * Renders directly onto an HTML5 <canvas> element using raw bit matrix pixels.
 * Uses Direct Offline Verified Text by default to ensure scanning on ANY mobile
 * phone camera displays student details instantly without opening AI Studio.
 */
export const StudentQRCodeCanvas: React.FC<StudentQRCodeCanvasProps> = ({
  student,
  config,
  size = 240,
  className = '',
  options,
  showScanBadge = false,
  showExternalLink = true,
  mode = 'text',
  onGenerated,
}) => {
  const effectiveMode: 'text' | 'url' = mode === 'url' ? 'url' : 'text';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>(() => {
    try {
      const qrData = getStudentQRData(student, config, effectiveMode);
      const qr = (typeof qrcodeGen === 'function' ? qrcodeGen : (qrcodeGen as any)?.default || qrcodeGen)(
        0,
        options?.errorCorrectionLevel || 'M'
      );
      qr.addData(qrData);
      qr.make();
      return qr.createDataURL(4, options?.margin !== undefined ? options.margin : 2);
    } catch (e) {
      return '';
    }
  });

  const qrDataContent = getStudentQRData(student, config, effectiveMode);
  const verificationUrl = buildStudentVerificationUrl(student, config);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isMounted = true;

    const render = async () => {
      try {
        const url = await drawStudentQRCodeToCanvas(canvas, student, config, {
          size,
          margin: options?.margin !== undefined ? options.margin : 6,
          dark: options?.dark || '#0f172a',
          light: options?.light || '#ffffff',
          errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
          mode: effectiveMode,
        });

        if (isMounted && url) {
          setDataUrl(url);
          if (onGenerated) {
            onGenerated(url);
          }
        }
      } catch (err) {
        console.warn('StudentQRCodeCanvas render error:', err);
      }
    };

    render();

    return () => {
      isMounted = false;
    };
  }, [
    student.id,
    student.phone,
    student.fullName,
    student.roomNumber,
    student.course,
    student.checkInDate,
    student.fatherName,
    config.hostelName,
    config.phone,
    size,
    effectiveMode,
    options?.dark,
    options?.light,
    options?.margin,
    options?.errorCorrectionLevel,
  ]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative bg-white p-1.5 rounded-xl border-2 border-slate-900/20 shadow-xs flex items-center justify-center">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="Student Verification QR Code"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain block select-none"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain block select-none"
          />
        )}
        {/* Hidden canvas to ensure canvas rendering & export pipelines stay active */}
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {showScanBadge && (
        <div className="mt-1.5 text-center">
          <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-emerald-700">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>✓ SCAN TO VERIFY PASS</span>
          </div>
          {showExternalLink && mode === 'url' && (
            <a
              href={verificationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[8.5px] font-extrabold text-indigo-600 hover:text-indigo-800 hover:underline mt-0.5"
            >
              <ExternalLink className="w-2.5 h-2.5" />
              <span>Verify Profile</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};
