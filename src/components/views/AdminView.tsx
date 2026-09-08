import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  Zap,
  Film,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Search,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Plus,
  Minus,
  Edit2,
  Lock,
} from 'lucide-react';
import { api } from '../../lib/api.js';

export const AdminView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustReason, setAdjustReason] = useState('Admin Bonus');
  const [planToAssign, setPlanToAssign] = useState('creator_monthly');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminStats();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin stats. Only admins have access.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAdjustPoints = async (userId: string, amount: number) => {
    try {
      const res = await api.adminAdjustPoints(userId, amount, adjustReason);
      if (res.success) {
        setActionSuccess(`Points adjusted (${amount > 0 ? `+${amount}` : amount}) for user`);
        fetchStats();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to adjust points');
    }
  };

  const handleAssignPlan = async (userId: string, planId: string) => {
    try {
      const res = await api.adminChangePlan(userId, planId);
      if (res.success) {
        setActionSuccess(`Plan updated to ${planId}`);
        fetchStats();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update plan');
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-orange-400" />
          <span>Loading Admin Console...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-6 rounded-2xl bg-[#141420] border border-rose-500/20 text-center space-y-3">
        <Lock className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Admin Access Restricted</h3>
        <p className="text-xs text-zinc-400">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  const { metrics, users = [], recentTransactions = [], recentPayments = [] } = data || {};

  const filteredUsers = users.filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FIRE AI TOOL Studio Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Points & Subscription Admin
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Monitor users, manage point allocations, track generations and revenue.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#12121e] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase">Total Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics?.totalUsers ?? 0}</div>
          <p className="text-[10px] text-zinc-500">{metrics?.freeUsers ?? 0} Free users</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12121e] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase">Premium Subs</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics?.activeSubscriptions ?? 0}</div>
          <p className="text-[10px] text-emerald-400">Active paying</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12121e] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase">Today Gens</span>
            <Film className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-white">{metrics?.todayGenerations ?? 0}</div>
          <p className="text-[10px] text-zinc-500">Videos rendered</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12121e] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase">Points Used</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {metrics?.todayPointsUsed?.toLocaleString() ?? 0}
          </div>
          <p className="text-[10px] text-zinc-500">Today IST</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12121e] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase">Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ₹{metrics?.totalRevenueINR?.toLocaleString() ?? 0}
          </div>
          <p className="text-[10px] text-zinc-500">Razorpay gross</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12121e] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase">Reset Cycle</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-white pt-1">12:00 AM IST</div>
          <p className="text-[10px] text-zinc-500">Asia/Kolkata</p>
        </div>
      </div>

      {/* Users Management Table */}
      <div className="rounded-3xl bg-[#12121e] border border-white/10 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Registered Users & Wallets</h2>
            <p className="text-xs text-zinc-400">View real-time balances and perform administrative adjustments</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search user by name/email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#181827] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#171726] text-[11px] uppercase font-bold text-zinc-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Points Balance</th>
                <th className="py-3 px-4">Used Today</th>
                <th className="py-3 px-4">Total Gens</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u: any) => {
                const w = u.wallet;
                return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[11px] text-zinc-500">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        u.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider ${
                        w?.planType === 'unlimited'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : w?.planType !== 'free'
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                          : 'bg-zinc-800 text-zinc-400 border border-white/10'
                      }`}>
                        {w?.planType?.toUpperCase() || 'FREE'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-amber-400 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-amber-400/20" />
                        <span>{w?.isUnlimited ? '∞ Unlimited' : `${w?.remainingPoints?.toLocaleString() ?? 0} pts`}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500">Limit: {w?.dailyLimit?.toLocaleString() ?? 1000}/day</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {w?.usedToday?.toLocaleString() ?? 0} pts
                    </td>
                    <td className="py-3 px-4 text-zinc-300 font-semibold">
                      {u.totalGenerations ?? 0}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAdjustPoints(u.id, 500)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold"
                          title="Add 500 Points"
                        >
                          +500
                        </button>
                        <button
                          onClick={() => handleAdjustPoints(u.id, -200)}
                          className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-bold"
                          title="Deduct 200 Points"
                        >
                          -200
                        </button>
                        <button
                          onClick={() => handleAssignPlan(u.id, w?.planType === 'free' ? 'creator_monthly' : 'free')}
                          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-[11px] font-semibold"
                          title="Toggle Plan"
                        >
                          {w?.planType === 'free' ? 'Set Creator' : 'Set Free'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payments & Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="rounded-3xl bg-[#12121e] border border-white/10 p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Recent Point Deductions / Credits</span>
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
            {recentTransactions.slice(0, 10).map((tx: any) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl bg-[#171726] border border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{tx.description}</div>
                  <div className="text-[10px] text-zinc-500">{new Date(tx.createdAt).toLocaleTimeString()}</div>
                </div>
                <div className={`font-black ${tx.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-3xl bg-[#12121e] border border-white/10 p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Razorpay Payments Received</span>
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
            {recentPayments.length === 0 ? (
              <div className="text-center py-10 text-xs text-zinc-500">
                No payments recorded yet.
              </div>
            ) : (
              recentPayments.slice(0, 10).map((p: any) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-[#171726] border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">Plan: {p.planId}</div>
                    <div className="text-[10px] text-zinc-500">Order: {p.orderId}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-400">₹{p.amount}</div>
                    <div className="text-[10px] text-zinc-500 uppercase">{p.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
