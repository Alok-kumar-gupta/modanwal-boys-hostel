/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle, Clock, Send, MessageSquare, ShieldCheck, Sparkles, HelpCircle, ChevronDown, ChevronUp, DollarSign, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HostelConfig, BookingInquiry } from '../types';

interface PreConfigType {
  roomType: 'single' | 'twin';
  tenure: string;
  addons: string[];
  totalMonthly: number;
  securityDeposit: number;
}

interface ContactFormProps {
  preConfig: PreConfigType | null;
  onClearPreConfig: () => void;
  config: HostelConfig;
  onAddBooking: (booking: BookingInquiry) => void;
}

export default function ContactForm({ preConfig, onClearPreConfig, config, onAddBooking }: ContactFormProps) {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [roomType, setRoomType] = useState<'single' | 'twin'>(preConfig ? preConfig.roomType : 'single');
  const [studyYear, setStudyYear] = useState('1st Year');
  const [checkInDate, setCheckInDate] = useState('');
  const [notes, setNotes] = useState('');
  const [inquiryType, setInquiryType] = useState<'book' | 'visit' | 'question'>('book');

  // Interactive FAQ State
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);

  // QR Payment Widget State
  const [payType, setPayType] = useState<'deposit' | 'rent'>('deposit');
  const [payRoom, setPayRoom] = useState<'single' | 'twin'>('single');
  const [payStudentName, setPayStudentName] = useState('');
  const [payStudentPhone, setPayStudentPhone] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  // Preset amount based on selection
  const presetAmount = payType === 'deposit'
    ? (payRoom === 'single' ? (config.singleRoomDeposit ?? 3000) : (config.twinRoomDeposit ?? 2000))
    : (payRoom === 'single' ? (config.singleRoomRent || 4500) : (config.twinRoomRent || 3000));

  const activeAmount = customAmount ? parseFloat(customAmount) || presetAmount : presetAmount;
  const paymentNote = `${payStudentName || 'Student'} ${payType === 'deposit' ? 'Dep' : 'Rent'} ${payRoom === 'single' ? 'Sing' : 'Twin'}`.slice(0, 30);

  // UPI deep link
  const finalUpiId = config.upiId || 'alokkumarguptabst@okaxis';
  const finalUpiName = config.upiName || 'Alok Kumar Gupta';
  const upiUrl = `upi://pay?pa=${encodeURIComponent(finalUpiId)}&pn=${encodeURIComponent(finalUpiName)}&am=${activeAmount}&tn=${encodeURIComponent(paymentNote)}&cu=INR`;
  const paymentQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`;

  // Caretaker WhatsApp message link for payment confirmation
  const whatsappPaymentUrl = (() => {
    let text = `Hello ${config.hostelName}! I am confirming a payment.%0A%0A`;
    text += `*Payment Details:*%0A`;
    text += `• *Student Name:* ${payStudentName || 'Not specified'}%0A`;
    text += `• *Student Phone:* ${payStudentPhone || 'Not specified'}%0A`;
    text += `• *Payment Type:* ${payType === 'deposit' ? 'SECURITY DEPOSIT' : 'MONTHLY RENT'}%0A`;
    text += `• *Room Type:* ${payRoom === 'single' ? 'Single Occupancy' : 'Twin Sharing'}%0A`;
    text += `• *Amount Paid:* ₹${activeAmount}%0A`;
    text += `• *Transaction Note:* ${paymentNote}%0A%0A`;
    text += `I have scanned the QR code and paid. Please verify and issue my receipt!`;

    const rawPhone = config.phone.replace(/[^0-9]/g, '');
    const formattedPhone = rawPhone.length === 10 ? '91' + rawPhone : rawPhone;
    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${text}`;
  })();

  // Submission State
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [formError, setFormError] = useState('');

  // Local QR Hide/Unhide options
  const [isMainQrHidden, setIsMainQrHidden] = useState(false);
  const [isSuccessQrHidden, setIsSuccessQrHidden] = useState(false);

  // Sync state if pre-configured
  useState(() => {
    if (preConfig) {
      setRoomType(preConfig.roomType);
    }
  });

  const faqs = [
    {
      q: config.faq1Question || `Is there a mess compulsion at ${config.hostelName}?`,
      a: config.faq1Answer || 'Absolutely not! This is our key benefit. We provide a fully functional, pristine Self-Cooking Kitchen. You are free to cook your own meals, which keeps your food fresh, tailored to your diet, and saves you over ₹3,000 monthly compared to standard mandatory mess charges.'
    },
    {
      q: config.faq2Question || 'How far is the hostel from Shri Ramswaroop Memorial University (SRMU)?',
      a: config.faq2Answer || 'We are exceptionally close! The hostel is situated in Tindola, Barabanki, just about 300 meters from the SRMU main entrance. It is a quick 3-minute walk or a 1-minute cycle ride, allowing you to easily return for lunch or rest between classes.'
    },
    {
      q: config.faq3Question || 'What is included in the monthly rent?',
      a: config.faq3Answer || 'Your rent covers your furnished room stay, unlimited 24/7 high-speed Wi-Fi, 24*7 power backup, daily room and washroom housekeeping services, fully-equipped self-cooking kitchen access, round-the-clock security and CCTV monitoring.'
    },
    {
      q: config.faq4Question || 'Is there a security deposit, and is it refundable?',
      a: config.faq4Answer || `Yes, we charge a security deposit of ₹${config.twinRoomDeposit ?? 2000} (for Twin-Sharing) and ₹${config.singleRoomDeposit ?? 3000} (for Single). This deposit is 100% refundable immediately within 7 days of lease completion, with absolute transparency and zero unfair deductions.`
    },
    {
      q: 'Are visitors/parents allowed inside the hostel?',
      a: 'Parents and male guardians are welcome to visit during daytime hours (9:00 AM to 7:00 PM). For safety reasons, overnight stays for guests are not allowed inside students rooms. We have a cozy lobby lounge for visitors.'
    },
    {
      q: 'What are the hostel gate timings?',
      a: 'To guarantee absolute safety, our main gate is secured and locked at 10:00 PM every night and reopens at 6:00 AM. Exceptions are made for official academic classes, college events, or emergencies, with prior notice to the caretaker.'
    }
  ];

  const toggleFaq = (idx: number) => {
    setFaqOpenIndex(faqOpenIndex === idx ? null : idx);
  };

  const getWhatsAppLinkForInquiry = (data: BookingInquiry | null) => {
    if (!data) return '#';
    
    let text = `Hello ${config.hostelName}! I am interested in booking a room.%0A%0A`;
    text += `*Details:*%0A`;
    text += `• *Name:* ${data.fullName}%0A`;
    text += `• *Phone:* ${data.phone}%0A`;
    text += `• *Email:* ${data.email}%0A`;
    text += `• *Year of Study:* ${data.studyYear}%0A`;
    text += `• *Check-in Date:* ${data.checkInDate}%0A`;
    text += `• *Inquiry Type:* ${data.inquiryType ? data.inquiryType.toUpperCase() : 'BOOKING'}%0A`;
    text += `• *Room Selected:* ${data.roomType === 'single' ? 'Single Room' : 'Twin-Sharing Room'}%0A`;
    
    if (preConfig) {
      text += `%0A*Estimator Configuration:*%0A`;
      text += `• *Tenure Plan:* ${preConfig.tenure}%0A`;
      if (preConfig.addons.length > 0) {
        text += `• *Upgrades:* ${preConfig.addons.join(', ')}%0A`;
      }
      text += `• *Estimated Rent:* ₹${preConfig.totalMonthly}/month%0A`;
      text += `• *Deposit:* ₹${preConfig.securityDeposit}%0A`;
    }

    if (data.notes && data.notes !== 'None') {
      text += `%0A*Additional Notes:* ${data.notes}%0A`;
    }

    const rawPhone = config.phone.replace(/[^0-9]/g, '');
    const formattedPhone = rawPhone.length === 10 ? '91' + rawPhone : rawPhone;
    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${text}`;
  };

  const getWhatsAppLink = () => {
    return getWhatsAppLinkForInquiry(submittedData);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!fullName || !phone) {
      setFormError('Please fill out your Name and Phone Number.');
      return;
    }

    const formattedInquiry: BookingInquiry = {
      fullName,
      phone,
      email: email || 'No email provided',
      roomType: preConfig ? preConfig.roomType : roomType,
      studyYear,
      checkInDate: checkInDate || 'Immediately',
      notes: notes || 'None',
      addons: preConfig ? preConfig.addons : [],
      inquiryType: inquiryType === 'book' ? 'prebook' : inquiryType === 'visit' ? 'visit' : 'ask',
      configuredEstimate: preConfig ? preConfig.totalMonthly : null,
    };

    onAddBooking(formattedInquiry);
    setSubmittedData(formattedInquiry);
    setIsSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 bg-white relative">
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-slate-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main CTA Block (Highlighted Exact Text Required by User) */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-800 mb-16 text-center space-y-6" id="required-cta-banner">
          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 uppercase tracking-widest inline-block">
            Secure Your Stay Today
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl max-w-4xl mx-auto leading-snug">
            Book Your Room Now and secure your spot in our premium living space today.
          </h2>
          <p className="font-sans text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Contact us via phone or email for inquiries. Visit our website to view virtual tours or schedule a physical visit. We are waiting to welcome you near SRMU!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={`tel:${config.phone.replace(/[^0-9]/g, '')}`}
              className="bg-white hover:bg-slate-100 text-slate-950 font-sans font-bold px-6 py-3.5 rounded-full shadow-sm transition-all text-sm flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call: {config.phone}</span>
            </a>
            <a
              href={`mailto:${config.email}`}
              className="bg-slate-900 hover:bg-slate-800 text-white font-sans font-semibold px-6 py-3.5 rounded-full border border-slate-800 transition-all text-sm flex items-center gap-2"
            >
              <Mail className="w-4 h-4 text-primary-400" />
              <span>Email Caretaker</span>
            </a>
          </div>
        </div>

        {/* Form and FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" id="form-faq-grid">
          
          {/* Booking / Inquiry Form Panel */}
          <div className="lg:col-span-7 bg-slate-50/50 rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6" id="form-card">
            
            <div className="border-b border-slate-100 pb-5">
              <h3 className="font-display font-bold text-2xl text-slate-950">Direct Booking & Inquiry Form</h3>
              <p className="text-xs text-slate-500 mt-1">Submit your details. It takes less than 2 minutes.</p>
            </div>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="booking-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleFormSubmit}
                  className="space-y-5"
                >
                  
                  {/* Showing Pre-configured parameters from Rent Calculator if available */}
                  {preConfig && (
                    <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                          <span>Pre-configured Estimate Applied!</span>
                        </span>
                        <p className="text-xs text-slate-600">
                          Selected {preConfig.roomType === 'single' ? 'Single (1-Seater)' : 'Twin-Sharing (2-Seater)'} • {preConfig.tenure} • Estimated Rent: <strong>₹{preConfig.totalMonthly}/mo</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onClearPreConfig}
                        className="text-[10px] font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 px-2 py-1 rounded-md cursor-pointer"
                      >
                        Reset Config
                      </button>
                    </div>
                  )}

                  {/* Inquiry Type Select */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      I want to...
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'book', label: 'Book Room' },
                        { id: 'visit', label: 'Schedule Visit' },
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setInquiryType(type.id as any)}
                          className={`py-2.5 px-2 rounded-xl text-xs font-semibold text-center border-2 transition-all cursor-pointer ${
                            inquiryType === type.id
                              ? 'border-slate-900 bg-white text-slate-950 font-bold'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name and Phone Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        placeholder="e.g. Alok Kumar Gupta"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Mobile Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        placeholder="e.g. +91 88879 68504"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Email & Year of Study */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Email Address (Optional)
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="e.g. student@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="studyYear" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Academic Year of Study
                      </label>
                      <select
                        id="studyYear"
                        value={studyYear}
                        onChange={(e) => setStudyYear(e.target.value)}
                        className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                      >
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                        <option>PG / Post-Graduate</option>
                        <option>Other / Preparing</option>
                      </select>
                    </div>
                  </div>

                  {/* Checking Room Type and Date if NOT Pre-Configured */}
                  {!preConfig && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Preferred Room
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setRoomType('single')}
                            className={`py-2.5 px-3 rounded-xl text-xs font-semibold text-center border-2 transition-all cursor-pointer ${
                              roomType === 'single'
                                ? 'border-slate-900 bg-white text-slate-950 font-bold'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-500'
                            }`}
                          >
                            Single Seater
                          </button>
                          <button
                            type="button"
                            onClick={() => setRoomType('twin')}
                            className={`py-2.5 px-3 rounded-xl text-xs font-semibold text-center border-2 transition-all cursor-pointer ${
                              roomType === 'twin'
                                ? 'border-slate-900 bg-white text-slate-950 font-bold'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-500'
                            }`}
                          >
                            Twin Sharing
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="checkInDate" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Tentative Check-In Date
                        </label>
                        <input
                          id="checkInDate"
                          type="date"
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                        />
                      </div>
                    </div>
                  )}

                  {/* Notes Area */}
                  <div className="space-y-2">
                    <label htmlFor="notes" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Additional Message or Specific Queries
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      placeholder="e.g. Any dietary questions, roommate preferences, or requesting special parking slots..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                    ></textarea>
                  </div>

                  {formError && (
                    <p className="text-xs font-bold text-rose-600 pl-1">{formError}</p>
                  )}

                  {/* Submit Button (Includes direct Call to Action) */}
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold py-4 px-6 rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    id="submit-form-btn"
                  >
                    <Send className="w-4 h-4 text-primary-400" />
                    <span>Submit Your Booking Details Now</span>
                  </button>

                  <div className="flex items-center gap-2 justify-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pt-2 border-t border-slate-200">
                    <ShieldCheck className="w-4 h-4 text-slate-800" />
                    <span>Direct caretaker reservation channel • No brokerage fees</span>
                  </div>

                </motion.form>
              ) : (
                // Success screen with dynamic receipt & WhatsApp redirect
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-6 border-2 border-slate-900 shadow-sm space-y-6 text-center"
                  id="success-receipt"
                >
                  <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center border border-slate-200">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  
                  <div>
                    <h4 className="font-display font-bold text-2xl text-slate-950">Inquiry Proposal Generated!</h4>
                    <p className="text-xs text-slate-500 mt-1">Thank you, {submittedData.fullName}. Your choices have been formatted.</p>
                  </div>

                  {/* Live Receipt summary box */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left text-xs space-y-2 text-slate-700">
                    <div className="flex justify-between border-b border-slate-200/50 pb-2">
                      <span className="font-bold text-slate-800 uppercase tracking-widest text-[9px]">Itemized Selection</span>
                      <span className="text-primary-600 font-semibold">{submittedData.studyYear} Student</span>
                    </div>
                    <p>• <strong>Name:</strong> {submittedData.fullName}</p>
                    <p>• <strong>Phone:</strong> {submittedData.phone}</p>
                    <p>• <strong>Room Choice:</strong> {submittedData.roomType === 'single' ? 'Single Room (1-Seater)' : 'Twin-Sharing (2-Seater)'}</p>
                    <p>• <strong>Date Needed:</strong> {submittedData.checkInDate}</p>
                    {preConfig && (
                      <div className="border-t border-slate-200/50 pt-2 text-slate-800 font-semibold">
                        <p>• <strong>Estimate Total Rent:</strong> ₹{preConfig.totalMonthly}/mo</p>
                        <p>• <strong>Onboarding Security Deposit:</strong> ₹{preConfig.securityDeposit}</p>
                      </div>
                    )}
                  </div>

                  {/* Instant Security Deposit QR Pre-Payment */}
                  {!config.hidePaymentQrCode && (
                    <div className="border border-dashed border-emerald-300 rounded-2xl bg-emerald-50/40 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-1.5 border-b border-emerald-100 pb-2">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-4.5 h-4.5 text-emerald-600" />
                          <h5 className="font-display font-bold text-sm text-slate-900">Lock in Your Bed Reservation</h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsSuccessQrHidden(!isSuccessQrHidden)}
                          className="flex items-center gap-1 text-[9px] font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 py-1 px-2 rounded-lg cursor-pointer transition-all"
                        >
                          {isSuccessQrHidden ? (
                            <>
                              <Eye className="w-3 h-3 text-slate-500" />
                              <span>Unhide QR</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-slate-500" />
                              <span>Hide QR</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 max-w-sm mx-auto">
                        Scan the QR Code below to pay the refundable onboarding security deposit of <strong>₹{preConfig ? preConfig.securityDeposit : (submittedData.roomType === 'single' ? (config.singleRoomDeposit ?? 3000) : (config.twinRoomDeposit ?? 2000))}</strong> directly to our caretaker via UPI to instantly secure your allocation!
                      </p>
                      
                      {isSuccessQrHidden ? (
                        <div className="w-full bg-white border border-dashed border-slate-200 rounded-xl py-6 px-3 flex flex-col items-center justify-center space-y-1.5 my-2">
                          <EyeOff className="w-6 h-6 text-slate-300" />
                          <p className="text-[10px] font-semibold text-slate-500">QR Code is hidden</p>
                          <button
                            type="button"
                            onClick={() => setIsSuccessQrHidden(false)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold rounded-md text-[9px] cursor-pointer"
                          >
                            Show QR Code
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-xs inline-block">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                                `upi://pay?pa=${encodeURIComponent(config.upiId || 'alokkumarguptabst@okaxis')}&pn=${encodeURIComponent(config.upiName || 'Alok Kumar Gupta')}&am=${
                                  preConfig ? preConfig.securityDeposit : (submittedData.roomType === 'single' ? (config.singleRoomDeposit ?? 3000) : (config.twinRoomDeposit ?? 2000))
                                }&tn=${encodeURIComponent(`Deposit for ${submittedData.fullName}`.slice(0, 20))}&cu=INR`
                              )}`}
                              alt="Security Deposit Payment QR"
                              className="w-32 h-32 object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="text-[10px] text-slate-600 font-semibold">
                            UPI Payee: {config.upiName || 'Alok Kumar Gupta'}
                          </div>
                        </>
                      )}

                      <a
                        href={`https://api.whatsapp.com/send?phone=${
                          config.phone.replace(/[^0-9]/g, '').length === 10 ? '91' + config.phone.replace(/[^0-9]/g, '') : config.phone.replace(/[^0-9]/g, '')
                        }&text=Hello ${config.hostelName}! I have submitted my booking and paid the security deposit of ₹${
                          preConfig ? preConfig.securityDeposit : (submittedData.roomType === 'single' ? (config.singleRoomDeposit ?? 3000) : (config.twinRoomDeposit ?? 2000))
                        } via UPI. Please confirm my reservation!`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold px-4 py-2 rounded-full text-[11px] shadow-sm transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Confirm Deposit Paid on WhatsApp</span>
                      </a>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 leading-normal">
                    <strong>Thank you!</strong> Your inquiry details have been saved successfully. Our caretaker will review your request and get back to you shortly.
                  </p>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false);
                        onClearPreConfig();
                      }}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold py-3.5 px-4 rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* FAQs Accordion Panel (Right Column) */}
          <div className="lg:col-span-5 bg-white space-y-6" id="faq-card">
            
            <div className="border-b border-slate-150 pb-5">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-5 h-5 text-slate-800" />
                <h3 className="font-display font-bold text-2xl text-slate-950">Frequently Asked Questions</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">Clear answers regarding gate, meals, and payment policy</p>
            </div>

            <div className="space-y-3" id="faq-accordion-list">
              {faqs.map((faq, index) => {
                const isOpen = faqOpenIndex === index;
                return (
                  <div
                    key={index}
                    className={`rounded-2xl border transition-all ${
                      isOpen
                        ? 'border-slate-400 bg-slate-50/50'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    {/* Header trigger */}
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-4 font-display font-bold text-sm sm:text-base text-slate-800 text-left focus:outline-none cursor-pointer"
                      id={`faq-trigger-${index}`}
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-900 flex-shrink-0 ml-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                      )}
                    </button>

                    {/* Content pane */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                          id={`faq-pane-${index}`}
                        >
                          <p className="px-4 pb-4 pt-1 font-sans text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/50">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Direct UPI Scan & Pay QR Code Card */}
            {!config.hidePaymentQrCode && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 space-y-5 mt-6" id="upi-payment-card">
                <div className="border-b border-slate-150 pb-4 flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </span>
                      <h3 className="font-display font-bold text-lg text-slate-950">Scan & Pay Rent / Deposit</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Pay instantly via any UPI app (Google Pay, PhonePe, Paytm, BHIM)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMainQrHidden(!isMainQrHidden)}
                    className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-slate-800 transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer border border-slate-200 bg-white shadow-3xs"
                    title={isMainQrHidden ? "Show QR Code" : "Hide QR Code"}
                  >
                    {isMainQrHidden ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Unhide QR</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide QR</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Selection Tab for Payment Type */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPayType('deposit');
                        setCustomAmount('');
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold text-center border-2 transition-all cursor-pointer ${
                        payType === 'deposit'
                          ? 'border-emerald-600 bg-white text-emerald-700 font-extrabold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      Security Deposit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPayType('rent');
                        setCustomAmount('');
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold text-center border-2 transition-all cursor-pointer ${
                        payType === 'rent'
                          ? 'border-emerald-600 bg-white text-emerald-700 font-extrabold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      Monthly Rent
                    </button>
                  </div>

                  {/* Sub-Selection: Single or Twin sharing presets */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayRoom('single')}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold text-center border transition-all cursor-pointer ${
                        payRoom === 'single'
                          ? 'border-slate-800 bg-slate-950 text-white font-bold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-500'
                      }`}
                    >
                      Single Occupancy
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayRoom('twin')}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold text-center border transition-all cursor-pointer ${
                        payRoom === 'twin'
                          ? 'border-slate-800 bg-slate-950 text-white font-bold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-500'
                      }`}
                    >
                      Twin Sharing
                    </button>
                  </div>
                </div>

                {/* Name & Phone inputs so caretaker knows who paid */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="payStudentName" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Student Name</label>
                      <input
                        id="payStudentName"
                        type="text"
                        placeholder="e.g. Amit Kumar"
                        value={payStudentName}
                        onChange={(e) => setPayStudentName(e.target.value)}
                        className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label htmlFor="payStudentPhone" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Student Phone</label>
                      <input
                        id="payStudentPhone"
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={payStudentPhone}
                        onChange={(e) => setPayStudentPhone(e.target.value)}
                        className="w-full bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Amount field */}
                  <div>
                    <label htmlFor="customAmount" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Amount to Pay (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                      <input
                        id="customAmount"
                        type="number"
                        placeholder={presetAmount.toString()}
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full bg-white pl-6 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 pl-0.5">
                      Leave blank to use the default preset of <strong>₹{presetAmount}</strong> for {payRoom === 'single' ? 'Single Room' : 'Twin Sharing'} {payType === 'deposit' ? 'deposit' : 'rent'}.
                    </p>
                  </div>
                </div>

                {/* Generated QR Code display */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 shadow-xs">
                  {isMainQrHidden ? (
                    <div className="w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl py-8 px-4 flex flex-col items-center justify-center space-y-2">
                      <EyeOff className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-semibold text-slate-600">QR Code is hidden</p>
                      <button
                        type="button"
                        onClick={() => setIsMainQrHidden(false)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold rounded-lg text-[10px] shadow-xs cursor-pointer transition-all"
                      >
                        Show QR Code
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-center">
                        <img
                          src={paymentQrUrl}
                          alt="UPI Scan to Pay QR Code"
                          className="w-40 h-40 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Scan to Pay: ₹{activeAmount}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">UPI Payee: {config.upiName || 'Alok Kumar Gupta'}</p>
                        <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1.5 font-mono max-w-full truncate">
                          Note: {paymentNote}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Notify Caretaker Button */}
                <a
                  href={whatsappPaymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold py-2.5 px-4 rounded-full text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Confirm Payment via WhatsApp</span>
                </a>
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
}
