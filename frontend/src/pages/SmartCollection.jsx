import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  PlayCircle,
  RefreshCw,
  MapPin,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import BinBadge from '../components/BinBadge';

export default function SmartCollection() {
  const [bins, setBins] = useState([]);
  const [collections, setCollections] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedBinId, setSelectedBinId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [binList, colList] = await Promise.all([
        api.getBins(),
        api.getCollections(statusFilter === 'ALL' ? '' : statusFilter)
      ]);
      setBins(binList || []);
      setCollections(colList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBinId) return;
    try {
      await api.scheduleCollection({
        bin_id: parseInt(selectedBinId),
        notes
      });
      setScheduleModalOpen(false);
      setSelectedBinId('');
      setNotes('');
      loadData();
    } catch (err) {
      alert("Scheduling error: " + err.message);
    }
  };

  const handleStatusUpdate = async (colId, newStatus) => {
    try {
      await api.updateCollection(colId, { status: newStatus });
      loadData();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-400" />
            Smart Hospital Bio-Waste Collection & Bin Dispatch
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry on hospital waste receptacles, threshold alerts, and automated collection task management.
          </p>
        </div>

        <button
          onClick={() => setScheduleModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch Collection Run</span>
        </button>
      </div>

      {/* Real-time Bins Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white">Monitored Hospital Bin Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {bins.map((bin) => {
            const isCritical = bin.status === 'COLLECTION_REQUIRED';
            const isNear = bin.status === 'NEAR_CAPACITY';

            return (
              <div
                key={bin.id}
                className={`p-5 rounded-3xl bg-slate-900 border shadow-xl flex flex-col justify-between transition ${
                  isCritical
                    ? 'border-red-500/50 bg-red-950/10'
                    : isNear
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : 'border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{bin.bin_name}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{bin.location}</span>
                      </p>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      isNear ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {bin.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <BinBadge bin={bin.bin_type} size="sm" />
                  </div>

                  {/* Meter */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400">Fill Capacity:</span>
                      <span className="font-extrabold text-white">{bin.capacity_percentage}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCritical ? 'bg-red-500' : isNear ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, bin.capacity_percentage)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {isCritical && (
                  <button
                    onClick={() => {
                      setSelectedBinId(bin.id.toString());
                      setScheduleModalOpen(true);
                    }}
                    className="mt-4 w-full py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs border border-red-500/30 transition"
                  >
                    Quick Dispatch
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Collection Operations Task Board */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Collection Tasks & Schedules</h3>
            <p className="text-xs text-slate-400">Track clearance status from scheduling to incinerator / treatment handover</p>
          </div>

          <div className="flex items-center gap-1.5">
            {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  statusFilter === st
                    ? 'bg-emerald-500 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'All Tasks' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 pb-2">
              <tr>
                <th className="py-2.5 px-3">Task ID</th>
                <th className="py-2.5 px-3">Target Bin</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Scheduled For</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Collector</th>
                <th className="py-2.5 px-3 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {collections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No collection records found.
                  </td>
                </tr>
              ) : (
                collections.map((col) => (
                  <tr key={col.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 font-mono text-slate-400">#{col.id}</td>
                    <td className="py-3 px-3 font-semibold text-white">{col.bin?.bin_name || `Bin #${col.bin_id}`}</td>
                    <td className="py-3 px-3 text-slate-400">{col.bin?.location || 'General Ward'}</td>
                    <td className="py-3 px-3 text-slate-300">
                      {new Date(col.scheduled_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        col.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        col.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {col.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {col.collector?.full_name || 'Assigned Collector'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {col.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleStatusUpdate(col.id, 'IN_PROGRESS')}
                          className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] border border-amber-500/30 transition"
                        >
                          Start Run
                        </button>
                      )}
                      {col.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStatusUpdate(col.id, 'COMPLETED')}
                          className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] shadow-sm transition"
                        >
                          Mark Completed
                        </button>
                      )}
                      {col.status === 'COMPLETED' && (
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              Dispatch Collection Run
            </h3>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Bin</label>
                <select
                  required
                  value={selectedBinId}
                  onChange={(e) => setSelectedBinId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select hospital bin...</option>
                  {bins.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bin_name} ({b.capacity_percentage}% Full - {b.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Dispatch Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Urgent morning clearance before surgery session..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 h-20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md"
                >
                  Schedule Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
