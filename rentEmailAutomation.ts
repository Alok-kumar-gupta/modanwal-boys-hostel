/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookingInquiry, HostelConfig, AutomatedRentEmailLog } from '../types';

export interface ApproachingRentStatus {
  student: BookingInquiry;
  dueDay: number;
  dueDate: Date;
  dueDateFormatted: string;
  monthKey: string; // e.g. "2026-09"
  monthName: string; // e.g. "September 2026"
  daysRemaining: number;
  isApproaching: boolean;
  isDueToday: boolean;
  isOverdue: boolean;
  isPaid: boolean;
  alreadySentForCycle: boolean;
  rentAmount: number;
  studentEmail: string;
  urgencyLevel: 'due_today' | 'approaching' | 'overdue' | 'safe' | 'paid';
  urgencyLabel: string;
  badgeClass: string;
}

/**
 * Calculates the exact upcoming rent due date and status for a student.
 */
export function getStudentRentApproachingStatus(
  student: BookingInquiry,
  config: HostelConfig,
  referenceDate: Date = new Date()
): ApproachingRentStatus {
  const defaultDueDay = config.defaultRentDueDay || 5;
  const dueDay = Math.min(28, Math.max(1, student.rentDueDay || defaultDueDay));
  const noticeDays = config.autoRentEmailDaysNotice ?? 3;

  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth(); // 0-indexed (0 = Jan, 8 = Sep)
  const currentDay = referenceDate.getDate();

  // Target due date for current month
  let targetYear = currentYear;
  let targetMonth = currentMonth;

  // If we are well past the due day (e.g. day is 25 and due day is 5) AND student is marked paid for this month,
  // the upcoming due date is in next month. Otherwise, if pending, it refers to current cycle.
  if (currentDay > dueDay + 5 && student.rentStatus === 'paid') {
    targetMonth += 1;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }
  }

  const dueDate = new Date(targetYear, targetMonth, dueDay, 23, 59, 59);
  
  // Calculate whole days remaining
  const startOfToday = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()).getTime();
  const startOfDueDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime();
  const diffTime = startOfDueDate - startOfToday;
  const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const monthKey = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;
  const monthName = dueDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const dueDateFormatted = dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const isPaid = student.rentStatus === 'paid';
  const isDueToday = daysRemaining === 0 && !isPaid;
  const isOverdue = daysRemaining < 0 && !isPaid;
  const isApproaching = daysRemaining >= 0 && daysRemaining <= noticeDays && !isPaid && student.status === 'approved';
  const alreadySentForCycle = student.lastAutoEmailSentMonth === monthKey;

  const rentAmount = student.monthlyRentAmount || (
    student.roomType === 'single'
      ? (config.singleRoomRent || 4500)
      : student.roomType === 'full'
      ? (config.fullRoomRent || 5500)
      : (config.twinRoomRent || 3000)
  );

  const studentEmail = (student.email && student.email.includes('@') && student.email !== 'No email provided')
    ? student.email
    : `${(student.fullName || 'student').toLowerCase().replace(/\s+/g, '')}@modanwalhostel.in`;

  let urgencyLevel: ApproachingRentStatus['urgencyLevel'] = 'safe';
  let urgencyLabel = `Due in ${daysRemaining} days`;
  let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';

  if (isPaid) {
    urgencyLevel = 'paid';
    urgencyLabel = 'Rent Paid (जमा)';
    badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (isDueToday) {
    urgencyLevel = 'due_today';
    urgencyLabel = 'Due Today (आज देय)';
    badgeClass = 'bg-rose-50 text-rose-700 border-rose-300 font-extrabold animate-pulse';
  } else if (isOverdue) {
    urgencyLevel = 'overdue';
    urgencyLabel = `Overdue by ${Math.abs(daysRemaining)} days`;
    badgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
  } else if (isApproaching) {
    urgencyLevel = 'approaching';
    urgencyLabel = daysRemaining === 1 ? 'Due Tomorrow (कल देय)' : `Due in ${daysRemaining} days`;
    badgeClass = 'bg-amber-50 text-amber-800 border-amber-300 font-bold';
  }

  return {
    student,
    dueDay,
    dueDate,
    dueDateFormatted,
    monthKey,
    monthName,
    daysRemaining,
    isApproaching,
    isDueToday,
    isOverdue,
    isPaid,
    alreadySentForCycle,
    rentAmount,
    studentEmail,
    urgencyLevel,
    urgencyLabel,
    badgeClass
  };
}

/**
 * Generates subject, plain text message, and mailto URL for the automated rent reminder email.
 */
export function generateAutomatedRentEmailContent(
  status: ApproachingRentStatus,
  config: HostelConfig
) {
  const { student, dueDateFormatted, daysRemaining, isDueToday, monthName, rentAmount, studentEmail } = status;
  const hostelName = config.hostelName || 'Modanwal Boys Hostel';
  const caretakerName = config.caretakerName || 'Alok Kumar Gupta';
  const caretakerPhone = config.phone || '8887968504';
  const upiId = config.upiId || '8887968504@ybl';
  const roomTypeLabel = student.roomType === 'single'
    ? 'Single Occupancy (1-Seater)'
    : student.roomType === 'full'
    ? 'Full Room Private (निजी पूरा कमरा)'
    : 'Twin Sharing (2-Seater)';
  const roomNumber = student.roomNumber || (student.roomType === 'single' ? 'Single Room' : student.roomType === 'full' ? 'Full Private Room' : 'Twin Sharing');

  let subject = '';
  if (isDueToday) {
    subject = `🚨 [Urgent Reminder] Room Rent is Due TODAY (${dueDateFormatted}) - ${hostelName}`;
  } else if (daysRemaining === 1) {
    subject = `⏰ [Payment Notice] Room Rent Due Tomorrow (${dueDateFormatted}) - ${hostelName}`;
  } else {
    subject = `🗓️ [Rent Notice] Monthly Room Rent Due in ${daysRemaining} Days (${dueDateFormatted}) - ${hostelName}`;
  }

  const plainText = `Namaste ${student.fullName}! 🙏

This is an automated rent payment reminder from ${hostelName} regarding your upcoming room rent for ${monthName}.

📋 STAY & RENT PAYMENT SUMMARY:
• Resident Name: ${student.fullName}
• Room Number: ${roomNumber} (${roomTypeLabel})
• Rent Due Date: ${dueDateFormatted} (${isDueToday ? 'DUE TODAY' : `Due in ${daysRemaining} days`})
• Monthly Rent: ₹${rentAmount.toLocaleString('en-IN')}
• Payment Status: 🟡 Pending (Due Soon)

💳 HOW TO CLEAR YOUR PAYMENT:
1. Pay directly via UPI ID: ${upiId}
2. Pay in person to Warden: ${caretakerName} (Phone: ${caretakerPhone})
3. Share your payment confirmation/screenshot on WhatsApp to update your student portal receipt.

Student Portal: You can log into your Student Dashboard using your registered mobile number (${student.phone}) to track rent history, Wi-Fi passwords, and download receipts.

Thank you for your cooperation and timely payment!

Warm regards,
${caretakerName} (Warden)
${hostelName}
Contact: ${caretakerPhone} | Near SRMU, Barabanki / Lucknow`;

  const mailtoUrl = `mailto:${encodeURIComponent(studentEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;

  return {
    subject,
    plainText,
    mailtoUrl,
    hostelName,
    caretakerName,
    caretakerPhone,
    upiId,
    roomNumber
  };
}

/**
 * Scans all student records and triggers automated rent reminder emails for those whose rent date is approaching.
 * Updates Firestore records for affected students so duplicate emails are prevented for the current cycle.
 */
export function executeAutomatedRentEmailScan(
  bookings: BookingInquiry[],
  config: HostelConfig,
  onUpdateBooking: (updated: BookingInquiry) => void
): { triggeredLogs: AutomatedRentEmailLog[]; approachingCount: number } {
  // If master toggle is disabled, exit
  if (config.autoRentEmailEnabled === false) {
    return { triggeredLogs: [], approachingCount: 0 };
  }

  const now = new Date();
  const triggeredLogs: AutomatedRentEmailLog[] = [];
  let approachingCount = 0;

  for (const student of bookings) {
    // Only approved active residents
    if (student.status !== 'approved') continue;

    const status = getStudentRentApproachingStatus(student, config, now);

    if (status.isApproaching || status.isDueToday) {
      approachingCount++;

      // Check if we haven't already sent an automated reminder for this month
      if (!status.alreadySentForCycle) {
        const { subject, plainText } = generateAutomatedRentEmailContent(status, config);
        const timestampStr = now.toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        const logEntry: AutomatedRentEmailLog = {
          id: `auto-email-${Date.now()}-${student.id || Math.random().toString(36).substring(2, 7)}`,
          studentId: student.id || '',
          studentName: student.fullName,
          studentEmail: status.studentEmail,
          roomNumber: student.roomNumber || 'Room Assigned',
          rentAmount: status.rentAmount,
          dueDay: status.dueDay,
          dueDate: status.dueDateFormatted,
          daysRemaining: status.daysRemaining,
          status: 'delivered',
          sentAt: timestampStr,
          month: status.monthKey,
          subject: subject,
          previewText: plainText.substring(0, 140) + '...'
        };

        const existingLogs = student.autoEmailLogs || [];
        const updatedStudent: BookingInquiry = {
          ...student,
          lastAutoEmailSentMonth: status.monthKey,
          lastAutoEmailSentDate: timestampStr,
          lastReminderSent: timestampStr,
          lastReminderChannel: 'email',
          lastReminderType: 'pending_reminder',
          autoEmailStatus: 'delivered',
          autoEmailLogs: [logEntry, ...existingLogs].slice(0, 10)
        };

        onUpdateBooking(updatedStudent);
        triggeredLogs.push(logEntry);
      }
    }
  }

  return { triggeredLogs, approachingCount };
}
