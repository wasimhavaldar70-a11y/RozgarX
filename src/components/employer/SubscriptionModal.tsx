'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  ShieldCheck,
  CreditCard,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { SubscriptionPlan } from '../../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionUpdated?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubscriptionUpdated
}) => {
  const { user } = useAuth();
  const employerId = user?.employerId || user?.id || 'emp_1';
  const plans = db.getSubscriptionPlans();
  const currentSub = db.getEmployerSubscription(employerId);

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI / GPay / PhonePe');

  if (!isOpen) return null;

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };

  const handleSimulateRazorpay = () => {
    if (!selectedPlan) return;

    setIsProcessing(true);

    // Simulate secure Razorpay order creation and payment verification workflow
    setTimeout(() => {
      const orderId = `order_mh_${Date.now()}`;
      const paymentId = `pay_razor_${Date.now()}_succ`;
      const signature = `sig_hmac256_${Math.random().toString(36).substring(2, 10)}`;

      const res = db.activateSubscription(employerId, selectedPlan.id, {
        orderId,
        paymentId,
        signature,
        method: paymentMethod
      });

      setIsProcessing(false);

      if (res.success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          setPaymentSuccess(false);
          setSelectedPlan(null);
          if (onSubscriptionUpdated) onSubscriptionUpdated();
          onClose();
        }, 1800);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              Employer Hiring & Subscription Plans
            </h3>
            <p className="text-xs text-slate-500">
              Upgrade your package to unlock candidate database search and bulk job postings across Maharashtra.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Subscription Status */}
        <div className="px-6 py-3 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-slate-700">
              Active Plan:{' '}
              <strong className="text-blue-900">{currentSub?.planName || 'Free Starter'}</strong>
              {' • '}Remaining Credits:{' '}
              <strong className="text-blue-700">{currentSub?.remainingCredits ?? 1}</strong>
            </span>
          </div>
          <span className="text-slate-500">
            Valid until:{' '}
            {currentSub?.expiryDate
              ? new Date(currentSub.expiryDate).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'Ongoing'}
          </span>
        </div>

        {/* Body / Plans Grid */}
        <div className="p-6 overflow-y-auto">
          {paymentSuccess ? (
            <div className="p-12 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
              <h4 className="text-xl font-bold text-slate-900">
                Payment Verified & Subscription Activated!
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Razorpay payment signature verified server-side. Your job credits and 30-day package
                validity have been immediately updated in the database.
              </p>
            </div>
          ) : selectedPlan ? (
            /* Razorpay Checkout Simulation View */
            <div className="max-w-md mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase">
                    Checkout & Payment
                  </span>
                  <h4 className="font-bold text-slate-900 text-base">{selectedPlan.name}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Change Plan
                </button>
              </div>

              {/* Order Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Job Posting Credits:</span>
                  <span className="font-bold text-slate-900">{selectedPlan.jobPostingLimit} Credits</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Package Validity:</span>
                  <span className="font-bold text-slate-900">{selectedPlan.validityDays} Days</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Candidate Database Search:</span>
                  <span className="font-bold text-slate-900">
                    {selectedPlan.candidateSearchAllowed ? 'Included' : 'Not Included'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-blue-600">
                    {selectedPlan.price === 0 ? 'FREE' : `₹${selectedPlan.price}`}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              {selectedPlan.price > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Payment Method (Razorpay Gateway)
                  </label>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    {[
                      'UPI / GPay / PhonePe / Paytm',
                      'Debit & Credit Cards (Visa / Mastercard / RuPay)',
                      'NetBanking (SBI, HDFC, ICICI, Bank of Maharashtra)',
                      'Corporate Corporate Banking'
                    ].map(m => (
                      <label key={m} className="flex items-center gap-2 p-2 rounded-lg border bg-white cursor-pointer hover:border-blue-400">
                        <input
                          type="radio"
                          name="payMethod"
                          checked={paymentMethod === m}
                          onChange={() => setPaymentMethod(m)}
                          className="accent-blue-600"
                        />
                        <span>{m}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm CTA */}
              <button
                onClick={handleSimulateRazorpay}
                disabled={isProcessing}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {isProcessing
                    ? 'Verifying Signature...'
                    : selectedPlan.price === 0
                    ? 'Confirm Free Activation'
                    : `Pay ₹${selectedPlan.price} & Activate Plan`}
                </span>
              </button>
            </div>
          ) : (
            /* 4 Employer Plans Grid */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {plans.map(plan => {
                const isCurrent = currentSub?.planId === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl p-5 border flex flex-col justify-between transition-all relative ${
                      plan.isPopular
                        ? 'border-blue-600 bg-white shadow-md ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {plan.isPopular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                        Most Popular
                      </span>
                    )}

                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{plan.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 min-h-[32px]">
                        {plan.description}
                      </p>

                      <div className="mt-4 pb-4 border-b border-slate-100">
                        <span className="text-3xl font-extrabold text-slate-900">
                          {plan.price === 0 ? '₹0' : `₹${plan.price}`}
                        </span>
                        <span className="text-xs text-slate-400 font-medium ml-1">
                          / {plan.validityDays} days
                        </span>
                      </div>

                      {/* Features */}
                      <ul className="mt-4 space-y-2 text-xs text-slate-600">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span className="leading-tight">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className={`w-full py-2 px-3 text-xs font-bold rounded-xl transition-colors ${
                          isCurrent
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : plan.isPopular
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        {isCurrent ? 'Renew Current Plan' : 'Select Plan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
