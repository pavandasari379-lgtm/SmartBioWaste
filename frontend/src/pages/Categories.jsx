import React, { useState, useEffect } from 'react';
import { Boxes, ShieldAlert, CheckCircle2, AlertTriangle, Filter, Search } from 'lucide-react';
import { api } from '../services/api';
import BinBadge from '../components/BinBadge';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [selectedBin, setSelectedBin] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = categories.filter((c) => {
    const matchBin = selectedBin === 'ALL' || c.default_bin === selectedBin;
    const matchSearch =
      c.display_name.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchBin && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-400" />
            Biomedical Waste Streams & Regulatory Segregation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Verified institutional guidelines for clinical waste classification, PPE, and destination bins.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['ALL', 'YELLOW', 'RED', 'WHITE', 'BLUE', 'RADIATION_ALERT'].map((bin) => (
            <button
              key={bin}
              onClick={() => setSelectedBin(bin)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedBin === bin
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
              }`}
            >
              {bin === 'ALL' ? 'All Streams' : bin}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category or waste item..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Loading regulatory categories...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500">
          No matching waste streams found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-white leading-snug">
                    {cat.display_name}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cat.risk_level === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    cat.risk_level === 'High' ? 'bg-rose-500/20 text-rose-400' :
                    cat.risk_level === 'Moderate' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {cat.risk_level} Risk
                  </span>
                </div>

                <div>
                  <BinBadge bin={cat.default_bin} size="sm" />
                </div>

                <p className="text-xs text-slate-400 line-clamp-3">
                  {cat.segregation_guide}
                </p>

                {/* PPE Highlights */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Required PPE:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(cat.ppe_requirements || []).slice(0, 3).map((ppe, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md"
                      >
                        {ppe}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Disposal Snippet */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="text-slate-300 font-medium">Treatment: </span>
                <span className="line-clamp-1">{cat.disposal_guide}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
