/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Facilities from './components/Facilities';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import RoomConfigurator from './components/RoomConfigurator';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import OwnerDashboard from './components/OwnerDashboard';
import StudentPortal from './components/StudentPortal';
import StudentDashboardModal from './components/StudentDashboardModal';
import SimulatedEmailModal from './components/SimulatedEmailModal';
import WebsiteRatingModal from './components/WebsiteRatingModal';
import NoticeBoard from './components/NoticeBoard';
import StudentVerificationModal from './components/StudentVerificationModal';
import { BookingInquiry, HostelConfig, NoticeItem } from './types';
import { parseStudentVerificationParams, StudentVerificationPayload } from './lib/verificationUtil';
import { syncSeoMetadata } from './lib/seoManager';
import {
  subscribeToHostelConfig,
  subscribeToBookings,
  subscribeToNotices,
  saveHostelConfig,
  addBookingInquiry,
  updateBookingInquiry,
  deleteBookingInquiry,
} from './lib/hostelService';

interface PreConfigType {
  roomType: 'single' | 'twin';
  tenure: string;
  addons: string[];
  totalMonthly: number;
  securityDeposit: number;
}

const DEFAULT_HOSTEL_CONFIG: HostelConfig = {
  hostelName: 'Modanwal Boys Hostel',
  caretakerName: 'Mr. Modanwal',
  phone: '+91 88879 68504',
  email: 'modanwalboyshostel@gmail.com',
  singleRoomRent: 0,
  twinRoomRent: 0,
  singleRoomDeposit: 3000,
  twinRoomDeposit: 2000,
  coolerPrice: 500,
  laundryPrice: 400,
  chairPrice: 150,
  lockerPrice: 100,
  couponCodes: ['SRMUFIRST', 'MODANWAL'],
  wifiSsid: 'Modanwal_HighSpeed_WiFi',
  wifiPassword: 'ModanwalHostel@2026',
  upiId: 'alokkumarguptabst@okaxis',
  upiName: 'Alok Kumar Gupta',
};

const SEED_BOOKINGS: BookingInquiry[] = [];

export default function App() {
  const [preConfig, setPreConfig] = useState<PreConfigType | null>(null);
  const [isOwnerOpen, setIsOwnerOpen] = useState(false);
  const [isStudentDashboardOpen, setIsStudentDashboardOpen] = useState(false);
  const [selectedStudentDashboardId, setSelectedStudentDashboardId] = useState<string | null>(null);
  const [isRateWebsiteOpen, setIsRateWebsiteOpen] = useState(false);
  const [notifiedBooking, setNotifiedBooking] = useState<BookingInquiry | null>(null);

  const handleOpenStudentDashboard = (studentId?: string) => {
    if (studentId) {
      setSelectedStudentDashboardId(studentId);
    }
    setIsStudentDashboardOpen(true);
  };

  // Theme State: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Read configurations in real-time from Firestore
  const [hostelConfig, setHostelConfig] = useState<HostelConfig>(DEFAULT_HOSTEL_CONFIG);
  useEffect(() => {
    const unsubscribe = subscribeToHostelConfig(DEFAULT_HOSTEL_CONFIG, (updatedConfig) => {
      setHostelConfig(updatedConfig);
    });
    return unsubscribe;
  }, []);

  // Dynamic SEO & Structured Data (JSON-LD) synchronization based on live host configuration
  useEffect(() => {
    syncSeoMetadata(hostelConfig);
  }, [hostelConfig]);

  // Read bookings/student records in real-time from Firestore
  const [bookings, setBookings] = useState<BookingInquiry[]>([]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mbh_bookings_seeded', 'true');
    }
    const unsubscribe = subscribeToBookings(SEED_BOOKINGS, (updatedBookings) => {
      setBookings(updatedBookings);
    });
    return unsubscribe;
  }, []);

  // Public Student Verification Modal State (Triggered when ANYONE scans student ID QR code)
  const [verificationPayload, setVerificationPayload] = useState<StudentVerificationPayload | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  useEffect(() => {
    const checkVerificationUrl = () => {
      const fullUrl = window.location.href;
      const hash = window.location.hash;
      const search = window.location.search;
      if (
        fullUrl.includes('verify=') ||
        fullUrl.includes('verify-student') ||
        fullUrl.includes('uid=MBH-') ||
        hash.includes('verify') ||
        search.includes('verify')
      ) {
        const payload = parseStudentVerificationParams(fullUrl);
        if (payload) {
          setVerificationPayload(payload);
          setIsVerificationModalOpen(true);
        }
      }
    };

    checkVerificationUrl();
    window.addEventListener('hashchange', checkVerificationUrl);
    window.addEventListener('popstate', checkVerificationUrl);
    return () => {
      window.removeEventListener('hashchange', checkVerificationUrl);
      window.removeEventListener('popstate', checkVerificationUrl);
    };
  }, []);

  // Match real student record for full profile photo & allotment validation
  const matchedVerificationStudent = React.useMemo(() => {
    if (!verificationPayload) return null;
    return (
      bookings.find(
        (b) =>
          (verificationPayload.id && b.id === verificationPayload.id) ||
          (verificationPayload.phone &&
            b.phone &&
            b.phone.replace(/[^0-9]/g, '') === verificationPayload.phone.replace(/[^0-9]/g, '')) ||
          (verificationPayload.name &&
            b.fullName &&
            b.fullName.trim().toLowerCase() === verificationPayload.name.trim().toLowerCase())
      ) || null
    );
  }, [verificationPayload, bookings]);

  // Read Notices in real-time
  const [notices, setNotices] = useState<NoticeItem[]>([
    {
      id: 'n-1',
      title: '2026-27 शैक्षणिक सत्र हेतु कमरे व स्टडी केबिन आवंटन प्रारंभ',
      content: 'SRMU एवं आसपास के कॉलेज छात्रों हेतु सिंगल और ट्विन-शेयरिंग कमरों की प्री-बुकिंग शुरू हो गई है। छात्र पोर्टल पर लॉगिन करके डिजिटल आईडी कार्ड व सुविधा विवरण देख सकते हैं।',
      category: 'announcement',
      priority: 'high',
      createdAt: 'Today',
      isPinned: true,
      postedBy: 'Caretaker'
    },
    {
      id: 'n-2',
      title: '24/7 हाई-स्पीड 5G वाई-फाई एवं लाइब्रेरी सेल्फ-स्टडी वर्कस्टेशन अपग्रेड',
      content: 'सभी फ्लोर पर नए डुअल-बैंड 5GHz राउटर्स स्थापित कर दिए गए हैं। विद्यार्थी पोर्टल में जाकर लाइव पोमोडोरो टाइमर व दैनिक स्टडी गोल ट्रैकर का उपयोग कर सकते हैं।',
      category: 'wifi',
      priority: 'normal',
      createdAt: 'This Week',
      postedBy: 'Hostel Admin'
    }
  ]);
  useEffect(() => {
    const unsubscribe = subscribeToNotices((updatedNotices) => {
      if (updatedNotices && updatedNotices.length > 0) {
        setNotices(updatedNotices);
      }
    });
    return unsubscribe;
  }, []);

  const handlePreConfigure = (config: PreConfigType) => {
    setPreConfig(config);
  };

  const handleClearPreConfig = () => {
    setPreConfig(null);
  };

  const handleBookNowScroll = () => {
    const el = document.querySelector('#contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleConfigChange = async (newConfig: HostelConfig) => {
    try {
      await saveHostelConfig(newConfig);
    } catch (err) {
      console.error('Failed to update config in Firestore:', err);
    }
  };

  const handleAddBooking = async (newInquiry: Omit<BookingInquiry, 'id' | 'timestamp'>) => {
    const bookingToAdd: BookingInquiry = {
      ...newInquiry,
      id: `b-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    };
    try {
      await addBookingInquiry(bookingToAdd);
    } catch (err) {
      console.error('Failed to add booking to Firestore:', err);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await deleteBookingInquiry(id);
    } catch (err) {
      console.error('Failed to delete booking from Firestore:', err);
    }
  };

  const handleUpdateBooking = async (updatedBooking: BookingInquiry) => {
    try {
      const existing = bookings.find(b => b.id === updatedBooking.id);
      const oldStatus = existing?.status || 'pending';
      const newStatus = updatedBooking.status || 'pending';
      const isStatusChanged = existing && oldStatus !== newStatus;

      await updateBookingInquiry(updatedBooking);

      if (isStatusChanged) {
        setNotifiedBooking(updatedBooking);
      }
    } catch (err) {
      console.error('Failed to update booking in Firestore:', err);
    }
  };

  const handleResetAll = async () => {
    try {
      await saveHostelConfig(DEFAULT_HOSTEL_CONFIG);
      // For a clean reset, delete all current bookings and recreate seeds
      for (const b of bookings) {
        await deleteBookingInquiry(b.id);
      }
      for (const seed of SEED_BOOKINGS) {
        await addBookingInquiry(seed);
      }
    } catch (err) {
      console.error('Failed to reset all data in Firestore:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 scroll-smooth selection:bg-primary-500 selection:text-white" id="root-app-container">
      {/* Sticky Header Navbar */}
      <Navbar 
        onBookNowClick={handleBookNowScroll} 
        config={hostelConfig}
        onOwnerClick={() => setIsOwnerOpen(true)}
        onStudentDashboardClick={() => handleOpenStudentDashboard()}
        onRateWebsiteClick={() => setIsRateWebsiteOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main visual sections */}
      <main id="main-content">
        {/* Header / Hero Section */}
        <Hero onBookNowClick={handleBookNowScroll} config={hostelConfig} />

        {/* About Us Section */}
        <About config={hostelConfig} />

        {/* Facilities Section */}
        <Facilities config={hostelConfig} />

        {/* Interactive Estimator / Configurator Section */}
        {!hostelConfig.hideEstimateCalculator && (
          <RoomConfigurator onPreConfigure={handlePreConfigure} config={hostelConfig} />
        )}

        {/* Testimonials Section */}
        <Testimonials config={hostelConfig} />

        {/* FAQ Section */}
        <FAQ config={hostelConfig} />

        {/* Digital Live Notice Board */}
        <NoticeBoard notices={notices} />

        {/* Student Portal & Wi-Fi Gateway Section */}
        <StudentPortal 
          config={hostelConfig} 
          bookings={bookings} 
          onOpenStudentDashboard={handleOpenStudentDashboard}
        />

        {/* Booking Form & Contact Section */}
        <ContactForm 
          preConfig={preConfig} 
          onClearPreConfig={handleClearPreConfig} 
          config={hostelConfig}
          onAddBooking={handleAddBooking}
        />
      </main>

      {/* Footer Section */}
      <Footer 
        config={hostelConfig} 
        onOwnerClick={() => setIsOwnerOpen(true)} 
        onStudentDashboardClick={() => handleOpenStudentDashboard()}
        onRateWebsiteClick={() => setIsRateWebsiteOpen(true)}
      />

      {/* Student Personal Dashboard Modal */}
      <StudentDashboardModal
        isOpen={isStudentDashboardOpen}
        onClose={() => {
          setIsStudentDashboardOpen(false);
          setSelectedStudentDashboardId(null);
        }}
        config={hostelConfig}
        bookings={bookings}
        initialStudentId={selectedStudentDashboardId}
        onUpdateBooking={handleUpdateBooking}
      />

      {/* Website Rating Modal */}
      <WebsiteRatingModal
        isOpen={isRateWebsiteOpen}
        onClose={() => setIsRateWebsiteOpen(false)}
        config={hostelConfig}
      />

      {/* Owner/Caretaker Portal Dashboard Modal */}
      <OwnerDashboard
        isOpen={isOwnerOpen}
        onClose={() => setIsOwnerOpen(false)}
        config={hostelConfig}
        onConfigChange={handleConfigChange}
        bookings={bookings}
        onAddBooking={handleAddBooking}
        onDeleteBooking={handleDeleteBooking}
        onUpdateBooking={handleUpdateBooking}
        onResetAll={handleResetAll}
        onOpenStudentDashboard={handleOpenStudentDashboard}
      />

      {/* Simulated Email Confirmation Notification */}
      <SimulatedEmailModal
        isOpen={!!notifiedBooking}
        onClose={() => setNotifiedBooking(null)}
        booking={notifiedBooking}
        config={hostelConfig}
      />

      {/* Public Student Verification Modal (Triggered by QR Code Scan by Anyone) */}
      <StudentVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setVerificationPayload(null);
          if (window.location.hash.includes('verify')) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }}
        payload={verificationPayload}
        matchedStudent={matchedVerificationStudent}
      />
    </div>
  );
}
