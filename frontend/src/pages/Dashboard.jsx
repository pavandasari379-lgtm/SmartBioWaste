import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ScanLine,
  AlertTriangle,
  Flame,
  Syringe,
  FlaskConical,
  Truck,
  Layers,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import StatCard from '../components/StatCard';
import BinBadge from '../components/BinBadge';

export default function Dashboard() {
  const { t } = useLanguage();
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [bins, setBins] = useState([]);
  const [trends, setTrends] = useState([]);
  const [binStatuses, setBinStatuses] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [ov, catData, binData, trData, bStatuses, recScans] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getCategoryAnalytics(),
          api.getBinAnalytics(),
          api.getTrendAnalytics(7),
          api.getBins(),
          api.getScans({ limit: 5 })
        ]);
        setOverview(ov);
        setCategories(catData || []);
        setBins(binData || []);
        setTrends(trData || []);
        setBinStatuses(bStatuses || []);
        setRecentScans(recScans || []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-sm">
        <Activity className="w-5 h-5 animate-spin mr-2 text-emerald-400" />
        Loading Hospital Bio-Safety Analytics...
      </div>
    );
  }

  const PIE_COLORS = ['#EAB308', '#EF4444', '#94A3B8', '#3B82F6', '#10B981', '#F97316', '#A855F7', '#64748B'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white m-0">
              {t('dashboard.title')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <Link
          to="/detection"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02]"
        >
          <ScanLine className="w-4 h-4" />
          <span>Scan New Waste Item</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title={t('dashboard.total_scans')}
          value={overview?.total_scans || 0}
          icon={Layers}
          color="emerald"
        />
        <StatCard
          title={t('dashboard.infectious')}
          value={overview?.infectious_count || 0}
          icon={Flame}
          color="amber"
        />
        <StatCard
          title={t('dashboard.sharps')}
          value={overview?.sharps_count || 0}
          icon={Syringe}
          color="slate"
        />
        <StatCard
          title={t('dashboard.chemical')}
          value={overview?.chemical_count || 0}
          icon={FlaskConical}
          color="purple"
        />
        <StatCard
          title={t('dashboard.high_risk')}
          value={overview?.high_risk_alerts || 0}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title={t('dashboard.pending_collections')}
          value={overview?.pending_collections || 0}
          icon={Truck}
          color="blue"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                {t('dashboard.weekly_trend')}
              </h3>
              <p className="text-xs text-slate-400">Total hospital scans vs high-risk waste alerts over past 7 days</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Avg Conf: {((overview?.average_confidence || 0) * 100).toFixed(1)}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="scans" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#scanGrad)" name="Total Scans" />
                <Area type="monotone" dataKey="high_risk" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#riskGrad)" name="High-Risk Items" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              {t('dashboard.category_distribution')}
            </h3>
            <p className="text-xs text-slate-400">Proportional classification breakdown</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="count"
                  nameKey="display_name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-1.5 overflow-y-auto max-h-36 pr-1 divide-y divide-slate-800/60">
            {categories.map((c, i) => (
              <div key={c.category} className="flex items-center justify-between text-xs pt-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-slate-300 truncate max-w-[140px]">{c.display_name}</span>
                </div>
                <span className="font-semibold text-slate-200">{c.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Real-time Bins & Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-Time Bin Status Monitor */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                {t('dashboard.bin_status_title')}
              </h3>
              <p className="text-xs text-slate-400">Hospital waste bins nearing capacity limit</p>
            </div>
            <Link to="/smart-collection" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
              Manage Bins →
            </Link>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-80 pr-1">
            {binStatuses.map((bin) => {
              const isFull = bin.capacity_percentage >= 85;
              const isNear = bin.capacity_percentage >= 70 && !isFull;
              return (
                <div key={bin.id} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-750 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{bin.bin_name}</h4>
                      <p className="text-[11px] text-slate-400">{bin.location}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-extrabold ${isFull ? 'text-red-400' : isNear ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {bin.capacity_percentage}% Full
                      </span>
                      <div className="mt-0.5">
                        <BinBadge bin={bin.bin_type} size="sm" />
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-700/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull ? 'bg-red-500' : isNear ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, bin.capacity_percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Scans Table */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-emerald-400" />
                {t('dashboard.recent_scans')}
              </h3>
              <p className="text-xs text-slate-400">Latest AI predictions logged across hospital units</p>
            </div>
            <Link to="/history" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
              Full History →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 pb-2">
                <tr>
                  <th className="py-2">Waste Item</th>
                  <th className="py-2">Confidence</th>
                  <th className="py-2">Risk</th>
                  <th className="py-2">Target Bin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentScans.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No scans recorded yet. Upload a waste photo to begin!
                    </td>
                  </tr>
                ) : (
                  recentScans.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 font-semibold text-slate-200">
                        {s.display_name}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          s.confidence >= 0.85
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {(s.confidence * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`font-semibold ${
                          s.risk_level === 'Critical' ? 'text-red-400' :
                          s.risk_level === 'High' ? 'text-rose-400' :
                          s.risk_level === 'Moderate' ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                          {s.risk_level}
                        </span>
                      </td>
                      <td className="py-3">
                        <BinBadge bin={s.recommended_bin} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
