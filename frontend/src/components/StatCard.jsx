import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = "emerald", subtitle, trend }) {
  const colorStyles = {
    emerald: "from-emerald-500/20 to-teal-500/5 text-emerald-400 border-emerald-500/30",
    amber: "from-amber-500/20 to-yellow-500/5 text-amber-400 border-amber-500/30",
    red: "from-red-500/20 to-rose-500/5 text-red-400 border-red-500/30",
    blue: "from-blue-500/20 to-cyan-500/5 text-blue-400 border-blue-500/30",
    purple: "from-purple-500/20 to-indigo-500/5 text-purple-400 border-purple-500/30",
    slate: "from-slate-700/40 to-slate-800/20 text-slate-300 border-slate-700"
  };

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${colorStyles[color] || colorStyles.slate} border backdrop-blur-md shadow-lg transition-all hover:scale-[1.01]`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-white">{value}</span>
        {trend && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
}
