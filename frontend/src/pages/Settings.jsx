import React from 'react';
import { Settings as SettingsIcon, Globe, Shield, Database, Cpu, ExternalLink } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-emerald-400" />
          System Settings & Regional Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize application language, review local ML model parameters, and check connected services.
        </p>
      </div>

      {/* Language Preferences */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-400" />
          Language & Regional Localization (Multilingual Support)
        </h2>
        <p className="text-xs text-slate-400">
          SmartBioWaste AI supports English, Tamil (தமிழ்), and Hindi (हिंदी) across all clinical interfaces, voice responses, and safety checklists.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {[
            { id: 'en', title: 'English', desc: 'Default Clinical Standard' },
            { id: 'ta', title: 'தமிழ் (Tamil)', desc: 'Regional Hospital Voice & SOPs' },
            { id: 'hi', title: 'हिंदी (Hindi)', desc: 'National Health Guidelines' }
          ].map((lang) => (
            <div
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                language === lang.id
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-md'
                  : 'bg-slate-800/50 border-slate-750 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <h3 className="text-sm font-bold">{lang.title}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{lang.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Profile & Local Environment */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          Local Architecture & Model Specs
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750">
            <span className="text-slate-400 block mb-1">Primary Deep Learning Model</span>
            <span className="font-bold text-white text-sm">EfficientNet-B0 (PyTorch)</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Input: 224x224x3 • 9 Target Waste Streams</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750">
            <span className="text-slate-400 block mb-1">Explainability Engine</span>
            <span className="font-bold text-white text-sm">Grad-CAM (Gradient Weighted CAM)</span>
            <span className="text-[10px] text-blue-400 block mt-0.5">Target: Final Convolutional Feature Map</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750">
            <span className="text-slate-400 block mb-1">Database Architecture</span>
            <span className="font-bold text-white text-sm">PostgreSQL / SQLAlchemy ORM</span>
            <span className="text-[10px] text-purple-400 block mt-0.5">Tables: Users, Scans, Bins, Collections, Incidents</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750">
            <span className="text-slate-400 block mb-1">Forecasting Module</span>
            <span className="font-bold text-white text-sm">Scikit-learn Ridge Regression</span>
            <span className="text-[10px] text-amber-400 block mt-0.5">Horizons: Next Day, Next 7 Days, Next Month</span>
          </div>
        </div>
      </div>

      {/* API Documentation Quick Link */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Interactive Swagger OpenAPI Documentation</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Test all backend endpoints, inspect request/response schemas, and verify authentication tokens.
          </p>
        </div>
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs border border-slate-700 transition"
        >
          <span>Open /docs</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
