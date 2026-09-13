/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calculator, Check, Sparkles, HelpCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

import { HostelConfig } from '../types';

interface RoomConfiguratorProps {
  onPreConfigure: (config: {
    roomType: 'single' | 'twin' | 'full';
    tenure: string;
    addons: string[];
    totalMonthly: number;
    securityDeposit: number;
  }) => void;
  config: HostelConfig;
}

export default function RoomConfigurator({ onPreConfigure, config }: RoomConfiguratorProps) {
  const [roomType, setRoomType] = useState<'single' | 'twin' | 'full'>(() => {
    if (config.hideSingleOccupancy && !config.hideTwinSharing) return 'twin';
    if (config.hideSingleOccupancy && config.hideTwinSharing && !config.hideFullRoomOccupancy) return 'full';
    return 'single';
  });

  useEffect(() => {
    if (config.hideSingleOccupancy && !config.hideTwinSharing) {
      setRoomType('twin');
    } else if (config.hideTwinSharing && !config.hideSingleOccupancy) {
      setRoomType('single');
    }
  }, [config.hideSingleOccupancy, config.hideTwinSharing]);

  const [tenure, setTenure] = useState<'3' | '6' | '12'>('6');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const baseRentMap = {
    single: config.singleRoomRent,
    twin: config.twinRoomRent,
    full: config.fullRoomRent || 0,
  };

  const securityDepositMap = {
    single: config.singleRoomDeposit ?? 3000,
    twin: config.twinRoomDeposit ?? 2000,
    full: config.fullRoomDeposit ?? 3500,
  };

  const tenureDiscountMap = {
    '3': 0, // no discount
    '6': 0.05, // 5% off monthly
    '12': 0.10, // 10% off monthly
  };

  const allAddonsList = [
    { id: 'cooler', name: 'Desert Air Cooler (for Summer)', price: config.coolerPrice ?? 500, desc: 'High airflow cooler for summer focus', isHidden: Boolean(config.hideCoolerAddon) },
    { id: 'laundry', name: 'Housekeeping Laundry Care', price: config.laundryPrice ?? 400, desc: 'House staff washes & folds twice a week', isHidden: Boolean(config.hideLaundryAddon) },
    { id: 'chair', name: 'Ergonomic Desk Chair Upgrade', price: config.chairPrice ?? 150, desc: 'Enhanced orthopaedic study seat', isHidden: Boolean(config.hideChairAddon) },
    { id: 'locker', name: 'Private Secured Iron Locker', price: config.lockerPrice ?? 100, desc: 'Robust digital safe drawer', isHidden: Boolean(config.hideLockerAddon) },
  ];

  const addonOptions = allAddonsList.filter((a) => !a.isHidden);

  const handleAddonToggle = (addonId: string) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter((id) => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  // Calculations
  const baseRent = baseRentMap[roomType];
  const securityDeposit = securityDepositMap[roomType];
  const tenureDiscount = baseRent * tenureDiscountMap[tenure];
  
  const addonsTotal = selectedAddons.reduce((acc, currentId) => {
    const addon = addonOptions.find((a) => a.id === currentId);
    return acc + (addon ? addon.price : 0);
  }, 0);

  let monthlySubtotal = baseRent - tenureDiscount + addonsTotal;
  
  if (discountApplied) {
    monthlySubtotal = monthlySubtotal - 150; // Promo coupon discount of ₹150
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const entered = couponCode.trim().toUpperCase();
    if (config.couponCodes.includes(entered)) {
      setDiscountApplied(true);
    } else {
      setCouponError(`Invalid coupon code. Try: ${config.couponCodes.join(' or ')}`);
    }
  };

  const handleBookWithConfig = () => {
    const formattedAddons = selectedAddons.map(id => {
      const add = addonOptions.find(a => a.id === id);
      return add ? add.name : id;
    });

    onPreConfigure({
      roomType,
      tenure: `${tenure} Months Plan`,
      addons: formattedAddons,
      totalMonthly: monthlySubtotal,
      securityDeposit,
    });

    // Smooth scroll to contact
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="estimator" className="py-24 bg-slate-50/50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
            Interactive Helper
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Configure Your Room & Rent Estimator
          </h2>
          <p className="font-sans text-slate-600 text-sm max-w-xl mx-auto">
            Select your preferences, customize add-ons, and instantly check your monthly rent breakdown. No hidden fees or commissions.
          </p>
          <div className="w-12 h-1 bg-primary-600 mx-auto rounded-full"></div>
        </div>

        {/* Calculator Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="estimator-grid">
          
          {/* Config Left Column */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8" id="estimator-inputs">
            
            {/* Step 1: Room Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-900 tracking-wide uppercase">
                1. Select Room Setup
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {!config.hideSingleOccupancy && (
                  <button
                    onClick={() => setRoomType('single')}
                    className={`flex flex-col items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      roomType === 'single'
                        ? 'border-slate-900 bg-slate-50/55'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${roomType === 'single' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">Single (1-Seater)</span>
                        {config.isSingleFull ? (
                          <span className="text-[9px] font-black tracking-wide uppercase text-rose-700 bg-rose-50 border border-rose-100 px-1 py-0.5 rounded">Full</span>
                        ) : (
                          <span className="text-[9px] font-black tracking-wide uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded">Avail</span>
                        )}
                      </div>
                      <span className="block text-xs text-slate-500 mt-0.5">Absolute privacy</span>
                      <span className="block text-sm font-extrabold text-primary-700 mt-2">₹{baseRentMap.single}/mo</span>
                    </div>
                  </button>
                )}

                {!config.hideTwinSharing && (
                  <button
                    onClick={() => setRoomType('twin')}
                    className={`flex flex-col items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      roomType === 'twin'
                        ? 'border-slate-900 bg-slate-50/55'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${roomType === 'twin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">Twin (2-Seater)</span>
                        {config.isTwinFull ? (
                          <span className="text-[9px] font-black tracking-wide uppercase text-rose-700 bg-rose-50 border border-rose-100 px-1 py-0.5 rounded">Full</span>
                        ) : (
                          <span className="text-[9px] font-black tracking-wide uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded">Avail</span>
                        )}
                      </div>
                      <span className="block text-xs text-slate-500 mt-0.5">Shared room</span>
                      <span className="block text-sm font-extrabold text-primary-700 mt-2">₹{baseRentMap.twin}/mo</span>
                    </div>
                  </button>
                )}

                {!config.hideFullRoomOccupancy && (
                  <button
                    onClick={() => setRoomType('full')}
                    className={`flex flex-col items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      roomType === 'full'
                        ? 'border-slate-900 bg-slate-50/55'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${roomType === 'full' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">Full Room (निजी)</span>
                        {config.isFullRoomFull ? (
                          <span className="text-[9px] font-black tracking-wide uppercase text-rose-700 bg-rose-50 border border-rose-100 px-1 py-0.5 rounded">Full</span>
                        ) : (
                          <span className="text-[9px] font-black tracking-wide uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded">Avail</span>
                        )}
                      </div>
                      <span className="block text-xs text-slate-500 mt-0.5">Entire private room</span>
                      <span className="block text-sm font-extrabold text-primary-700 mt-2">₹{baseRentMap.full}/mo</span>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Step 2: Tenure Select */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-slate-900 tracking-wide uppercase">
                  2. Staying Period Plan
                </label>
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  Longer plans save more!
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: '3', label: '3 Months', discount: 'Regular Rent' },
                  { value: '6', label: '6 Months', discount: 'Save 5%' },
                  { value: '12', label: '12 Months', discount: 'Save 10%' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setTenure(item.value as '3' | '6' | '12')}
                    className={`py-4 px-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                      tenure === item.value
                        ? 'border-slate-900 bg-slate-50/55 text-slate-950 font-bold'
                        : 'border-slate-100 hover:border-slate-200 text-slate-600'
                    }`}
                  >
                    <span className="text-sm font-bold">{item.label}</span>
                    <span className={`text-[10px] mt-1 font-semibold ${tenure === item.value ? 'text-primary-600' : 'text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50'}`}>
                      {item.discount}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Optional Upgrades */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-900 tracking-wide uppercase">
                3. Customize Student Upgrades (Optional)
              </label>
              {addonOptions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addonOptions.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        onClick={() => handleAddonToggle(addon.id)}
                        className={`flex items-start justify-between p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 bg-slate-50/55'
                            : 'border-slate-100 hover:border-slate-250 bg-white'
                        }`}
                      >
                        <div className="space-y-1 pr-2">
                          <span className="block text-sm font-bold text-slate-800 leading-tight">{addon.name}</span>
                          <span className="block text-[11px] text-slate-500">{addon.desc}</span>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            +₹{addon.price}/mo
                          </span>
                          <div className={`w-4 h-4 rounded mt-2 border flex items-center justify-center ${
                            isSelected ? 'bg-slate-950 border-slate-950 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>All standard room amenities (Study Table, Chair, Fan, Bunk/Cot) are fully included in the base rent price.</span>
                </div>
              )}
            </div>

            {/* Coupon Code Section */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <form onSubmit={handleApplyCoupon} className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={discountApplied}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 uppercase font-bold text-slate-700 placeholder:normal-case placeholder:font-normal"
                  />
                </div>
                <button
                  type="submit"
                  disabled={discountApplied}
                  className={`px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    discountApplied
                      ? 'bg-slate-800 text-white cursor-default'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {discountApplied ? 'Applied!' : 'Apply'}
                </button>
              </form>
              {couponError && (
                <p className="text-xs font-semibold text-rose-600 pl-1">
                  {couponError}
                </p>
              )}
            </div>

          </div>

          {/* Calculator Right Receipt Card */}
          <div className="lg:col-span-5 sticky top-24" id="estimator-receipt">
            <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-5">
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg">Inquiry Estimate</h3>
                  <p className="text-[10px] text-slate-400">100% Transparent Price Break-up</p>
                </div>
              </div>

              {/* Price list */}
              <div className="space-y-4 text-sm">
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Selected Room Config</span>
                  <span className="font-bold text-slate-200">
                    {roomType === 'single' ? 'Single (1-Seater)' : 'Twin-Sharing (2-Seater)'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Monthly Room Rent</span>
                  <span className="font-bold text-slate-200">₹{baseRent === 0 ? '00' : baseRent}</span>
                </div>

                {tenureDiscount > 0 && (
                  <div className="flex justify-between items-center text-primary-400">
                    <span>Period Discount ({tenure} mos)</span>
                    <span className="font-bold">-₹{tenureDiscount}</span>
                  </div>
                )}

                {/* Selected Addons breakdown */}
                {selectedAddons.length > 0 && (
                  <div className="border-t border-slate-800/80 pt-3 space-y-2">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Selected Custom Upgrades</span>
                    {selectedAddons.map(id => {
                      const ad = addonOptions.find(a => a.id === id);
                      if (!ad) return null;
                      return (
                        <div key={id} className="flex justify-between items-center text-xs text-slate-300">
                          <span>• {ad.name}</span>
                          <span className="font-semibold">+₹{ad.price}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Promo Code Discount */}
                {discountApplied && (
                  <div className="flex justify-between items-center text-primary-400 text-xs">
                    <span>Coupon Promo Code</span>
                    <span className="font-bold">-₹150</span>
                  </div>
                )}

                {/* Security Deposit Details */}
                <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 block font-medium">Refundable Security Deposit</span>
                    <span className="text-[10px] text-slate-500 block leading-none mt-1">Paid once during onboarding</span>
                  </div>
                  <span className="font-bold text-slate-200">₹{securityDeposit}</span>
                </div>

                {/* Final calculated Total Monthly Rent */}
                <div className="border-t border-slate-800 pt-6 flex justify-between items-end">
                  <div>
                    <span className="text-slate-400 text-xs block font-bold uppercase tracking-wider">Estimated Monthly Rent</span>
                    <span className="text-[10px] text-slate-500 block">Excluding Security Deposit</span>
                  </div>
                  <span className="font-display font-black text-3xl text-white">
                    ₹{monthlySubtotal === 0 ? '00' : monthlySubtotal}<span className="text-xs text-slate-400 font-normal">/mo</span>
                  </span>
                </div>

              </div>

              {/* Security guarantee */}
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-start gap-2.5 mt-8">
                <ShieldAlert className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-slate-400 leading-tight">
                  Estimated pricing is 100% indicative of final onboarding rents. Security deposits are completely returned within 7 days of lease completion without deductions.
                </p>
              </div>

              {/* Book now with this config */}
              <button
                onClick={handleBookWithConfig}
                className="w-full bg-slate-900 border border-slate-800 text-white font-sans font-bold py-4 px-6 rounded-full shadow-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
                id="prebook-configured-btn"
              >
                <span>
                  {roomType === 'single' && config.isSingleFull
                    ? 'Join Single Room Waiting List (प्रतीक्षा सूची)'
                    : roomType === 'twin' && config.isTwinFull
                    ? 'Join Twin Room Waiting List (प्रतीक्षा सूची)'
                    : 'Pre-Book with This Estimate'}
                </span>
                <ArrowRight className="w-4 h-4 text-primary-400" />
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
