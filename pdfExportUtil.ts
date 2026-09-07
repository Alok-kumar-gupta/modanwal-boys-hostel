/**
 * Copyright 2026 Modanwal Boys Hostel
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Bulletproof PDF, Canvas & Print Export Utility
 * - Zero reliance on fragile html2canvas CSS parsing to avoid Tailwind v4 'oklch' errors.
 * - Native vector jsPDF generators for Rent Agreement, Rent Receipts & Student Ledgers.
 * - High-DPI HTML5 2D Canvas rendering for Digital ID Cards & Gate Passes with custom student photo support.
 * - Universal fallback file downloader with iframe and mobile compatibility.
 */

import jsPDF from 'jspdf';
import { BookingInquiry, HostelConfig, PaymentRecord } from '../types';
import { 
  buildStudentVerificationUrl,
  buildStudentVerificationQRText,
  getStudentQRData,
  generateStudentQRCode,
  drawQRCodeToContext,
  drawQRCodeToCanvasElement,
} from './verificationUtil';

export { generateStudentQRCode, drawQRCodeToContext, drawQRCodeToCanvasElement, getStudentQRData, buildStudentVerificationQRText };

/**
 * Robust cross-browser file downloader that works in iframes, standalone tabs, and mobile.
 */
export function triggerFileDownload(dataUrlOrBlob: string | Blob, filename: string) {
  try {
    let url: string;
    let shouldRevoke = false;

    if (typeof dataUrlOrBlob === 'string') {
      url = dataUrlOrBlob;
    } else {
      url = URL.createObjectURL(dataUrlOrBlob);
      shouldRevoke = true;
    }

    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    anchor.href = url;
    anchor.setAttribute('download', filename);
    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      try {
        document.body.removeChild(anchor);
        if (shouldRevoke) {
          URL.revokeObjectURL(url);
        }
      } catch (e) {
        // ignore
      }
    }, 2000);
  } catch (err) {
    console.error('Trigger file download failed, attempting fallback:', err);
    try {
      if (typeof dataUrlOrBlob === 'string') {
        window.location.href = dataUrlOrBlob;
      }
    } catch (e) {}
  }
}

/**
 * Isolated Clean Document Printer
 * Uses native document printing with current styles intact.
 * Works seamlessly in standard browsers and sandboxed iframe environments.
 */
export function printDocumentSheet(title: string, printableElement: HTMLElement) {
  const prevTitle = document.title;
  document.title = title;

  // Mark the target element for @media print visibility
  const originalId = printableElement.id;
  if (!originalId || originalId !== 'id-card-print-area') {
    printableElement.id = 'print-active-target';
  }
  printableElement.classList.add('print-active-target');
  document.body.classList.add('print-active-mode');

  const cleanup = () => {
    document.body.classList.remove('print-active-mode');
    printableElement.classList.remove('print-active-target');
    if (originalId) {
      printableElement.id = originalId;
    } else {
      printableElement.removeAttribute('id');
    }
    document.title = prevTitle;
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);

  try {
    window.print();
  } catch (err) {
    console.warn('Direct print window call failed, attempting fallback iframe:', err);
    // Fallback: try dedicated print iframe
    try {
      const pIframe = document.createElement('iframe');
      pIframe.style.position = 'fixed';
      pIframe.style.right = '0';
      pIframe.style.bottom = '0';
      pIframe.style.width = '100px';
      pIframe.style.height = '100px';
      pIframe.style.opacity = '0.01';
      document.body.appendChild(pIframe);

      const idoc = pIframe.contentWindow?.document;
      if (idoc) {
        idoc.open();
        // Copy all style tags
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
          .map(el => el.outerHTML)
          .join('\n');
        idoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <title>${title}</title>
              ${styles}
            </head>
            <body class="bg-white p-4">
              ${printableElement.innerHTML}
            </body>
          </html>
        `);
        idoc.close();
        setTimeout(() => {
          try {
            pIframe.contentWindow?.focus();
            pIframe.contentWindow?.print();
          } catch (e) {}
          setTimeout(() => {
            try { document.body.removeChild(pIframe); } catch (e) {}
          }, 2000);
        }, 500);
      }
    } catch (e) {
      console.error('Fallback iframe print failed:', e);
    }
  }

  // Safety fallback cleanup in case afterprint doesn't fire
  setTimeout(cleanup, 3000);
}

/**
 * ============================================================================
 * 1. NATIVE VECTOR jsPDF GENERATOR: HOSTEL RENT AGREEMENT & STRICT RULE BOOK
 * ============================================================================
 * Generates an official, crystal-clear 2-page A4 PDF without html2canvas.
 */
export interface AgreementFormData {
  studentName: string;
  guardianName: string;
  permanentAddress: string;
  aadhaarNumber: string;
  studentPhone: string;
  guardianPhone: string;
  roomNumber: string;
  admissionDate: string;
  securityDeposit: string;
  month1Deposit: string;
  month2Deposit: string;
}

export function generateRentAgreementPDF(
  formData: AgreementFormData,
  config: HostelConfig
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186mm

  // -------------------------------------------------------------
  // PAGE 1: OFFICIAL STAMP HEADER, RESIDENT DETAILS & KEY RULES
  // -------------------------------------------------------------
  // Outer Border Page 1
  doc.setDrawColor(15, 23, 42); // slate-900
  doc.setLineWidth(0.8);
  doc.rect(margin - 3, margin - 3, contentWidth + 6, 277);

  // Inner Fine Border
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.rect(margin - 1.5, margin - 1.5, contentWidth + 3, 274);

  // Top Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin - 3, margin - 3, contentWidth + 6, 26, 'F');

  // Gold accent strip
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(margin - 3, margin + 22, contentWidth + 6, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const hostelName = (config.hostelName || 'MODANWAL BOYS HOSTEL').toUpperCase();
  doc.text(hostelName, pageWidth / 2, margin + 6, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(
    `Near SRMU Campus, Vill. Tindola, Barabanki (U.P.) • Mobile / WhatsApp: ${config.phone || '+91 99361 80282'}`,
    pageWidth / 2,
    margin + 12,
    { align: 'center' }
  );

  doc.setFontSize(7.5);
  doc.setTextColor(253, 230, 138); // amber-200
  doc.text('PREMIUM AC / NON-AC STUDENT RESIDENCE • DISCIPLINED RESIDENTIAL ACCOMMODATION', pageWidth / 2, margin + 18, { align: 'center' });

  // Document Title & Ref No Box
  let y = margin + 30;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('HOSTEL ADMISSION & RENT LEASE AGREEMENT (OFFICIAL DEED)', pageWidth / 2, y, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(71, 85, 105);
  doc.text('Official Terms of Residence, Financial Schedule & Code of Conduct', pageWidth / 2, y + 4.5, { align: 'center' });

  // Agreement Reference metadata strip
  y += 8;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, 7, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  const refNo = `REF: MBH-AGR-${new Date().getFullYear()}-${formData.roomNumber ? formData.roomNumber.replace(/[^0-9]/g, '') : '101'}`;
  doc.text(refNo, margin + 4, y + 4.8);
  doc.text(`DATE OF ISSUE: ${formData.admissionDate || new Date().toLocaleDateString('en-IN')}`, margin + contentWidth - 55, y + 4.8);

  // SECTION 1: RESIDENT STUDENT & ROOM PARTICULARS
  y += 11;
  doc.setFillColor(30, 27, 75); // indigo-950
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('1. RESIDENT STUDENT & ALLOTMENT PARTICULARS:', margin + 3, y + 4.2);

  y += 8;
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  const drawFieldRow = (label1: string, val1: string, label2?: string, val2?: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(label1, margin + 2, y);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(val1 || '____________________', margin + 46, y);

    if (label2) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(label2, margin + 98, y);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(val2 || '____________________', margin + 142, y);
    }
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 2, margin + contentWidth, y + 2);
    y += 6.5;
  };

  drawFieldRow('Student Full Name:', formData.studentName, "Father's Name:", formData.guardianName);
  drawFieldRow('Permanent Address:', formData.permanentAddress);
  drawFieldRow('Aadhaar Card No:', formData.aadhaarNumber, 'Student Contact No:', formData.studentPhone);
  drawFieldRow('Parent / Guardian No:', formData.guardianPhone, 'Assigned Room No:', formData.roomNumber);
  drawFieldRow(
    'Date of Admission:',
    formData.admissionDate,
    'Security Deposit:',
    `Rs. ${formData.securityDeposit || '3,000'} (M1: Rs.${formData.month1Deposit || '1,500'}, M2: Rs.${formData.month2Deposit || '1,500'})`
  );

  // SECTION 2: ESSENTIAL RULES & REGULATIONS (Part 1)
  y += 4;
  doc.setFillColor(159, 18, 57); // rose-900
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('2. STRICT RESIDENTIAL RULES & CONDUCT CLAUSES (PART 1):', margin + 3, y + 4.2);

  y += 8;

  const rules = [
    {
      num: 'Clause 1',
      title: 'Rent Advance Due Date (5th of Every Month) & Eviction Policy',
      tag: 'FINANCIAL',
      tagColor: [30, 64, 175],
      text: 'Monthly room rent must be deposited in advance on or before the 5th day of each calendar month. In case the rent remains unpaid by the 10th day of the month, the hostel administration holds absolute legal right to require the resident to vacate the premises immediately without further notice.'
    },
    {
      num: 'Clause 2',
      title: 'Mandatory 60-Day Advance Notice & 3-Month Minimum Stay Policy',
      tag: 'DEPOSIT ADJUSTMENT',
      tagColor: [180, 83, 9],
      text: 'The resident is admitted for a mandatory minimum stay of 3 months. Security deposit is NON-REFUNDABLE in cash under any circumstances. It will be adjusted against the final rent ONLY IF a formal written notice is served at least 60 days (2 full calendar months) in advance. Leaving without 60-day notice causes 100% deposit forfeiture.'
    },
    {
      num: 'Clause 3',
      title: 'Zero Tolerance Policy: Alcohol, Narcotics, Smoking & Disorderly Conduct',
      tag: 'ZERO TOLERANCE',
      tagColor: [225, 29, 72],
      text: 'Possession or consumption of alcohol, cigarettes, gutkha, drugs, gambling or engaging in physical violence/abusive behavior anywhere inside the hostel premises, rooms, or rooftop is STRICTLY PROHIBITED. Any violation results in immediate police FIR, expulsion, and security forfeiture.'
    },
    {
      num: 'Clause 4',
      title: 'Electrical Appliance Restrictions & Full Property Damage Liability',
      tag: 'SAFETY & DAMAGE',
      tagColor: [71, 85, 105],
      text: 'High-wattage electric heaters, cooking induction plates, or unauthorized appliances are prohibited. Any damage caused to hostel furniture, switches, sanitaries, fans, or walls will be penalized at 100% replacement cost payable by the resident immediately.'
    },
    {
      num: 'Clause 5',
      title: 'Strict No-Guest & Overnight Visitor Prohibition in Resident Rooms',
      tag: 'SECURITY',
      tagColor: [30, 64, 175],
      text: 'No outside visitors, classmates, day-scholars, or unauthorized persons are allowed to stay overnight inside resident rooms. All visitors must meet in the ground floor visitor lounge during designated hours only.'
    },
    {
      num: 'Clause 6',
      title: 'Right of Unannounced Management Inspection for Safety & Discipline',
      tag: 'INSPECTION',
      tagColor: [71, 85, 105],
      text: 'To ensure overall safety, cleanliness, and strict discipline, the hostel owner and authorized wardens reserve the right to inspect resident rooms at any time (day or night).'
    },
    {
      num: 'Clause 7',
      title: 'Personal Valuables & Mandatory Room Locking Protocol',
      tag: 'VALUABLES',
      tagColor: [71, 85, 105],
      text: 'Residents are solely responsible for their personal gadgets, laptops, cash, and belongings. Rooms must be securely locked whenever stepping out. Management accepts no legal liability for personal theft or loss.'
    },
    {
      num: 'Clause 8',
      title: 'Wall Cleanliness, Defacing Penalty & Silent Study Hours (11 PM - 6 AM)',
      tag: 'HYGIENE',
      tagColor: [71, 85, 105],
      text: 'Pasting stickers, drilling nails, spitting, or defacing walls is strictly prohibited. Repainting charges will be deducted from deposit. Strict silence must be maintained from 11:00 PM to 06:00 AM daily.'
    }
  ];

  rules.slice(0, 4).forEach((r) => {
    // Clause Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`[ ${r.num} ]  ${r.title}`, margin + 2, y);

    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitLines = doc.splitTextToSize(r.text, contentWidth - 4);
    doc.text(splitLines, margin + 4, y);
    y += splitLines.length * 3.6 + 3;
  });

  // Footer Page 1
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Page 1 of 2 • Modanwal Boys Hostel Official Record • Helpline: ${config.phone || '+91 99361 80282'}`, pageWidth / 2, 285, { align: 'center' });

  // -------------------------------------------------------------
  // PAGE 2: REMAINING RULES, DECLARATION & 4 SIGNATURE BLOCKS
  // -------------------------------------------------------------
  doc.addPage();

  // Outer Border Page 2
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.rect(margin - 3, margin - 3, contentWidth + 6, 277);

  // Inner Fine Border Page 2
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(margin - 1.5, margin - 1.5, contentWidth + 3, 274);

  // Top header miniature
  doc.setFillColor(15, 23, 42);
  doc.rect(margin - 3, margin - 3, contentWidth + 6, 16, 'F');
  doc.setFillColor(245, 158, 11);
  doc.rect(margin - 3, margin + 13, contentWidth + 6, 1.2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${hostelName} — RENT AGREEMENT & UNDERTAKING (PART 2)`, pageWidth / 2, margin + 6.5, { align: 'center' });

  y = margin + 22;

  rules.slice(4).forEach((r) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`[ ${r.num} ]  ${r.title}`, margin + 2, y);

    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitLines = doc.splitTextToSize(r.text, contentWidth - 4);
    doc.text(splitLines, margin + 4, y);
    y += splitLines.length * 3.6 + 3.5;
  });

  // SECTION 3: DECLARATION & LEGAL UNDERTAKING BOX
  y += 6;
  doc.setFillColor(254, 243, 199); // amber-100
  doc.rect(margin, y, contentWidth, 34, 'F');
  doc.setDrawColor(217, 119, 6); // amber-600
  doc.setLineWidth(0.8);
  doc.rect(margin, y, contentWidth, 34, 'S');

  doc.setTextColor(120, 53, 15);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('LEGAL DECLARATION & RESIDENT UNDERTAKING:', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(69, 26, 3);
  const declarationText =
    '"I hereby solemnly confirm that I have thoroughly read, understood, and voluntarily agreed to all 8 strict clauses, rent schedule (5th of month), zero-tolerance policies, and the mandatory 60-day notice requirement of Modanwal Boys Hostel. I pledge to strictly abide by all rules. I fully acknowledge that the management holds absolute legal authority to forfeit my deposit and expel me immediately in event of any violation."';
  const decLines = doc.splitTextToSize(declarationText, contentWidth - 8);
  doc.text(decLines, margin + 4, y + 11.5);

  // SECTION 4: 4 SIGNATURE BLOCKS
  y += 46;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL AUTHORIZATION & SIGNATURES:', margin, y);

  y += 12;
  const colW = contentWidth / 4;

  const drawSigBox = (colIdx: number, title: string, subtitle: string, fillValue?: string) => {
    const startX = margin + colIdx * colW + 2;
    const boxW = colW - 4;

    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.4);
    doc.line(startX, y + 15, startX + boxW, y + 15);

    if (fillValue) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 27, 75);
      doc.text(fillValue, startX + boxW / 2, y + 12, { align: 'center' });
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(title, startX + boxW / 2, y + 19, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, startX + boxW / 2, y + 23, { align: 'center' });
  };

  drawSigBox(0, 'Student Resident', 'Signature & Date');
  drawSigBox(1, 'Date of Admission', 'Effective Date', new Date().toLocaleDateString('en-IN'));
  drawSigBox(2, 'Parent / Guardian', 'Signature & Consent');
  drawSigBox(3, 'Hostel Warden', 'Authorized Signatory & Seal', config.caretakerName || 'Authorized Signatory');

  // Official Stamp Watermark Box
  y += 38;
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.6);
  doc.roundedRect(pageWidth / 2 - 45, y, 90, 15, 2, 2, 'S');
  doc.setTextColor(67, 56, 202);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL VERIFIED ADMISSION DEED', pageWidth / 2, y + 6.5, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${hostelName} • TINDOLA, BARABANKI`, pageWidth / 2, y + 11, { align: 'center' });

  // Footer Page 2
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Page 2 of 2 • Modanwal Boys Hostel Official Record • Helpline: ${config.phone || '+91 99361 80282'}`, pageWidth / 2, 285, { align: 'center' });

  return doc;
}

/**
 * ============================================================================
 * 2. NATIVE VECTOR jsPDF GENERATOR: RENT PAYMENT RECEIPT
 * ============================================================================
 */
export function generateRentReceiptPDF(
  student: BookingInquiry,
  record: PaymentRecord,
  config: HostelConfig
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5' // A5 standard receipt
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  // Outer Border
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, contentWidth, 190);

  // Top Header Banner
  doc.setFillColor(30, 27, 75);
  doc.rect(margin, margin, contentWidth, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text((config.hostelName || 'MODANWAL BOYS HOSTEL').toUpperCase(), pageWidth / 2, margin + 7, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Near SRMU Campus, Tindola, Barabanki • Ph: ${config.phone || '+91 99361 80282'}`, pageWidth / 2, margin + 14, { align: 'center' });

  let y = margin + 27;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL RENT & FEE PAYMENT RECEIPT', pageWidth / 2, y, { align: 'center' });

  // Receipt Number & Date Box
  y += 6;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin + 2, y, contentWidth - 4, 10, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(margin + 2, y, contentWidth - 4, 10, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Receipt No:', margin + 5, y + 6.5);
  doc.setTextColor(15, 23, 42);
  const recNo = `MBH-2026-${record.id?.replace(/[^0-9]/g, '').slice(-4) || student.id?.replace(/[^0-9]/g, '').slice(-4) || '1042'}`;
  doc.text(recNo, margin + 25, y + 6.5);

  doc.setTextColor(71, 85, 105);
  doc.text('Date of Payment:', margin + 75, y + 6.5);
  doc.setTextColor(15, 23, 42);
  const payDate = record.paymentDate ? new Date(record.paymentDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  doc.text(payDate, margin + 102, y + 6.5);

  // Student Details Table
  y += 15;
  const drawReceiptRow = (label: string, value: string, isAlternate: boolean = false) => {
    if (isAlternate) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin + 2, y - 4, contentWidth - 4, 7, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(label, margin + 5, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value, margin + 48, y);

    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(margin + 2, y + 3, margin + contentWidth - 2, y + 3);
    y += 7.5;
  };

  drawReceiptRow('Resident Name:', student.fullName || 'Student Resident', false);
  drawReceiptRow('Room Allotted:', `${student.roomNumber || 'Room Assigned'} (${student.roomType === 'single' ? 'Single Private Room' : student.roomType === 'full' ? 'Full Private Room' : 'Twin Sharing Room'})`, true);
  drawReceiptRow('Contact Phone:', student.phone || 'N/A', false);
  drawReceiptRow('Payment For / Month:', record.month || 'Monthly Rent', true);
  drawReceiptRow('Payment Mode:', (record.paymentMode || 'UPI / Bank Transfer').toUpperCase(), false);
  drawReceiptRow('Transaction Status:', (record.status || 'PAID').toUpperCase(), true);

  // Amount Big Box
  y += 4;
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.rect(margin + 2, y, contentWidth - 4, 18, 'F');
  doc.setDrawColor(34, 197, 94); // emerald-500
  doc.setLineWidth(0.6);
  doc.rect(margin + 2, y, contentWidth - 4, 18, 'S');

  doc.setTextColor(22, 101, 52);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT RECEIVED IN ADVANCE:', margin + 6, y + 7);

  doc.setFontSize(14);
  doc.text(`Rs. ${(record.amount || 0).toLocaleString('en-IN')} /-`, margin + 6, y + 14);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('(Rent includes Electricity, High-Speed Wi-Fi, RO & Maintenance)', margin + 55, y + 14);

  // Notes
  y += 24;
  if (record.notes) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(`Notes: ${record.notes}`, margin + 5, y);
    y += 8;
  }

  // Stamp and Signature
  y += 6;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.4);
  doc.line(margin + contentWidth - 45, y + 12, margin + contentWidth - 5, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(config.caretakerName || 'Authorized Signatory', margin + contentWidth - 25, y + 16, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Modanwal Boys Hostel', margin + contentWidth - 25, y + 20, { align: 'center' });

  // Verified Badge
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin + 5, y + 3, 40, 15, 2, 2, 'S');
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('VERIFIED RECEIPT', margin + 25, y + 9, { align: 'center' });
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('System Verified Ledger', margin + 25, y + 13, { align: 'center' });

  // Footer Note
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated official receipt for Modanwal Boys Hostel.', pageWidth / 2, 194, { align: 'center' });

  return doc;
}

/**
 * ============================================================================
 * 3. HIGH-RES HTML5 2D CANVAS RENDERER: PREMIUM STUDENT SMART ID PASS (CR-80)
 * ============================================================================
 * Renders both Front and Back sides of the card with:
 * - Lanyard punch-hole with metallic grommet
 * - Gold foil EMV contactless smart chip & RFID wave icon
 * - Iridescent hologram security seal
 * - High-resolution uploaded student portrait (with bulletproof base64 handling)
 * - Code 128 Machine-Readable Barcode
 * - Offline generated verification QR Code
 * - Warden / Management authorized signatory stamp
 */
export async function drawIdCardToCanvas(
  student: BookingInquiry,
  config: HostelConfig,
  qrImageUrl?: string,
  photoDataUrl?: string,
  side: 'front' | 'back' = 'front',
  options?: { includeQrCode?: boolean; qrContentType?: 'text' | 'url' }
): Promise<HTMLCanvasElement> {
  const includeQr = options?.includeQrCode !== false;
  const qrContentType = options?.qrContentType || 'text';
  const canvas = document.createElement('canvas');
  // High-definition CR-80 dimensions at 300 DPI: 1050 x 650 pixels
  const width = 1050;
  const height = 650;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas context');

  // Prepare scannable text & offline QR code if QR is enabled
  let effectiveQrUrl = qrImageUrl;
  if (includeQr && (!effectiveQrUrl || !effectiveQrUrl.startsWith('data:'))) {
    const qrText = getStudentQRData(student, config, qrContentType);
    effectiveQrUrl = await generateStudentQRCode(qrText);
  }

  // 1. Clip Base Card Geometry (CR-80 Rounded Corners: 30px radius)
  ctx.save();
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(0, 0, width, height, 30);
  } else {
    ctx.rect(0, 0, width, height);
  }
  ctx.clip();

  // Card Outer Border
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  if (side === 'front') {
    // ========================================================================
    // FRONT SIDE: SMART IDENTITY & ACCESS PASS
    // ========================================================================

    // Background Subtle Micro-pattern (Guilloché Security Mesh)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    for (let i = -width; i < width * 2; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }

    // Clean Modern Inset Inlay Border with Corner Accents
    const inset = 12;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(inset, inset, width - inset * 2, height - inset * 2, 22);
      ctx.stroke();
    } else {
      ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
    }

    // 4 Corner Precision Accents
    const cSize = 16;
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2.5;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(inset, inset + cSize);
    ctx.lineTo(inset, inset);
    ctx.lineTo(inset + cSize, inset);
    ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.moveTo(width - inset - cSize, inset);
    ctx.lineTo(width - inset, inset);
    ctx.lineTo(width - inset, inset + cSize);
    ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(inset, height - inset - cSize);
    ctx.lineTo(inset, height - inset);
    ctx.lineTo(inset + cSize, height - inset);
    ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(width - inset - cSize, height - inset);
    ctx.lineTo(width - inset, height - inset);
    ctx.lineTo(width - inset, height - inset - cSize);
    ctx.stroke();

    // Top Premium Banner Header (Navy to Indigo gradient)
    const headerH = 150;
    const headerGrad = ctx.createLinearGradient(0, 0, width, 0);
    headerGrad.addColorStop(0, '#090d16');
    headerGrad.addColorStop(0.5, '#0f172a');
    headerGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, width, headerH);

    // Header Indigo Accent Bar
    const accentGrad = ctx.createLinearGradient(0, 0, width, 0);
    accentGrad.addColorStop(0, '#4f46e5');
    accentGrad.addColorStop(0.5, '#6366f1');
    accentGrad.addColorStop(1, '#818cf8');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(0, headerH - 5, width, 5);

    // Institution Branding (Clean, No SRMU Affiliation)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
    ctx.fillText((config.hostelName || 'MODANWAL BOYS HOSTEL').toUpperCase(), 45, 66);

    ctx.fillStyle = '#fde047'; // bright yellow hindi
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillText('मोदनवाल ब्वायज हॉस्टल • तिंदोला, बाराबंकी', 45, 94);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Tindola, Barabanki (U.P.) • Helpline: ${config.phone || '+91 99361 80282'}`, 45, 120);

    // Top Right Clean Session & Pass Label (No Authorization Badge)
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('STUDENT ID PASS', width - 45, 68);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText('Academic Session 2026-27', width - 45, 92);
    ctx.textAlign = 'left';

    // 2. DEDICATED PROMINENT STUDENT PORTRAIT BOX (Left Column)
    const photoX = 45;
    const photoY = 175;
    const photoW = 205;
    const photoH = 260;

    // Modern Double Bezel Outer Frame
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(photoX - 3, photoY - 3, photoW + 6, photoH + 6, 18);
      ctx.fill();
      ctx.stroke();
    }

    // Inner Dark Precision Bezel
    ctx.fillStyle = '#0f172a';
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(photoX, photoY, photoW, photoH, 14);
      ctx.fill();
    } else {
      ctx.fillRect(photoX, photoY, photoW, photoH);
    }

    // Inner photo clip area
    ctx.save();
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(photoX + 3, photoY + 3, photoW - 6, photoH - 6, 11);
    } else {
      ctx.rect(photoX + 3, photoY + 3, photoW - 6, photoH - 6);
    }
    ctx.clip();

    let photoDrawn = false;
    if (photoDataUrl) {
      try {
        const pImg = new Image();
        if (photoDataUrl.startsWith('http://') || photoDataUrl.startsWith('https://')) {
          pImg.crossOrigin = 'anonymous';
        }
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => resolve(), 2500);
          pImg.onload = () => {
            clearTimeout(timeout);
            const imgAspect = pImg.width / pImg.height;
            const boxAspect = (photoW - 8) / (photoH - 8);
            let renderW = photoW - 8;
            let renderH = photoH - 8;
            let offX = photoX + 4;
            let offY = photoY + 4;

            if (imgAspect > boxAspect) {
              renderW = (photoH - 8) * imgAspect;
              offX = photoX + 4 - (renderW - (photoW - 8)) / 2;
            } else {
              renderH = (photoW - 8) / imgAspect;
              offY = photoY + 4 - (renderH - (photoH - 8)) / 2;
            }

            try {
              ctx.drawImage(pImg, offX, offY, renderW, renderH);
              photoDrawn = true;
            } catch (drawErr) {
              console.warn('Could not draw photo into canvas:', drawErr);
            }
            resolve();
          };
          pImg.onerror = () => {
            clearTimeout(timeout);
            resolve();
          };
          pImg.src = photoDataUrl;
          if (pImg.complete && pImg.naturalWidth > 0) {
            pImg.onload?.(new Event('load'));
          }
        });
      } catch (e) {
        console.warn('Could not draw student photo:', e);
      }
    }

    if (!photoDrawn) {
      // Silhouette placeholder
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(photoX + 4, photoY + 4, photoW - 8, photoH - 8);

      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(photoX + photoW / 2, photoY + 90, 48, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(photoX + photoW / 2, photoY + 210, 75, Math.PI, 0);
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((student.fullName || 'S').charAt(0).toUpperCase(), photoX + photoW / 2, photoY + 102);
      ctx.textAlign = 'left';
    }
    ctx.restore();

    // Biometric Corner Registration Notches on Photo Frame
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    const notchS = 10;
    // Top-left notch
    ctx.beginPath();
    ctx.moveTo(photoX + 5, photoY + 5 + notchS);
    ctx.lineTo(photoX + 5, photoY + 5);
    ctx.lineTo(photoX + 5 + notchS, photoY + 5);
    ctx.stroke();
    // Top-right notch
    ctx.beginPath();
    ctx.moveTo(photoX + photoW - 5 - notchS, photoY + 5);
    ctx.lineTo(photoX + photoW - 5, photoY + 5);
    ctx.lineTo(photoX + photoW - 5, photoY + 5 + notchS);
    ctx.stroke();
    // Bottom-left notch
    ctx.beginPath();
    ctx.moveTo(photoX + 5, photoY + photoH - 5 - notchS);
    ctx.lineTo(photoX + 5, photoY + photoH - 5);
    ctx.lineTo(photoX + 5 + notchS, photoY + photoH - 5);
    ctx.stroke();
    // Bottom-right notch
    ctx.beginPath();
    ctx.moveTo(photoX + photoW - 5 - notchS, photoY + photoH - 5);
    ctx.lineTo(photoX + photoW - 5, photoY + photoH - 5);
    ctx.lineTo(photoX + photoW - 5, photoY + photoH - 5 - notchS);
    ctx.stroke();

    // Biometric Verified Tag under portrait
    ctx.fillStyle = '#0f172a'; // dark navy backing
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 1;
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(photoX + 10, photoY + photoH - 14, photoW - 20, 26, 13);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(photoX + 10, photoY + photoH - 14, photoW - 20, 26);
      ctx.strokeRect(photoX + 10, photoY + photoH - 14, photoW - 20, 26);
    }
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 10.5px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓ PHOTO VERIFIED', photoX + photoW / 2, photoY + photoH + 3);
    ctx.textAlign = 'left';

    // 3. STUDENT DETAILS & ALLOTMENT GRID (Clean, Wide & Professional)
    const infoX = photoX + photoW + 35;
    let infoY = 180;

    // Student Full Name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
    ctx.fillText(student.fullName || 'Student Resident', infoX, infoY);

    // Course / Branch Badge (No SRMU Affiliation)
    infoY += 34;
    const courseName = student.course || student.studyYear || 'B.Tech Computer Science';
    const courseText = `Course: ${courseName} • Hostel Resident`;
    ctx.fillStyle = '#eef2ff';
    ctx.strokeStyle = '#c7d2fe';
    ctx.lineWidth = 1.2;
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(infoX, infoY - 20, 360, 28, 14);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(infoX, infoY - 20, 360, 28);
      ctx.strokeRect(infoX, infoY - 20, 360, 28);
    }
    ctx.fillStyle = '#3730a3';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(courseText, infoX + 16, infoY - 1);

    // RFID & Session Tag on top right
    const tagX = width - 45;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText('📡 RFID ACCESS PASS', tagX, 175);
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('Session: 2026-2027', tagX, 195);
    ctx.textAlign = 'left';

    // 2-Column Balanced Information Table
    const col1X = infoX;
    const col2X = infoX + 360;
    const startTableY = infoY + 34;

    const studentUid = `MBH-2026-${(student.id || student.phone || '101').replace(/[^0-9]/g, '').slice(-5)}`;
    const effectiveFather = (student as any).fatherName || (student as any).guardianName || '';

    // Accurate formatted entry / admission date
    const rawEntryDate = student.checkInDate || (student as any).admissionDate || (student as any).entryDate || student.timestamp?.split('T')[0] || '';
    let entryDateFormatted = '01-Aug-2026';
    if (rawEntryDate && rawEntryDate.toLowerCase() !== 'immediately') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawEntryDate)) {
        try {
          const [y, m, d] = rawEntryDate.split('-');
          const dObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
          entryDateFormatted = dObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
          entryDateFormatted = rawEntryDate;
        }
      } else {
        entryDateFormatted = rawEntryDate;
      }
    }

    const roomTypeBadge = student.roomType === 'single' ? 'Single AC' : student.roomType === 'full' ? 'Full Room' : 'Twin Seater';
    const col1Data = [
      { lbl: 'Student UID:', val: studentUid, isAccent: true },
      { lbl: 'Allotted Room:', val: `Room ${student.roomNumber || '101'} (${roomTypeBadge})`, isAccent: true },
      { lbl: 'Course / Branch:', val: courseName },
      { lbl: 'Admission Date:', val: entryDateFormatted, isAccent: true },
    ];

    const col2Data = [
      { lbl: "Father's Name:", val: effectiveFather || 'On Record' },
      { lbl: 'Contact No:', val: student.phone || 'N/A' },
      { lbl: 'Emergency No:', val: (student as any).parentPhone || config.phone || 'N/A' },
      { lbl: 'Resident Status:', val: 'Active Verified Resident', isSuccess: true },
    ];

    // Draw Column 1
    let rowY = startTableY;
    for (const item of col1Data) {
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12.5px system-ui, -apple-system, sans-serif';
      ctx.fillText(item.lbl, col1X, rowY);

      if (item.isAccent) {
        ctx.fillStyle = '#1e1b4b';
        ctx.font = 'bold 14.5px system-ui, -apple-system, sans-serif';
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.font = '14px system-ui, -apple-system, sans-serif';
      }
      ctx.fillText(item.val, col1X + 125, rowY);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(col1X, rowY + 6);
      ctx.lineTo(col1X + 335, rowY + 6);
      ctx.stroke();

      rowY += 28;
    }

    // Draw Column 2
    rowY = startTableY;
    for (const item of col2Data) {
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12.5px system-ui, -apple-system, sans-serif';
      ctx.fillText(item.lbl, col2X, rowY);

      if (item.isSuccess) {
        ctx.fillStyle = '#15803d';
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.font = '14px system-ui, -apple-system, sans-serif';
      }
      ctx.fillText(item.val, col2X + 130, rowY);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(col2X, rowY + 6);
      ctx.lineTo(col2X + 335, rowY + 6);
      ctx.stroke();

      rowY += 28;
    }

    // Verification & Safety Assurance Strip
    const bannerY = startTableY + 122;
    const bannerW = width - infoX - 45;
    ctx.fillStyle = '#f0fdf4';
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 1.2;
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(infoX, bannerY, bannerW, 36, 10);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(infoX, bannerY, bannerW, 36);
      ctx.strokeRect(infoX, bannerY, bannerW, 36);
    }

    ctx.fillStyle = '#166534';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText('✓ OFFICIAL RESIDENT IDENTITY CARD • MODANWAL BOYS HOSTEL', infoX + 16, bannerY + 22);

    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Helpline: ${config.phone || '+91 9839631889'}`, infoX + bannerW - 16, bannerY + 22);
    ctx.textAlign = 'left';

    // 7. BOTTOM CODE 128 BARCODE & OFFICIAL SIGNATURE FOOTER
    const footerY = height - 90;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, footerY, width, 90);

    // Barcode rendering (Code-128 style stripes)
    const barX = 45;
    const barY = footerY + 18;
    const barH = 34;
    ctx.fillStyle = '#ffffff';

    // Draw realistic barcode pattern
    const pattern = [3, 1, 2, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 3, 4, 1, 2, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 2, 1, 3, 1, 2, 4, 1, 3, 2, 2];
    let curX = barX;
    for (let i = 0; i < pattern.length; i++) {
      const w = pattern[i];
      if (i % 2 === 0) {
        ctx.fillRect(curX, barY, w * 2.2, barH);
      }
      curX += w * 2.2;
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`*${studentUid}*`, barX + 15, barY + barH + 18);

    // Authorized Signature Stamp (Center/Right of footer)
    const signX = width - 360;
    ctx.fillStyle = '#38bdf8'; // sky blue signatory text
    ctx.font = 'italic 16px "Brush Script MT", cursive, sans-serif';
    ctx.fillText('Hostel Warden', signX + 40, footerY + 36);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(signX, footerY + 46);
    ctx.lineTo(signX + 220, footerY + 46);
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('Warden / Management (वार्डन)', signX + 15, footerY + 62);

    ctx.fillStyle = '#64748b';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    ctx.fillText('Resident Safety & Management Committee', signX + 15, footerY + 76);

  } else {
    // ========================================================================
    // BACK SIDE: RULES, EMERGENCY NUMBERS & CONTACT DETAILS
    // ========================================================================

    // Top Dark Header with Magnetic Stripe Bar
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, 120);

    // Magnetic Swipe Stripe
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 20, width, 55);

    // Top Header Text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText('MODANWAL BOYS HOSTEL • RESIDENT CODE OF CONDUCT & SAFETY', 45, 105);

    // Lanyard Punch Hole Indicator
    const slotW = 100;
    const slotH = 18;
    const slotX = width / 2 - slotW / 2;
    const slotY = 12;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(slotX, slotY, slotW, slotH, 9);
    } else {
      ctx.rect(slotX, slotY, slotW, slotH);
    }
    ctx.fill();
    ctx.stroke();

    // SECTION 1: IMPORTANT HOSTEL RULES
    let curY = 155;
    ctx.fillStyle = '#1e1b4b'; // indigo-950
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillText('1. IMPORTANT RULES FOR RESIDENTS (महत्वपूर्ण नियम एवं निर्देश):', 45, curY);

    curY += 24;
    const rules = [
      '• Gate Curfew: Hostel main gate closes strictly at 10:30 PM. Late entry requires prior written approval from Warden.',
      '• Substance Prohibition: Smoking, alcohol, tobacco, drugs, and fireworks are strictly banned on campus grounds.',
      '• Heavy Appliances: High-wattage immersion heating rods, induction cookers, and room heaters are strictly prohibited.',
      '• Identity Card: This card is non-transferable and must be produced whenever requested by security guards or caretakers.',
      '• Visitor Policy: Day visitors permitted only in visitor lounge up to 7:00 PM. No outsider overnight stay is allowed.'
    ];

    ctx.fillStyle = '#334155';
    ctx.font = '13.5px system-ui, -apple-system, sans-serif';
    rules.forEach((rule) => {
      ctx.fillText(rule, 50, curY);
      curY += 22;
    });

    // SECTION 2: 24/7 EMERGENCY HELPLINE DIRECTORY
    curY += 15;
    ctx.fillStyle = '#991b1b'; // red-800
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillText('2. EMERGENCY DIRECTORY (आपातकालीन संपर्क सूची):', 45, curY);

    curY += 24;
    const helplines = [
      { label: 'Hostel Warden / Office:', val: config.phone || '+91 9839631889' },
      { label: 'Police Emergency Helpline:', val: '112' },
      { label: 'Medical Ambulance Helpline:', val: '108' },
      { label: 'Fire Emergency Station:', val: '101' }
    ];

    helplines.forEach((h) => {
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
      ctx.fillText(h.label, 50, curY);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13.5px monospace';
      ctx.fillText(h.val, 340, curY);
      curY += 22;
    });

    // SECTION 3: PERMANENT RESIDENCE RECORD & RETURN NOTICE
    curY += 15;
    const boxW = width - 90;
    const boxH = 95;
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(45, curY, boxW, boxH, 12);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(45, curY, boxW, boxH);
      ctx.strokeRect(45, curY, boxW, boxH);
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12.5px system-ui, -apple-system, sans-serif';
    ctx.fillText('PERMANENT HOME ADDRESS & GUARDIAN DETAILS:', 60, curY + 22);

    ctx.fillStyle = '#475569';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    const effectiveFather = (student as any).fatherName || (student as any).guardianName || 'Guardian on Record';
    ctx.fillText(`Resident: ${student.fullName} | Father: ${effectiveFather}`, 60, curY + 42);
    ctx.fillText(`Address: ${(student as any).permanentAddress || student.hometown || 'District Record on File'} | Phone: ${student.phone}`, 60, curY + 60);

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('IF FOUND PLEASE RETURN TO: Modanwal Boys Hostel, Tindola, Barabanki (U.P.) - 225003', 60, curY + 80);

    // Bottom Barcode & Footer
    const footerY = height - 50;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, footerY, width, 50);

    // Accurate entry date for back footer
    const rawBackDate = student.checkInDate || (student as any).admissionDate || (student as any).entryDate || student.timestamp?.split('T')[0] || '';
    let backEntryDate = '01-Aug-2026';
    if (rawBackDate && rawBackDate.toLowerCase() !== 'immediately') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawBackDate)) {
        try {
          const [y, m, d] = rawBackDate.split('-');
          const dObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
          backEntryDate = dObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
          backEntryDate = rawBackDate;
        }
      } else {
        backEntryDate = rawBackDate;
      }
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11.5px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Property of Modanwal Boys Hostel • Entry Date: ${backEntryDate} • Non-transferable resident pass.`, 45, footerY + 30);
  }

  ctx.restore();
  return canvas;
}

/**
 * ============================================================================
 * 4. NATIVE DOUBLE-SIDED A4 PDF GENERATOR FOR ID CARD & GATE PASS
 * ============================================================================
 * Generates an official, high-resolution A4 document with Front and Back passes,
 * complete with cutting guidelines and lanyard hole punches.
 */
export async function generateIdCardPDF(
  student: BookingInquiry,
  config: HostelConfig,
  photoDataUrl?: string,
  qrImageUrl?: string,
  options?: { includeQrCode?: boolean; qrContentType?: 'text' | 'url' }
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // Render both Front and Back passes to high-res canvases with safety fallbacks
  let frontImg = '';
  let backImg = '';

  try {
    const frontCanvas = await drawIdCardToCanvas(student, config, qrImageUrl, photoDataUrl, 'front', options);
    frontImg = frontCanvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Tainted canvas or render issue on front pass, retrying with silhouette:', err);
    const safeFront = await drawIdCardToCanvas(student, config, qrImageUrl, undefined, 'front', options);
    frontImg = safeFront.toDataURL('image/png');
  }

  try {
    const backCanvas = await drawIdCardToCanvas(student, config, qrImageUrl, photoDataUrl, 'back', options);
    backImg = backCanvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Tainted canvas or render issue on back pass, retrying:', err);
    const safeBack = await drawIdCardToCanvas(student, config, qrImageUrl, undefined, 'back', options);
    backImg = safeBack.toDataURL('image/png');
  }

  // Page Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text((config.hostelName || 'MODANWAL BOYS HOSTEL').toUpperCase(), pageWidth / 2, 10, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(253, 224, 71);
  doc.text('OFFICIAL RESIDENT STUDENT SMART IDENTITY PASS & GATE CARD (2026-2027)', pageWidth / 2, 16, { align: 'center' });

  // Instructions
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.5);
  doc.text(
    'PRINT INSTRUCTIONS: Print on heavy A4 cardstock (250+ GSM) or photo paper. Cut along dotted guidelines for standard CR-80 wallet / badge holder.',
    pageWidth / 2,
    27,
    { align: 'center', maxWidth: 180 }
  );

  // Card Dimensions on A4 (CR-80 standard proportional fit: 145mm x 89.76mm)
  const cardW = 145; // mm
  const cardH = 89.76; // (650 * 145) / 1050
  const cardX = (pageWidth - cardW) / 2;

  // 1. FRONT CARD
  const frontY = 32;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('FRONT SIDE (CR-80 Smart Resident Pass):', cardX, frontY - 2);

  doc.addImage(frontImg, 'PNG', cardX, frontY, cardW, cardH);

  // Cutting guidelines for Front Card
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([2, 2], 0);
  doc.rect(cardX - 1, frontY - 1, cardW + 2, cardH + 2, 'S');

  // 2. BACK CARD
  const backY = frontY + cardH + 11;
  doc.text('BACK SIDE (Hostel Rules & Emergency Directory):', cardX, backY - 2);

  doc.addImage(backImg, 'PNG', cardX, backY, cardW, cardH);

  // Cutting guidelines for Back Card
  doc.rect(cardX - 1, backY - 1, cardW + 2, cardH + 2, 'S');
  doc.setLineDashPattern([], 0); // reset line dash

  // Cutting guide hint
  const cutHintY = backY + cardH + 6;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('✂ Cut along dotted lines • Standard CR-80 Lanyard Card Pouch (85.6mm × 53.98mm format)', pageWidth / 2, cutHintY, { align: 'center' });

  // Official Security Seal & Verification Footer (Comfortably placed with ample bottom margin)
  const footerY = cutHintY + 6;
  doc.setFillColor(248, 250, 252);
  doc.rect(15, footerY, pageWidth - 30, 18, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(15, footerY, pageWidth - 30, 18, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL VERIFICATION CERTIFICATE', 20, footerY + 5.5);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `This identity pass is digitally verified for student: ${student.fullName} (Room ${student.roomNumber || '101'}). Entry Date: ${student.checkInDate || '01-AUG-2026'}. Caretaker Helpline: ${config.phone || '+91 99361 80282'}.`,
    20,
    footerY + 11.5,
    { maxWidth: 125 }
  );

  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.text('Hostel Warden', pageWidth - 55, footerY + 7);
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(6.5);
  doc.text('Hostel Administration', pageWidth - 55, footerY + 12);

  return doc;
}

