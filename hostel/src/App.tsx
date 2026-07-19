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
import VirtualTour from './components/VirtualTour';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import OwnerDashboard from './components/OwnerDashboard';
import StudentPortal from './components/StudentPortal';
import SimulatedEmailModal from './components/SimulatedEmailModal';
import { BookingInquiry, HostelConfig } from './types';
import {
  subscribeToHostelConfig,
  subscribeToBookings,
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

const SEED_BOOKINGS: BookingInquiry[] = [
  {
    id: 'b-1',
    fullName: 'Alok Kumar Gupta',
    phone: '8887968504',
    email: 'alokkumarguptabst@gmail.com',
    roomType: 'single',
    studyYear: '3rd Year',
    checkInDate: '2026-08-01',
    notes: 'Requesting a room on the second floor near the Wi-Fi router. I will cook my own food.',
    addons: ['Desert Air Cooler (for Summer)', 'Ergonomic Desk Chair Upgrade'],
    inquiryType: 'prebook',
    configuredEstimate: 4450,
    timestamp: '2026-07-18 10:15 AM',
    status: 'approved',
    roomNumber: 'Room 101',
    monthlyRentAmount: 4450,
    rentStatus: 'paid',
    lastRentNoticeDate: '2026-07-10',
    documents: [
      { name: 'Aadhar Card (आधार कार्ड)', base64: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23eee"/><text x="10" y="50" font-family="sans-serif" font-size="10" fill="%23555">Demo Aadhar ID</text></svg>' }
    ]
  },
  {
    id: 'b-2',
    fullName: 'Rohit Mishra',
    phone: '9450302839',
    email: 'rohitmishra@srmu.edu',
    roomType: 'twin',
    studyYear: '1st Year',
    checkInDate: '2026-07-25',
    notes: 'Just completed admission at SRMU in B.Tech CS. Want twin sharing with roommate who is serious about studies.',
    addons: ['Housekeeping Laundry Care'],
    inquiryType: 'prebook',
    configuredEstimate: 3000,
    timestamp: '2026-07-17 04:32 PM',
    status: 'pending',
    roomNumber: '',
    monthlyRentAmount: 3000,
    rentStatus: 'pending'
  },
  {
    id: 'b-3',
    fullName: 'Amit Kumar Sen',
    phone: '8293049201',
    email: 'amit.sen.99@gmail.com',
    roomType: 'single',
    studyYear: '2nd Year',
    checkInDate: '2026-08-05',
    notes: 'Would like to visit the hostel physically before finalizing. Is parking space available for my bicycle?',
    addons: [],
    inquiryType: 'visit',
    timestamp: '2026-07-16 11:20 AM',
    status: 'pending'
  }
];

export default function App() {
  const [preConfig, setPreConfig] = useState<PreConfigType | null>(null);
  const [isOwnerOpen, setIsOwnerOpen] = useState(false);
  const [notifiedBooking, setNotifiedBooking] = useState<BookingInquiry | null>(null);

  // Read configurations in real-time from Firestore
  const [hostelConfig, setHostelConfig] = useState<HostelConfig>(DEFAULT_HOSTEL_CONFIG);
  useEffect(() => {
    const unsubscribe = subscribeToHostelConfig(DEFAULT_HOSTEL_CONFIG, (updatedConfig) => {
      setHostelConfig(updatedConfig);
    });
    return unsubscribe;
  }, []);

  // Read bookings/student records in real-time from Firestore
  const [bookings, setBookings] = useState<BookingInquiry[]>([]);
  useEffect(() => {
    const unsubscribe = subscribeToBookings(SEED_BOOKINGS, (updatedBookings) => {
      setBookings(updatedBookings);
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
    <div className="min-h-screen bg-white font-sans text-gray-900 scroll-smooth selection:bg-primary-500 selection:text-white" id="root-app-container">
      {/* Sticky Header Navbar */}
      <Navbar 
        onBookNowClick={handleBookNowScroll} 
        config={hostelConfig}
        onOwnerClick={() => setIsOwnerOpen(true)}
      />

      {/* Main visual sections */}
      <main id="main-content">
        {/* Header / Hero Section */}
        <Hero onBookNowClick={handleBookNowScroll} config={hostelConfig} />

        {/* About Us Section */}
        <About config={hostelConfig} />

        {/* Facilities Section */}
        <Facilities config={hostelConfig} />

        {/* Testimonials Section */}
        <Testimonials config={hostelConfig} />

        {/* FAQ Section */}
        <FAQ config={hostelConfig} />

        {/* Interactive Estimator / Configurator Section */}
        {!hostelConfig.hideEstimateCalculator && (
          <RoomConfigurator onPreConfigure={handlePreConfigure} config={hostelConfig} />
        )}

        {/* Virtual Tour Section */}
        <VirtualTour config={hostelConfig} />

        {/* Student Portal & Wi-Fi Gateway Section */}
        <StudentPortal config={hostelConfig} bookings={bookings} />

        {/* Booking Form + FAQ Section */}
        <ContactForm 
          preConfig={preConfig} 
          onClearPreConfig={handleClearPreConfig} 
          config={hostelConfig}
          onAddBooking={handleAddBooking}
        />
      </main>

      {/* Footer Section */}
      <Footer config={hostelConfig} onOwnerClick={() => setIsOwnerOpen(true)} />

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
      />

      {/* Simulated Email Confirmation Notification */}
      <SimulatedEmailModal
        isOpen={!!notifiedBooking}
        onClose={() => setNotifiedBooking(null)}
        booking={notifiedBooking}
        config={hostelConfig}
      />
    </div>
  );
}
