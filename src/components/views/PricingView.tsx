import React, { useState, useEffect } from 'react';
import {
  Zap,
  Check,
  Sparkles,
  ShieldCheck,
  Flame,
  Clock,
  ArrowRight,
  History,
  Info,
  Loader2,
  Coins,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { RazorpayCheckoutModal } from '../modals/RazorpayCheckoutModal.js';
import type { PointWallet, PointTransaction, Plan } from '../../types.js';

interface PricingViewProps {
  onPlanActivated?: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onPlanActivated }) => {
  const [wallet, setWallet] = useState<PointWallet | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [credRes, plansRes, txRes] = await Promise.all([
        api.getCredits(),
        api.getPlans(),
        api.getTransactions(),
      ]);

      if (credRes.wallet) setWallet(credRes.wallet);
      if (plansRes.plans) setPlans(plansRes.plans);
      if (txRes.transactions) setTransactions(txRes.transactions);
    } catch (err: any) {
      console.error('Failed to load pricing info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    try {
      setLoadingPlanId(planId);
      setMessage(null);
      const res = await api.createPaymentOrder(planId);
      setOrderData(res);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to initiate checkout.' });
    } finally {
      setLoadingPlanId(null);
    }
  };

  const handlePaymentSuccess = (newWallet: any) => {
    setWallet(newWallet);
    setMessage({ type: 'success', text: 'Plan activated successfully! Points have been credited.' });
    loadData();
    if (onPlanActivated) onPlanActivated();
  };

  // Video cost table examples
  const costExamples = [
    { duration: '10 Seconds', points: '100 Points', desc: 'Standard AI Shorts Scene (Minimum cost)' },
    { duration: '30 Seconds', points: '300 Points', desc: 'Short Viral Video / Hook + Punchline' },
    { duration: '60 Seconds', points: '600 Points', desc: 'Full 1-Minute Story / Narrative Short' },
    { duration: '120 Seconds', points: '1,200 Points', desc: '2-Minute Deep Dive / Explainer' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-2">
      {/* Notifications */}
      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="underline hover:text-white ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-orange-500/15 via-rose-500/15 to-amber-500/15 border border-orange-500/25 text-orange-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Membership & AI Points</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Unlock Your AI Creation Power
        </h1>
        <p className="text-sm sm:text-base text-zinc-400">
          Create more videos with powerful AI tools.
        </p>
      </div>

      {/* User Current Balance & Status Card */}
      {wallet && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#141424] via-[#16162a] to-[#121220] border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-zinc-400">Active Membership</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                  wallet.planType === 'unlimited'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : wallet.planType !== 'free'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}>
                  {wallet.planType.toUpperCase()}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-4xl font-black text-white flex items-center gap-2">
                  <span className="text-amber-400">⚡</span>
                  {wallet.isUnlimited ? 'Unlimited Points' : `${wallet.remainingPoints.toLocaleString()} Points`}
                </span>
                {!wallet.isUnlimited && (
                  <span className="text-xs text-zinc-400">
                    / {wallet.dailyLimit.toLocaleString()} Daily Limit
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 pt-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>
                  Daily reset time: <strong className="text-zinc-200">12:00 AM IST (Asia/Kolkata)</strong>. Points do not carry over to the next day.
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                disabled={loading}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-colors"
                title="Refresh Balance"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* The 3 Main Plans (Side-by-side on desktop, stacked on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PLAN 1: STARTER WEEKLY */}
        <div className="rounded-3xl bg-[#12121e] border border-white/10 hover:border-white/20 p-7 flex flex-col justify-between transition-all duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Flexible Trial</span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                <span>⭐</span>
                <span>STARTER WEEKLY</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Perfect for creators testing weekly sprints.</p>
            </div>

            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">₹99</span>
                <span className="text-xs text-zinc-400">/ 7 Days</span>
              </div>
              <div className="mt-2 text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-amber-300/30" />
                <span>10,000 points / day</span>
              </div>
            </div>

            <div className="h-px bg-white/10 my-4" />

            {/* Benefits */}
            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="text-[11px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Features:</div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>10,000 daily points</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI Shorts</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Long Videos</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Text to Video</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Image to Video</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI Image</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Script to Video</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => handleSelectPlan('starter_weekly')}
              disabled={loadingPlanId === 'starter_weekly'}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loadingPlanId === 'starter_weekly' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Buy Starter - ₹99</span>
              )}
            </button>
          </div>
        </div>

        {/* PLAN 2: CREATOR MONTHLY */}
        <div className="rounded-3xl bg-[#131320] border border-orange-500/30 hover:border-orange-500/50 p-7 flex flex-col justify-between transition-all duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Best Value</span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                <span>👑</span>
                <span>CREATOR MONTHLY</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Full 30 days of consistent channel growth.</p>
            </div>

            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">₹150</span>
                <span className="text-xs text-zinc-400">/ 30 Days</span>
              </div>
              <div className="mt-2 text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-amber-300/30" />
                <span>10,000 Points / Day</span>
              </div>
            </div>

            <div className="h-px bg-white/10 my-4" />

            {/* Benefits */}
            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="text-[11px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Features:</div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>10,000 daily points</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI Shorts</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Long Videos</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Text to Video</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Image to Video</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI Image</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Script to Video</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => handleSelectPlan('creator_monthly')}
              disabled={loadingPlanId === 'creator_monthly'}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-orange-500 to-rose-500 hover:brightness-110 text-white shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loadingPlanId === 'creator_monthly' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Buy Creator - ₹150</span>
              )}
            </button>
          </div>
        </div>

        {/* PLAN 3: UNLIMITED MONTHLY (Highlighted) */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#1c1a29] to-[#12121f] border-2 border-amber-500/60 ring-2 ring-amber-500/20 shadow-2xl shadow-orange-500/20 p-7 flex flex-col justify-between transform md:-translate-y-2">
          {/* Most Popular Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-orange-500/40 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>🔥 MOST POPULAR</span>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Power Creator</span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                <span>♾️</span>
                <span>UNLIMITED MONTHLY</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Zero point limits. Produce as many videos as you want.</p>
            </div>

            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">₹599</span>
                <span className="text-xs text-zinc-400">/ 30 Days</span>
              </div>
              <div className="mt-2 text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-amber-300" />
                <span>UNLIMITED POINTS</span>
              </div>
            </div>

            <div className="h-px bg-white/10 my-4" />

            {/* Benefits */}
            <div className="space-y-2.5 text-xs text-zinc-200">
              <div className="text-[11px] uppercase font-bold text-amber-400 tracking-wider mb-1">Features:</div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-white">Unlimited AI video generation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-white">Unlimited daily points</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI Shorts</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Long Videos</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Text to Video</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Image to Video</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI Image</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Script to Video</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-white">Priority AI processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-white">No watermark</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => handleSelectPlan('unlimited_monthly')}
              disabled={loadingPlanId === 'unlimited_monthly'}
              className="w-full py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 hover:brightness-110 text-white shadow-xl shadow-orange-500/35 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loadingPlanId === 'unlimited_monthly' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Buy Unlimited - ₹599</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Point Cost Calculation Rules */}
      <div className="rounded-3xl bg-[#12121e] border border-white/10 p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">How Video Points Work</h3>
            <p className="text-xs text-zinc-400">Transparent point cost calculation based on duration</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#171726] border border-white/10 text-xs text-zinc-300 leading-relaxed space-y-2">
          <p>
            • Every video generated costs <strong className="text-amber-400 font-bold">10 Points per 1 Second</strong> of video duration.
          </p>
          <p>
            • The minimum charge for any video generation is <strong className="text-amber-400 font-bold">100 Points</strong> (equal to 10 seconds).
          </p>
          <p>
            • Points are automatically deducted <strong className="text-zinc-100">server-side</strong> right before generation starts. If a generation fails or is aborted due to a system error, points are <strong className="text-emerald-400 font-bold">automatically refunded</strong> back to your balance immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {costExamples.map((ex, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#151522] border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">{ex.duration}</span>
                <span className="text-xs font-bold text-orange-400">{ex.points}</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-snug">{ex.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Points Transaction History Table */}
      <div className="rounded-3xl bg-[#12121e] border border-white/10 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-zinc-400" />
            <h3 className="text-base font-bold text-white">Points History</h3>
          </div>
          <span className="text-xs text-zinc-500">{transactions.length} recent transactions</span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500">
            No transactions yet. Generate videos or recharge to view transaction logs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#171726] text-[11px] uppercase font-bold text-zinc-500 border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Points</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.slice(0, 15).map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {tx.description}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        tx.type === 'deduction'
                          ? 'bg-rose-500/10 text-rose-400'
                          : tx.type === 'refund'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                      tx.amount < 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-400 whitespace-nowrap">
                      {tx.balanceAfter?.toLocaleString() ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Razorpay Checkout Modal */}
      {orderData && (
        <RazorpayCheckoutModal
          isOpen={!!orderData}
          onClose={() => setOrderData(null)}
          orderData={orderData}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
