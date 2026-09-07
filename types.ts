/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Facility {
  id: string;
  title: string;
  description: string;
  iconName: string;
  isUnique?: boolean;
  details?: string[];
}

export interface RoomOption {
  id: 'single' | 'twin' | 'full';
  name: string;
  capacity: string;
  description: string;
  baseRent: number; // monthly in INR
  securityDeposit: number; // refundable in INR
  features: string[];
}

export interface BookingInquiry {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  roomType: 'single' | 'twin' | 'full';
  studyYear: string;
  course?: string;
  fatherName?: string;
  guardianName?: string;
  checkInDate: string;
  customNotes?: string;
  notes?: string;
  addons: string[];
  inquiryType?: 'prebook' | 'ask' | 'visit' | 'self-register';
  configuredEstimate?: number | null;
  timestamp?: string;

  // Student Record Management & Status fields
  status?: 'pending' | 'approved' | 'rejected';
  ownerPermission?: boolean; // When true, student is permitted by owner to access Student Dashboard
  roomNumber?: string;
  monthlyRentAmount?: number;
  documents?: { name: string; base64: string }[];
  photoUrl?: string;
  rentStatus?: 'paid' | 'pending';
  lastRentNoticeDate?: string;
  lastReminderSent?: string;
  lastReminderChannel?: 'whatsapp' | 'email';
  lastReminderType?: 'pending_reminder' | 'receipt_confirmation';
  rentDueDay?: number; // Day of month rent is due (1 to 28, defaults to config.defaultRentDueDay or 5)
  lastAutoEmailSentMonth?: string; // e.g. "2026-09" to prevent duplicate emails in same month
  lastAutoEmailSentDate?: string; // Formatted timestamp of last automated email
  autoEmailStatus?: 'delivered' | 'pending' | 'scheduled';
  autoEmailLogs?: AutomatedRentEmailLog[];
  parentPhone?: string;
  guardianPhone?: string;
  aadharNumber?: string;
  // Student Portal Rent Amount Visibility Permission
  allowViewRentAmount?: boolean; // When true, student can view their rent and payment amounts in student portal. When false (default), amounts are hidden.
  // ID Card Download Quota & Owner Permission fields
  idCardDownloadLimit?: number; // Max allowed downloads (default is 1)
  idCardDownloadCount?: number; // Number of times student has downloaded their ID card
  idCardPermissionRequested?: boolean; // True when student exhausted limit and requested owner permission
  idCardPermissionRequestedAt?: string; // Timestamp when permission was requested
  idCardLastDownloadedAt?: string; // Timestamp of last download

  permanentAddress?: string;
  hometown?: string;
  paidDeposit?: number;
  dues?: number;
  paymentHistory?: PaymentRecord[];
}

export interface DailyLedgerEntry {
  id: string;
  date: string; // YYYY-MM-DD
  titleOrName: string; // Student Name or Party/Source
  studentId?: string; // Optional reference to BookingInquiry
  roomNumber?: string;
  category: 'rent' | 'deposit' | 'mess' | 'cooler' | 'electric' | 'advance' | 'maintenance' | 'expense' | 'other';
  entryType: 'income' | 'expense'; // default 'income'
  amount: number;
  paymentMode: 'cash' | 'upi' | 'bank' | 'online' | 'other';
  notes?: string;
  recordedBy?: string;
  timestamp: string;
}

export interface PaymentRecord {
  id: string;
  month: string; // "YYYY-MM" (e.g. "2026-07") or a label like "July 2026"
  amount: number;
  status: 'paid' | 'pending';
  paymentDate?: string;
  paymentMode?: 'cash' | 'upi' | 'bank' | 'other';
  type: 'rent' | 'cooler' | 'electric' | 'penalty' | 'other';
  notes?: string;
}

export interface HostelConfig {
  hostelName: string;
  caretakerName: string;
  phone: string;
  email: string;
  address?: string;
  singleRoomRent: number;
  twinRoomRent: number;
  fullRoomRent?: number;
  singleRoomDeposit: number;
  twinRoomDeposit: number;
  fullRoomDeposit?: number;
  coolerPrice: number;
  laundryPrice: number;
  chairPrice: number;
  lockerPrice: number;
  couponCodes: string[];

  // Wi-Fi Config
  wifiSsid?: string;
  wifiPassword?: string;

  // UPI Payment Config
  upiId?: string;
  upiName?: string;

  // About Us Customization
  aboutTagline?: string;
  aboutHeading?: string;
  aboutIntro?: string;
  aboutSingleFeatures?: string[];
  aboutTwinFeatures?: string[];
  aboutFullFeatures?: string[];

  // Facilities Customization
  facilitiesHeading?: string;
  facilitiesSubheading?: string;
  kitchenTitle?: string;
  kitchenDesc?: string;
  kitchenCookTitle?: string;
  kitchenCookDesc?: string;
  kitchenCookBullets?: string[];
  kitchenEquipTitle?: string;
  kitchenEquipDesc?: string;
  kitchenEquipBullets?: string[];
  kitchenSaveTitle?: string;
  kitchenSaveDesc?: string;
  kitchenSaveBullets?: string[];
  
  wifiTitle?: string;
  wifiDesc?: string;
  securityTitle?: string;
  securityDesc?: string;
  powerTitle?: string;
  powerDesc?: string;
  cleaningTitle?: string;
  cleaningDesc?: string;

  // Virtual Tour Descriptions
  tourKitchenDesc?: string;
  tourSingleDesc?: string;
  tourTwinDesc?: string;
  tourFullDesc?: string;
  tourLobbyDesc?: string;

  // Contact FAQs Customization
  faq1Question?: string;
  faq1Answer?: string;
  faq2Question?: string;
  faq2Answer?: string;
  faq3Question?: string;
  faq3Answer?: string;
  faq4Question?: string;
  faq4Answer?: string;

  // Uploaded Room Photos (Base64 data URLs)
  photoHero?: string;
  photoSingle?: string;
  photoTwin?: string;
  photoFull?: string;
  photoKitchen?: string;
  photoLobby?: string;

  // Landmarks / Proximity Customization
  landmark1Name?: string;
  landmark1Dist?: string;
  landmark1Walking?: string;
  landmark1Cycle?: string;

  landmark2Name?: string;
  landmark2Dist?: string;
  landmark2Walking?: string;
  landmark2Cycle?: string;

  landmark3Name?: string;
  landmark3Dist?: string;
  landmark3Walking?: string;
  landmark3Cycle?: string;
  landmark3Transport?: string;

  landmark4Name?: string;
  landmark4Dist?: string;
  landmark4Walking?: string;
  landmark4Cycle?: string;
  landmark4Transport?: string;

  // Hero Section Stats/Milestones Customization
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  stat3Value?: string;
  stat3Label?: string;
  stat4Value?: string;
  stat4Label?: string;

  // Student Portal Customization
  hideWifiGateway?: boolean;
  hideLaundryScheduler?: boolean;
  hideFoodMenu?: boolean;
  hideSuggestionBox?: boolean;
  foodMenuBadge?: string;
  customMenu?: {
    day: string;
    breakfast: string;
    lunch: string;
    dinner: string;
  }[];

  // Landing Page Element Toggles (hide options requested by user)
  hideKitchenSection?: boolean;
  hideSingleOccupancy?: boolean;
  hideTwinSharing?: boolean;
  hideFullRoomOccupancy?: boolean;
  hideMainUniqueFeature?: boolean;
  hideEstimateCalculator?: boolean;
  hidePaymentQrCode?: boolean;

  // Add-ons Availability & Visibility Toggles
  hideCoolerAddon?: boolean;
  hideLaundryAddon?: boolean;
  hideChairAddon?: boolean;
  hideLockerAddon?: boolean;
  
  // Room Occupancy / Booking Status (Room Full / Booking Open requested by user)
  isSingleFull?: boolean;
  isTwinFull?: boolean;
  isFullRoomFull?: boolean;

  // Admissions & Inclusion Customization
  admissionsText?: string;
  facilityInclusionText?: string;

  // Automated Rent Email Reminder Settings
  autoRentEmailEnabled?: boolean; // Master toggle for auto email reminders (default: true)
  autoRentEmailDaysNotice?: number; // Days in advance to trigger reminder (default: 3)
  defaultRentDueDay?: number; // Default day of month rent is due (1 to 28, default: 5)
  autoRentEmailCcAdmin?: boolean; // Whether to CC the caretaker email
  lastAutoEmailScanTimestamp?: string;
  // Room Inventory & Floor Plan Management
  roomsList?: HostelRoom[];
}

export interface HostelRoom {
  id: string; // e.g. "101"
  roomNumber: string; // e.g. "101"
  floor?: string; // e.g. "Ground Floor", "1st Floor", "2nd Floor"
  type: 'single' | 'twin' | 'full'; // single (1-bed), twin (2-bed), full (private full room)
  capacity: number; // 1 or 2
  status?: 'available' | 'occupied' | 'maintenance' | 'reserved';
  customRent?: number;
  notes?: string;
  amenities?: string[];
}

export interface AutomatedRentEmailLog {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  roomNumber: string;
  rentAmount: number;
  dueDay: number;
  dueDate: string;
  daysRemaining: number;
  status: 'delivered' | 'sent';
  sentAt: string;
  month: string;
  subject: string;
  previewText?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: 'facilities' | 'policy' | 'pricing';
}

export interface Testimonial {
  id: string;
  name: string;
  collegeOrCourse: string;
  rating: number;
  text: string;
  category: 'kitchen' | 'study' | 'facilities' | 'general';
  yearOfStay: string;
  timestamp?: string;
  hidden?: boolean;
}

export interface MaintenanceLog {
  id: string;
  roomNumber: string;
  issueType: 'plumbing' | 'electrical' | 'furniture' | 'appliance' | 'internet' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'resolved';
  cost?: number;
  reportedDate: string; // ISO Date String
  resolvedDate?: string; // ISO Date String
  assignedTo?: string;
  notes?: string;
  studentName?: string;
  studentPhone?: string;
  source?: 'student' | 'owner';
  preferredTime?: string;
}

export interface StudentToken {
  id: string;
  tokenCode: string; // e.g. "MBH-8921" or "SHRI-XXXX"
  assignedStudentName?: string;
  assignedStudentPhone?: string;
  roomNumber?: string;
  status: 'available' | 'used' | 'revoked';
  generatedAt: string;
  usedAt?: string;
  notes?: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  category: 'urgent' | 'announcement' | 'maintenance' | 'event' | 'wifi' | 'general';
  priority: 'high' | 'normal';
  createdAt: string;
  expiryDate?: string;
  targetAudience?: 'all' | 'students' | 'public';
  postedBy?: string;
  isPinned?: boolean;
}

export interface StudentStudySession {
  id: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  mode: 'pomodoro' | 'deep_focus' | 'stopwatch' | 'manual';
  subjectOrTopic?: string;
  timestamp: string;
}

export interface StudentPrepTask {
  id: string;
  text: string;
  completed: boolean;
  category?: 'study' | 'revision' | 'hostel' | 'exam';
  createdAt: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'hours' | 'discipline' | 'exam';
  unlocked: boolean;
  unlockedAt?: string;
  requirementText: string;
}

