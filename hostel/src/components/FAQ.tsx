/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  UserCheck, 
  BookOpen, 
  Sparkles,
  PhoneCall,
  MapPin,
  Utensils
} from 'lucide-react';
import { HostelConfig } from '../types';

interface FAQProps {
  config: HostelConfig;
}

interface FAQData {
  question: string;
  answer: string;
  category: 'checkin' | 'rules' | 'finance' | 'general';
  icon: React.ComponentType<any>;
}

export default function FAQ({ config }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'checkin' | 'rules' | 'finance' | 'general'>('all');

  const faqList: FAQData[] = [
    {
      question: 'What is the check-in process?',
      answer: `Our check-in process is streamlined and hassle-free. Once your booking inquiry is confirmed, you need to:
1. Submit your government ID proof (Aadhaar/Voter ID) and college admission letter/ID card.
2. Complete the refundable onboarding security deposit payment.
3. Sign the standard rental agreement (can be done digitally or on-site).
Once done, our caretaker Alok Bhaiya will welcome you, allocate your keys, and guide you through your room amenities, Wi-Fi login credentials, and kitchen protocols.`,
      category: 'checkin',
      icon: UserCheck
    },
    {
      question: 'Are guests or parents allowed to visit?',
      answer: 'Yes! Parents, guardians, and male classmates are welcome to visit during daytime visiting hours (9:00 AM to 7:00 PM). To maintain a secure, private, and quiet study environment for all residents, female visitors and overnight stays for external guests inside student rooms are strictly prohibited. Safe lobby lounge seating is provided for all family meets.',
      category: 'rules',
      icon: ShieldCheck
    },
    {
      question: 'What is the refund policy for the security deposit?',
      answer: `Our security deposit policy is 100% fair and transparent:
• The security deposit (₹2,000 for Twin-Sharing, ₹3,000 for Single occupancy) is fully refundable.
• Upon checkout, once the room and fixtures are handed over in good condition (allowing for normal wear and tear), the full deposit is refunded directly to your bank account/UPI within 7 business days.
• No hidden maintenance fees or registration deductions are charged.`,
      category: 'finance',
      icon: CreditCard
    },
    {
      question: 'What are the hostel entry and gate timings?',
      answer: 'To guarantee absolute safety, our main gate is securely locked at 10:00 PM every night and reopens at 6:00 AM. If you have late college classes, lab submissions, or travel emergencies, you can coordinate with the on-site caretaker in advance for late-night access.',
      category: 'rules',
      icon: Clock
    },
    {
      question: 'How does the self-cooking kitchen work?',
      answer: `Our self-cooking kitchen is a highly appreciated premium feature! We provide a clean, modern kitchen space equipped with:
• Continuous supply of LPG stoves & high-quality cookware.
• Secure personal lockers/shelves to store your personal groceries, spices, and utensils.
• Purified RO drinking water and a spacious sink area.
This setup gives you the complete freedom to cook exactly what fits your taste, health, and budget, saving you over ₹3,000 to ₹4,000 monthly in mandatory mess fees.`,
      category: 'general',
      icon: Utensils
    },
    {
      question: 'How far is the hostel from SRMU and KNIT?',
      answer: `Modanwal Boys Hostel is extremely strategically located:
• For SRMU (Shri Ramswaroop Memorial University) students: We are situated in Tindola, Barabanki, just a 300-meter walk from the main gate (approximately 3 minutes walking or 1 minute on a bicycle).
• For KNIT Sultanpur: It's situated near standard transport routes, offering quick and easy local auto/bus transit.`,
      category: 'general',
      icon: MapPin
    }
  ];

  const categories = [
    { value: 'all', label: 'All Questions' },
    { value: 'checkin', label: 'Check-In & Admission' },
    { value: 'rules', label: 'Hostel Rules & Safety' },
    { value: 'finance', label: 'Rent & Refund Policy' },
    { value: 'general', label: 'Kitchen & Amenities' }
  ];

  const filteredFaqs = faqList.filter(item => 
    activeCategory === 'all' ? true : item.category === activeCategory
  );

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4" id="faq-header">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-md border border-slate-200 inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
            Common Inquiries
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-slate-600 text-sm max-w-xl mx-auto">
            Find answers to common questions about admissions, refundable security deposits, daily protocols, and self-cooking kitchen rules.
          </p>
          <div className="w-12 h-1 bg-primary-600 mx-auto rounded-full"></div>
        </div>

        {/* Categories Tab Navigation */}
        <div className="flex flex-wrap gap-2 justify-center mb-10" id="faq-category-navigation">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setActiveCategory(cat.value as any);
                setOpenIndex(null); // Reset open accordion
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                activeCategory === cat.value 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-3xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQs Accordion Grid */}
        <div className="space-y-4" id="faq-accordions-container">
          <AnimatePresence mode="wait">
            {filteredFaqs.map((faq, idx) => {
              const IconComponent = faq.icon;
              const isOpen = openIndex === idx;

              return (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-slate-50 border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isOpen ? 'border-primary-300 shadow-3xs bg-white' : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(idx)}
                    className="w-full flex items-center justify-between p-5 text-left cursor-pointer focus:outline-none transition-colors"
                  >
                    <div className="flex items-start gap-4 pr-4">
                      <span className={`p-2 rounded-xl shrink-0 transition-colors ${
                        isOpen ? 'bg-primary-50 text-primary-600' : 'bg-slate-200/60 text-slate-500'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </span>
                      <span className="font-display font-bold text-slate-900 text-sm sm:text-base pt-1">
                        {faq.question}
                      </span>
                    </div>
                    <span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-slate-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-5 pb-5 pt-1 pl-15 border-t border-slate-100">
                          <p className="font-sans text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Help CTA Box */}
        <div className="mt-12 bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6" id="faq-support-box">
          <div className="space-y-1.5 text-center sm:text-left">
            <h4 className="font-display font-bold text-slate-900 text-sm flex items-center justify-center sm:justify-start gap-1.5">
              <BookOpen className="w-4 h-4 text-primary-600" />
              Have more questions about admissions?
            </h4>
            <p className="text-[11px] text-slate-500 max-w-md">
              Our caretaker is always available to assist parents and students with pricing packages, custom plans, and on-site visits.
            </p>
          </div>
          <a
            href={`tel:${config.phone}`}
            className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-sans font-bold px-5 py-2.5 rounded-full text-xs shadow-3xs transition-all cursor-pointer whitespace-nowrap"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Caretaker</span>
          </a>
        </div>

      </div>
    </section>
  );
}
