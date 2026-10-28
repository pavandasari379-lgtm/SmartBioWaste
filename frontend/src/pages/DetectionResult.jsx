import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ArrowLeft,
  Share2,
  Info,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import BinBadge from '../components/BinBadge';
import GradCamViewer from '../components/GradCamViewer';

export default function DetectionResult() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.result;

  if (!result) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Detection Data Found</h2>
        <p className="text-xs text-slate-400">
          Please upload or take a photo of a biomedical waste item first.
        </p>
        <Link
          to="/detection"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Detection
        </Link>
      </div>
    );
  }

  const isLowConfidence = result.confidence_level === 'Low';
  const isRadiological = result.predicted_class === 'radiological_hazard';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/detection')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('detection.retake')}</span>
        </button>

        <div className="flex items-center gap-2">
          {result.is_demo && (
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Demo Mode
            </span>
          )}
          <span className="text-xs text-slate-400">Scan ID: #{result.scan_id || 'TEMP'}</span>
        </div>
      </div>

      {/* Critical Warnings (if low confidence or radiological) */}
      {result.warning && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 text-xs ${
          isRadiological
            ? 'bg-amber-900/60 border border-amber-500 text-amber-200 animate-pulse'
            : 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
        }`}>
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <p className="font-bold text-sm uppercase tracking-wider">
              {isRadiological ? 'CRITICAL RADIATION PROTOCOL' : 'CONFIDENCE ADVISORY'}
            </p>
            <p className="mt-1 leading-relaxed">{result.warning}</p>
          </div>
        </div>
      )}

      {/* Primary Classification Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            AI Bio-Detection Complete
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {result.display_name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400">Classification:</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
              {result.predicted_class}
            </span>
          </div>
        </div>

        {/* Confidence & Risk Badges */}
        <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="text-center px-3 border-r border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block">Confidence</span>
            <span className="text-2xl font-black text-white tracking-tight">
              {(result.confidence * 100).toFixed(1)}%
            </span>
            <span className={`block text-[10px] font-bold ${
              result.confidence_level === 'High' ? 'text-emerald-400' :
              result.confidence_level === 'Moderate' ? 'text-amber-400' : 'text-red-400'
            }`}>
              {result.confidence_level} Confidence
            </span>
          </div>

          <div className="text-center px-3">
            <span className="text-[11px] font-semibold text-slate-400 block">Biohazard Risk</span>
            <span className={`text-2xl font-black tracking-tight ${
              result.risk_level === 'Critical' ? 'text-red-400' :
              result.risk_level === 'High' ? 'text-rose-400' :
              result.risk_level === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {result.risk_level.toUpperCase()}
            </span>
            <span className="block text-[10px] font-bold text-slate-400">
              Safety Tier
            </span>
          </div>
        </div>
      </div>

      {/* Destination Bin Recommendation Showcase */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 ${
        result.recommended_bin === 'YELLOW' ? 'bg-amber-500/10 border-amber-500/30' :
        result.recommended_bin === 'RED' ? 'bg-red-500/10 border-red-500/30' :
        result.recommended_bin === 'WHITE' ? 'bg-slate-100/10 border-slate-300/30' :
        result.recommended_bin === 'BLUE' ? 'bg-blue-500/10 border-blue-500/30' :
        'bg-amber-950/30 border-amber-500/40'
      }`}>
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('detection.target_bin')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {result.recommended_bin === 'RADIATION_ALERT' ? 'SPECIAL RADIATION FACILITY' : `${result.recommended_bin} BIN`}
          </div>
          <p className="text-xs text-slate-300 max-w-lg">
            {result.segregation_method}
          </p>
        </div>

        <div className="shrink-0">
          <BinBadge bin={result.recommended_bin} size="lg" />
        </div>
      </div>

      {/* Grad-CAM Explainable AI Component */}
      <GradCamViewer
        originalImage={result.original_image}
        gradcamImage={result.gradcam_image}
        isDemo={result.is_demo}
      />

      {/* Detailed Rules & Handling Guidance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Handling & Disposal Guidance */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Safe Handling & Authorized Treatment
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-slate-300 block mb-1">Safe Handling Procedure:</span>
              <p className="text-slate-400 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-750">
                {result.handling_method}
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-300 block mb-1">Authorized Disposal / Treatment:</span>
              <p className="text-slate-400 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-750">
                {result.disposal_method}
              </p>
            </div>
          </div>
        </div>

        {/* Required PPE & Precautions */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <HeartHandshake className="w-5 h-5 text-emerald-400" />
            Mandatory PPE & Safety Precautions
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-slate-300 block mb-2">Required Protective Equipment:</span>
              <ul className="space-y-1.5">
                {(result.ppe || []).map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-300 bg-slate-800/40 px-3 py-1.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="font-semibold text-slate-300 block mb-1">Key Precautions:</span>
              <ul className="space-y-1 text-slate-400">
                {(result.safety_precautions || []).map((prec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{prec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Action Banner */}
      {result.emergency_action && (
        <div className="p-6 rounded-3xl bg-rose-950/30 border border-rose-500/30 text-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Emergency Incident Protocol</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {result.emergency_action}
          </p>
        </div>
      )}

      {/* Safety Notice Footer */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 text-center justify-center">
        <Info className="w-4 h-4 text-slate-500 shrink-0" />
        <span>{t('detection.safety_disclaimer')}</span>
      </div>
    </div>
  );
}
