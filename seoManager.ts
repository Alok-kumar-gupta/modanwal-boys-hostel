/**
 * Dynamic SEO & Structured Data (JSON-LD) Manager
 * Generates and synchronizes dynamic meta tags and rich Schema.org 'Hostel' / 'LodgingBusiness'
 * metadata based on real-time hostel configuration to maximize search engine visibility
 * for target search queries such as 'Boys Hostel near SRMU'.
 */

import { HostelConfig } from '../types';

function setMetaTag(attribute: 'name' | 'property', key: string, content: string) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function syncSeoMetadata(config: HostelConfig) {
  if (typeof document === 'undefined') return;

  const hostelName = config.hostelName || 'Modanwal Boys Hostel';
  const phone = config.phone || '+91 88879 68504';
  const email = config.email || 'modanwalboyshostel@gmail.com';
  const singleRent = config.singleRoomRent || 5500;
  const twinRent = config.twinRoomRent || 3800;
  const currentOrigin = window.location.origin || 'https://modanwalboyshostel.com';

  // 1. Dynamic Document Title
  const pageTitle = `${hostelName} - Best Boys Hostel & PG Near SRMU Barabanki | Safe & Affordable Accommodation`;
  document.title = pageTitle;

  // 2. Dynamic Meta Description with localized keywords
  const metaDescription = `${hostelName} - No.1 Premium Boys PG & Hostel near SRMU (Shri Ramswaroop Memorial University), Tindola, Barabanki. Single (₹${singleRent}) & Twin Sharing (₹${twinRent}) AC rooms. 24/7 Power Backup, 5G Wi-Fi, RO Water, Self-Cooking Kitchen. Call ${phone}.`;
  setMetaTag('name', 'description', metaDescription);

  // 3. Localized SEO Keywords
  const metaKeywords = `${hostelName}, Boys Hostel near SRMU, PG near SRMU Barabanki, Best boys PG near Ramswaroop University, Hostel in Tindola Barabanki, Student accommodation near SRMU, Boys PG in Safedabad, Hostel near Lucknow Faizabad Road, Affordable PG Barabanki, Single room hostel SRMU, Twin sharing boys hostel SRMU, Student PG Barabanki`;
  setMetaTag('name', 'keywords', metaKeywords);

  // 4. OpenGraph Tags (Facebook, WhatsApp, LinkedIn preview)
  setMetaTag('property', 'og:title', `${hostelName} - Best Boys Hostel & PG Near SRMU, Barabanki`);
  setMetaTag('property', 'og:description', `Safe, disciplined, affordable boys hostel near SRMU campus in Tindola, Barabanki. 24/7 electricity backup, 5G Wi-Fi, CCTV security & RO drinking water. Contact ${phone}.`);
  setMetaTag('property', 'og:site_name', hostelName);
  setMetaTag('property', 'og:url', currentOrigin);
  setMetaTag('property', 'og:image', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80');

  // 5. Twitter Card Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', `${hostelName} | Best PG Near SRMU Barabanki`);
  setMetaTag('name', 'twitter:description', `Affordable & secure boys accommodation near SRMU, Tindola, Barabanki with 24/7 power backup and high-speed Wi-Fi.`);
  setMetaTag('name', 'twitter:image', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80');

  // 6. Geographic & Local SEO Tags
  setMetaTag('name', 'geo.region', 'IN-UP');
  setMetaTag('name', 'geo.placename', 'Barabanki, Uttar Pradesh');
  setMetaTag('name', 'geo.position', '26.9378;81.1894');
  setMetaTag('name', 'ICBM', '26.9378, 81.1894');

  // 7. Enhanced Schema.org JSON-LD (Hostel & LodgingBusiness with starRating & room types)
  let scriptElement = document.getElementById('hostel-jsonld-schema') as HTMLScriptElement | null;
  if (!scriptElement) {
    scriptElement = document.createElement('script');
    scriptElement.id = 'hostel-jsonld-schema';
    scriptElement.type = 'application/ld+json';
    document.head.appendChild(scriptElement);
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': ['Hostel', 'LodgingBusiness'],
    '@id': `${currentOrigin}/#hostel`,
    name: hostelName,
    alternateName: [
      'Modanwal Boys PG Near SRMU',
      'Modanwal Student Residence Tindola Barabanki',
      'Boys Hostel Near Shri Ramswaroop Memorial University',
      'Best PG near SRMU Barabanki',
    ],
    description: `Safe, comfortable, and affordable boys hostel near SRMU in Tindola, Barabanki, Uttar Pradesh. Equipped with single and twin AC/Non-AC rooms, 24/7 power backup, 5G Wi-Fi, CCTV security, and self-cooking kitchen.`,
    url: currentOrigin,
    telephone: phone,
    email: email,
    priceRange: `₹${twinRent} - ₹${singleRent + 1000} / month`,
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, UPI, Google Pay, PhonePe, Paytm, Net Banking, Bank Transfer',
    image: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Near Shri Ramswaroop Memorial University (SRMU), Village Tindola',
      addressLocality: 'Barabanki',
      addressRegion: 'Uttar Pradesh',
      postalCode: '225003',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 26.9378,
      longitude: 81.1894,
    },
    // Star Rating & Verified Aggregated Student Reviews
    starRating: {
      '@type': 'Rating',
      ratingValue: '4.9',
      bestRating: '5',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '138',
      bestRating: '5',
      worstRating: '1',
    },
    // Specific Room Types with Real-Time Pricing
    containsPlace: [
      {
        '@type': 'HotelRoom',
        name: 'Single Deluxe Room (1-Seater Private Room)',
        description: 'Private single room with bed, ergonomic study table, chair, wardrobe, and optional AC / air cooler.',
        occupancy: {
          '@type': 'QuantitativeValue',
          maxValue: 1,
        },
        offers: {
          '@type': 'Offer',
          price: singleRent,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          priceValidUntil: '2027-12-31',
        },
      },
      {
        '@type': 'HotelRoom',
        name: 'Twin Sharing Room (2-Seater Economy Room)',
        description: 'Spacious double sharing student room with individual beds, study setups, wardrobe, and dual-window ventilation.',
        occupancy: {
          '@type': 'QuantitativeValue',
          maxValue: 2,
        },
        offers: {
          '@type': 'Offer',
          price: twinRent,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          priceValidUntil: '2027-12-31',
        },
      },
    ],
    // High-value Amenities List
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'High-Speed 5G Wi-Fi Internet', value: true },
      { '@type': 'LocationFeatureSpecification', name: '24/7 Power Backup Inverter & Generator', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'CCTV Security Surveillance 24/7', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'RO Clean Drinking Water Purifier with Chiller', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Self-Cooking Modern Student Kitchen Facility', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Walking Distance to SRMU University Campus', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Dedicated Quiet Study Area & Tables', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Daily Housekeeping & Sanitization', value: true },
    ],
    keywords:
      'Boys Hostel near SRMU, Best boys PG near Ramswaroop University, Hostel in Tindola Barabanki, Student accommodation near SRMU, Boys PG in Safedabad, Hostel near Lucknow Faizabad Road, Affordable PG Barabanki',
    checkinTime: '08:00',
    checkoutTime: '20:00',
    petsAllowed: false,
  };

  scriptElement.textContent = JSON.stringify(structuredData, null, 2);
}
