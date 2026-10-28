import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Sparkles,
  Info,
  Scale,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { api } from '../services/api';

export default function Prediction() {
  const [horizon, setHorizon] = useState('next_7_days');
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPrediction = async (h) => {
    setLoading(true);
    try {
      const data = await api.getWastePrediction(h);
      setPredictionData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction(horizon);
  }, [horizon]);

  // Aggregate by date for bar chart
  const chartData = React.useMemo(() => {
    if (!predictionData?.forecasts) return [];
    const grouped = {};
    predictionData.forecasts.forEach(f => {
      if (!grouped[f.date]) {
        grouped[f.date] = { date: f.date.slice(5) }; // MM-DD
      }
      grouped[f.date][f.category] = f.estimated_kg;
    });
    return Object.values(grouped);
  }, [predictionData]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            Machine Learning Waste Generation Forecasting
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Predictive modeling of upcoming clinical waste loads to optimize disposal logistics and staffing.
          </p>
        </div>

        {/* Horizon Picker */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
          {[
            { id: 'next_day', label: 'Next Day' },
            { id: 'next_7_days', label: 'Next 7 Days' },
            { id: 'next_month', label: 'Next 30 Days' }
          ].map(h => (
            <button
              key={h.id}
              onClick={() => setHorizon(h.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                horizon === h.id
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prominent Estimated Waste Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
        <Info className="w-5 h-5 shrink-0 text-amber-400" />
        <div>
          <p className="font-bold">Estimated Waste Generation</p>
          <p className="text-slate-300 mt-0.5">{predictionData?.disclaimer}</p>
        </div>
      </div>

      {/* Total Estimated Load KPI Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Forecasted Bio-Waste Production ({horizon.replace('_', ' ')})
          </span>
          <div className="text-3xl sm:text-4xl font-black text-white flex items-baseline gap-2">
            <span>{predictionData?.total_estimated_kg || 0}</span>
            <span className="text-lg font-bold text-emerald-400">Kilograms (kg)</span>
          </div>
          <p className="text-xs text-slate-400">
            Based on historical regression across 8 clinical waste categories.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-750">
          <Scale className="w-8 h-8 text-emerald-400" />
          <div className="text-left">
            <span className="text-xs font-bold text-white block">Logistics Recommendation</span>
            <span className="text-[11px] text-slate-400">
              {predictionData?.total_estimated_kg > 100
                ? 'High volume alert: Schedule daily morning and evening clearances.'
                : 'Standard collection frequency sufficient.'}
            </span>
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Projected Daily Waste Distribution by Category (kg)
          </h3>
          <p className="text-xs text-slate-400">Estimated weight allocation per upcoming forecast date</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="infectious" stackId="a" fill="#EAB308" name="Infectious (Yellow)" />
              <Bar dataKey="contaminated_recyclable" stackId="a" fill="#EF4444" name="Plastics (Red)" />
              <Bar dataKey="sharps" stackId="a" fill="#94A3B8" name="Sharps (White)" />
              <Bar dataKey="general" stackId="a" fill="#334155" name="General (Black)" />
              <Bar dataKey="glassware" stackId="a" fill="#3B82F6" name="Glass (Blue)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Forecast Forecast Items Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <h3 className="text-sm font-bold text-white mb-4">Detailed Horizon Projection Breakdown</h3>
        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 pb-2">
              <tr>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Waste Stream</th>
                <th className="py-2 px-3">Estimated Load (kg)</th>
                <th className="py-2 px-3">Estimated Range (95% CI)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(predictionData?.forecasts || []).slice(0, 20).map((f, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-300">{f.date}</td>
                  <td className="py-2.5 px-3 font-semibold text-white capitalize">{f.category.replace('_', ' ')}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{f.estimated_kg} kg</td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{f.confidence_interval}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
