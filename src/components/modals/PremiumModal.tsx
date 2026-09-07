import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, ShieldCheck, Flame, Loader2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { RazorpayCheckoutModal } from './RazorpayCheckoutModal.js';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessPlan?: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  onSuccessPlan,
}) => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'starter_weekly',
      name: '⭐ STARTER WEEKLY',
      price: 99,
      period: '7 Days',
      dailyPoints: '10,000 Points / Day',
      tag: '7 Days Access',
      popular: false,
      btnLabel: 'Buy Starter - ₹99',
      gradient: 'from-blue-500/20 to-purple-500/10',
      border: 'border-white/10 hover:border-blue-500/40',
      btnClass: 'bg-white/10 hover:bg-white/20 text-white',
      features: [
        '10,000 daily points',
        'AI Shorts',
        'Long Videos',
        'Text to Video',
        'Image to Video',
        'AI Image',
        'Script to Video',
      ],
    },
    {
      id: 'creator_monthly',
      name: '👑 CREATOR MONTHLY',
      price: 150,
      period: '30 Days',
      dailyPoints: '10,000 Points / Day',
      tag: '30 Days Access',
      popular: false,
      btnLabel: 'Buy Creator - ₹150',
      gradient: 'from-orange-500/20 to-rose-500/10',
      border: 'border-orange-500/30 hover:border-orange-500/60',
      btnClass: 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20 hover:brightness-110',
      features: [
        '10,000 daily points',
        'AI Shorts',
        'Long Videos',
        'Text to Video',
        'Image to Video',
        'AI Image',
        'Script to Video',
      ],
    },
    {
      id: 'unlimited_monthly',
      name: '♾️ UNLIMITED MONTHLY',
      price: 599,
      period: '30 Days',
      dailyPoints: 'UNLIMITED POINTS',
      tag: '🔥 MOST POPULAR',
      popular: true,
      btnLabel: 'Buy Unlimited - ₹599',
      gradient: 'from-amber-500/25 via-orange-500/20 to-pink-500/20',
      border: 'border-amber-400 ring-2 ring-amber-500/50 shadow-2xl shadow-amber-500/20',
      btnClass: 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:brightness-110 text-white font-black shadow-xl shadow-orange-500/30',
      features: [
        'Unlimited AI video generation',
        'Unlimited daily points',
        'AI Shorts',
        'Long Videos',
        'Text to Video',
        'Image to Video',
        'AI Image',
        'Script to Video',
        'Priority AI processing',
        'No watermark',
      ],
    },
  ];

  const handleSelectPlan = async (planId: string) => {
    try {
      setLoadingPlan(planId);
      const res = await api.createPaymentOrder(planId);
      setOrderData(res);
    } catch (err: any) {
      console.error('Failed to start checkout:', err);
      alert(err.message || 'Failed to start payment order.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto custom-scrollbar animate-in fade-in">
        <div
          className="relative w-full max-w-5xl rounded-3xl bg-[#0e0e17] border border-white/10 shadow-2xl p-6 sm:p-8 text-white my-8 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle Ambient Glows */}
          <div className="absolute -top-32 left-1/3 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 right-10 w-96 h-96 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Premium Membership</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Unlock Your AI Creation Power
            </h2>
            <p className="text-sm text-zinc-400">
              Create more videos with powerful AI tools.
            </p>
          </div>

          {/* 3 Plans Grid: Side-by-side on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
            {plans.map((plan) => {
              const isPopular = plan.popular;
              const isLoading = loadingPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl bg-[#141421] border transition-all duration-200 flex flex-col p-6 ${plan.border} ${
                    isPopular ? 'scale-[1.02] bg-gradient-to-b from-[#181829] to-[#12121e]' : ''
                  }`}
                >
                  {/* Badge */}
                  {plan.popular ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-orange-500/40 flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-white" />
                      <span>{plan.tag}</span>
                    </div>
                  ) : (
                    <div className="inline-block self-start px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold text-zinc-400 mb-2">
                      {plan.tag}
                    </div>
                  )}

                  {/* Plan Name & Price */}
                  <div className="space-y-2 mb-4">
                    <h3 className="text-base font-black text-white">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-white">₹{plan.price}</span>
                      <span className="text-xs text-zinc-400">/ {plan.period}</span>
                    </div>
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 pt-1">
                      <Zap className="w-3.5 h-3.5 fill-amber-300/30" />
                      <span>{plan.dailyPoints}</span>
                    </div>
                  </div>

                  <div className="h-px bg-white/10 my-2" />

                  {/* Features List */}
                  <ul className="space-y-2.5 my-4 flex-1 text-xs text-zinc-300">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 ${plan.btnClass}`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Preparing Order...</span>
                      </>
                    ) : (
                      <span>{plan.btnLabel}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Guarantee info */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant point allocation • Secure Razorpay encryption</span>
            </div>
            <div>Daily reset happens at 12:00 AM IST automatically.</div>
          </div>
        </div>
      </div>

      {/* Razorpay Checkout Modal */}
      {orderData && (
        <RazorpayCheckoutModal
          isOpen={!!orderData}
          onClose={() => setOrderData(null)}
          orderData={orderData}
          onSuccess={() => {
            setOrderData(null);
            onClose();
            if (onSuccessPlan) onSuccessPlan();
          }}
        />
      )}
    </>
  );
};
