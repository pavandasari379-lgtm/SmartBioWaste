import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Layers,
  Calendar,
  Activity,
  ShieldAlert
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, Legend
} from 'recharts';
import { api } from '../services/api';
import StatCard from '../components/StatCard';

export default function Analytics() {
  const [days, setDays] = useState(7);
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [bins, setBins] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [ov, cats, binData, trs] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getCategoryAnalytics(),
          api.getBinAnalytics(),
          api.getTrendAnalytics(days)
        ]);
        setOverview(ov);
        setCategories(cats || []);
        setBins(binData || []);
        setTrends(trs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [days]);

  const PIE_COLORS = ['#EAB308', '#EF4444', '#94A3B8', '#3B82F6', '#10B981', '#F97316', '#A855F7', '#64748B'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Hospital Biomedical Waste Analytics & Trends
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Data insights on waste stream production, segregation fidelity, and biohazard risk exposures.
          </p>
        </div>

        {/* Days Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                days === d
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Past {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Scans Executed"
          value={overview?.total_scans || 0}
          icon={Layers}
          color="emerald"
        />
        <StatCard
          title="High-Risk Items Logged"
          value={overview?.high_risk_alerts || 0}
          icon={ShieldAlert}
          color="red"
        />
        <StatCard
          title="Average Model Confidence"
          value={`${((overview?.average_confidence || 0) * 100).toFixed(1)}%`}
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Pending Waste Collections"
          value={overview?.pending_collections || 0}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Main Trends Chart */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Bio-Waste Scan & Risk Inflow Trajectory
            </h3>
            <p className="text-xs text-slate-400">Comparing total scans against elevated biohazard items detected</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scansFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="scans" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#scansFill)" name="Total Scans Logged" />
              <Area type="monotone" dataKey="high_risk" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#riskFill)" name="High/Critical Biohazards" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Row: Bin Distribution & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bin Type Bar Chart */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Destination Bin Distribution
            </h3>
            <p className="text-xs text-slate-400">Total items routed by color-coded container category</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="bin" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Item Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              Waste Class Proportions
            </h3>
            <p className="text-xs text-slate-400">Percentage share of each biomedical category</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="count"
                  nameKey="display_name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
