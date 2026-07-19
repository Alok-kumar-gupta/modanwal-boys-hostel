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
  id: 'single' | 'twin';
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
  roomType: 'single' | 'twin';
  studyYear: string;
  checkInDate: string;
  customNotes?: string;
  notes?: string;
  addons: string[];
  inquiryType?: 'prebook' | 'ask' | 'visit';
  configuredEstimate?: number | null;
  timestamp?: string;

  // Student Record Management & Status fields
  status?: 'pending' | 'approved' | 'rejected';
  roomNumber?: string;
  monthlyRentAmount?: number;
  documents?: { name: string; base64: string }[];
  rentStatus?: 'paid' | 'pending';
  lastRentNoticeDate?: string;
  parentPhone?: string;
  hometown?: string;
  paidDeposit?: number;
  dues?: number;
  paymentHistory?: PaymentRecord[];
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
  singleRoomRent: number;
  twinRoomRent: number;
  singleRoomDeposit: number;
  twinRoomDeposit: number;
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
  hideMainUniqueFeature?: boolean;
  hideEstimateCalculator?: boolean;
  hidePaymentQrCode?: boolean;
  
  // Room Occupancy / Booking Status (Room Full / Booking Open requested by user)
  isSingleFull?: boolean;
  isTwinFull?: boolean;

  // Admissions & Inclusion Customization
  admissionsText?: string;
  facilityInclusionText?: string;
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
}

