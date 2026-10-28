import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Download,
  Trash2,
  Eye,
  Filter,
  Search,
  Calendar,
  Layers,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import BinBadge from '../components/BinBadge';

export default function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [binType, setBinType] = useState('all');
  const [risk, setRisk] = useState('all');
  const [selectedScan, setSelectedScan] = useState(null);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const data = await api.getScans({
        search,
        category: category === 'all' ? '' : category,
        bin_type: binType === 'all' ? '' : binType,
        risk: risk === 'all' ? '' : risk,
        limit: 100
      });
      setScans(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [category, binType, risk]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchScans();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this scan record?")) return;
    try {
      await api.deleteScan(id);
      setScans(prev => prev.filter(s => s.id !== id));
      if (selectedScan?.id === id) setSelectedScan(null);
    } catch (err) {
      alert("Failed to delete scan record: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-emerald-400" />
            Hospital Bio-Waste AI Scan History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete audited log of all automated AI classifications, confidence levels, and destination bin allocations.
          </p>
        </div>

        <a
          href={api.getExportScansUrl()}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export CSV Manifest</span>
        </a>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items or classes..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Classes</option>
            <option value="infectious">Infectious</option>
            <option value="sharps">Sharps</option>
            <option value="contaminated_recyclable">Contaminated Plastics</option>
            <option value="glassware">Glassware</option>
            <option value="chemical">Chemicals</option>
            <option value="pharmaceutical">Pharmaceutical</option>
            <option value="anatomical">Anatomical</option>
            <option value="radiological_hazard">Radiological</option>
          </select>

          {/* Bin */}
          <select
            value={binType}
            onChange={(e) => setBinType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Bins</option>
            <option value="YELLOW">Yellow Bin</option>
            <option value="RED">Red Bin</option>
            <option value="WHITE">White Bin</option>
            <option value="BLUE">Blue Bin</option>
          </select>

          {/* Risk */}
          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Risk Tiers</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 pb-3">
              <tr>
                <th className="py-2.5 px-3">Scan ID</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Identified Item</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Destination Bin</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading scan log records...
                  </td>
                </tr>
              ) : scans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No scan logs matched your filter criteria.
                  </td>
                </tr>
              ) : (
                scans.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 font-mono text-slate-400">
                      #{s.id}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {new Date(s.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {s.display_name}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        s.confidence >= 0.85
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {(s.confidence * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      <span className={
                        s.risk_level === 'Critical' ? 'text-red-400' :
                        s.risk_level === 'High' ? 'text-rose-400' :
                        s.risk_level === 'Moderate' ? 'text-amber-400' : 'text-slate-400'
                      }>
                        {s.risk_level}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <BinBadge bin={s.recommended_bin} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedScan(s)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-red-400 transition"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-emerald-400 font-bold">Scan Record #{selectedScan.id}</span>
                <h3 className="text-lg font-bold text-white">{selectedScan.display_name}</h3>
              </div>
              <BinBadge bin={selectedScan.recommended_bin} size="sm" />
            </div>

            <div className="space-y-2 text-xs">
              <p><span className="text-slate-400 font-medium">Confidence: </span>{(selectedScan.confidence * 100).toFixed(1)}% ({selectedScan.confidence_level})</p>
              <p><span className="text-slate-400 font-medium">Risk Level: </span>{selectedScan.risk_level}</p>
              <p><span className="text-slate-400 font-medium">Segregation: </span>{selectedScan.segregation_method}</p>
              <p><span className="text-slate-400 font-medium">Handling: </span>{selectedScan.handling_method}</p>
              <p><span className="text-slate-400 font-medium">Disposal: </span>{selectedScan.disposal_method}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedScan(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
