import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Plus,
  ShieldAlert,
  Clock,
  CheckCircle,
  Filter,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function Incidents() {
  const { user, isAdmin } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    type: 'Needle-stick injury',
    category: 'sharps',
    location: '',
    description: '',
    priority: 'HIGH'
  });

  const loadIncidents = async () => {
    try {
      const data = await api.getIncidents(statusFilter === 'ALL' ? '' : statusFilter);
      setIncidents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.reportIncident(formData);
      setModalOpen(false);
      setFormData({
        type: 'Needle-stick injury',
        category: 'sharps',
        location: '',
        description: '',
        priority: 'HIGH'
      });
      loadIncidents();
    } catch (err) {
      alert("Failed to report incident: " + err.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateIncident(id, {
        status,
        resolution_notes: resolutionNotes || undefined
      });
      setSelectedIncident(null);
      setResolutionNotes('');
      loadIncidents();
    } catch (err) {
      alert("Failed to update incident: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
            Hospital Biohazard & Safety Incident Reporting
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Report and manage exposure accidents, spills, needle-stick injuries, and container defects.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Safety Incident</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        {['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === s
                ? 'bg-rose-500 text-white shadow'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            {s === 'ALL' ? 'All Incidents' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Incident Cards / List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading incident records...</div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-slate-900 rounded-3xl border border-slate-800">
            No safety incidents logged under this status.
          </div>
        ) : (
          incidents.map((inc) => (
            <div
              key={inc.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    inc.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    inc.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    inc.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {inc.priority} PRIORITY
                  </span>
                  <span className="text-xs text-slate-400 font-mono">#{inc.id}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" /> {inc.location}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  {inc.type} {inc.category && `(${inc.category})`}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {inc.description}
                </p>

                {inc.resolution_notes && (
                  <p className="text-[11px] text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 p-2 rounded-xl mt-2">
                    <span className="font-semibold">Resolution Note: </span>{inc.resolution_notes}
                  </p>
                )}
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  inc.status === 'RESOLVED' || inc.status === 'CLOSED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  inc.status === 'UNDER_REVIEW' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                  'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {inc.status.replace('_', ' ')}
                </span>

                <button
                  onClick={() => setSelectedIncident(inc)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  Manage / Update →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Report Incident Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              File Bio-Safety Incident Report
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                >
                  <option value="Needle-stick injury">Needle-stick injury</option>
                  <option value="Spill">Chemical / Bodily Fluid Spill</option>
                  <option value="Leakage">Container Leakage / Rupture</option>
                  <option value="Broken glass">Broken glass laceration hazard</option>
                  <option value="Incorrect segregation">Incorrect waste stream segregation</option>
                  <option value="Container issue">Defective / Overfilled bin container</option>
                  <option value="Suspected radiation hazard">Suspected Radiation Hazard</option>
                  <option value="Other">Other Safety Hazard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Waste Stream Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                >
                  <option value="sharps">Sharps</option>
                  <option value="infectious">Infectious</option>
                  <option value="chemical">Chemical</option>
                  <option value="contaminated_recyclable">Contaminated Plastics</option>
                  <option value="glassware">Glassware</option>
                  <option value="pharmaceutical">Pharmaceutical</option>
                  <option value="anatomical">Anatomical</option>
                  <option value="radiological_hazard">Radiological</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Specific Location / Room</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. ICU Ward 3, Bed 12"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Rating</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical (Immediate PEP / Spill response)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description of Incident</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what occurred, any injury, decontamination performed, and involved staff..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500 h-24"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md"
                >
                  Submit Official Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident Status Update Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Triage Incident #{selectedIncident.id}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Resolution & Corrective Actions</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter actions taken (e.g. PEP administered, area sanitized, staff re-trained)..."
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleUpdateStatus(selectedIncident.id, 'UNDER_REVIEW')}
                className="py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/30"
              >
                Mark Under Review
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedIncident.id, 'RESOLVED')}
                className="py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow"
              >
                Mark Resolved
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
