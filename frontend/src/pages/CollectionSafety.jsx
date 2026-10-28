import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckSquare,
  Square,
  AlertTriangle,
  PlayCircle,
  CheckCircle,
  Truck,
  Flame,
  Syringe,
  Boxes
} from 'lucide-react';
import { api } from '../services/api';

export default function CollectionSafety() {
  const [checklistData, setChecklistData] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [inProgress, setInProgress] = useState(false);
  const [activeStreamWarning, setActiveStreamWarning] = useState('sharps');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getCollectionSafetyChecklist();
        setChecklistData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleCheck = (id) => {
    if (inProgress) return;
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const allRequiredChecked = checklistData?.checklist?.every(item => checkedItems[item.id]) ?? false;

  const handleStartCollection = () => {
    if (!allRequiredChecked) return;
    setInProgress(true);
  };

  const handleFinishCollection = () => {
    setInProgress(false);
    setCheckedItems({});
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Loading Collection Safety Protocol...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Waste Collection Safety & Dispatch Checklist
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Mandatory personal protective equipment and inspection protocol for hospital waste handlers.
          </p>
        </div>

        {inProgress && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" /> Collection Run in Progress
          </span>
        )}
      </div>

      {/* Main Checklist Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-base font-bold text-white">
            {checklistData?.title || 'Pre-Collection Safety Inspection'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            All checkpoints must be explicitly verified before transit trolleys are loaded.
          </p>
        </div>

        {/* Check items */}
        <div className="space-y-2.5">
          {(checklistData?.checklist || []).map((item) => {
            const isChecked = !!checkedItems[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-100'
                    : 'bg-slate-800/50 border-slate-750 text-slate-300 hover:bg-slate-800'
                } ${inProgress ? 'opacity-80 cursor-not-allowed' : ''}`}
              >
                {isChecked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500 shrink-0" />
                )}
                <span className="text-xs sm:text-sm font-medium">{item.item}</span>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-400">
            {Object.values(checkedItems).filter(Boolean).length} of {checklistData?.checklist?.length} verified
          </span>

          {!inProgress ? (
            <button
              onClick={handleStartCollection}
              disabled={!allRequiredChecked}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              <span>START COLLECTION RUN</span>
            </button>
          ) : (
            <button
              onClick={handleFinishCollection}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>COMPLETE COLLECTION & LOG</span>
            </button>
          )}
        </div>
      </div>

      {/* Live In-Transit Category Hazards (Active during collection) */}
      {inProgress && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              In-Transit Category Biohazard Warnings
            </h3>
            <span className="text-[11px] text-amber-400 font-semibold">Active Monitoring</span>
          </div>

          <div className="flex gap-2 border-b border-amber-500/20 pb-3">
            {[
              { id: 'sharps', label: 'Sharps (White)' },
              { id: 'infectious', label: 'Infectious (Yellow)' },
              { id: 'chemical', label: 'Chemicals (Yellow)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveStreamWarning(tab.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  activeStreamWarning === tab.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-amber-300 hover:bg-amber-500/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-200 space-y-2">
            {activeStreamWarning === 'sharps' && (
              <div>
                <p className="font-semibold text-white">White Puncture-Proof Sharps Warning:</p>
                <p className="text-slate-300 mt-0.5">
                  Never carry loose needles. If a container lid is cracked or open, do not attempt to force shut. Use secondary transport box immediately.
                </p>
              </div>
            )}
            {activeStreamWarning === 'infectious' && (
              <div>
                <p className="font-semibold text-white">Yellow Biohazard Bag Handling:</p>
                <p className="text-slate-300 mt-0.5">
                  Hold bag strictly by neck tie. Never press bags against your thighs or torso while walking through corridors.
                </p>
              </div>
            )}
            {activeStreamWarning === 'chemical' && (
              <div>
                <p className="font-semibold text-white">Chemical & Solvent Container Security:</p>
                <p className="text-slate-300 mt-0.5">
                  Keep bottle caps finger-tightened. Verify secondary leak tray is placed under transport containers.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
