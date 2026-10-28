import React, { useState } from 'react';
import { Eye, Layers, Info } from 'lucide-react';

export default function GradCamViewer({ originalImage, gradcamImage, isDemo }) {
  const [activeTab, setActiveTab] = useState('overlay'); // 'side-by-side', 'overlay', 'original'

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Explainable AI: Grad-CAM Activation Map
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Visual saliency heatmap highlighting discriminative features learned by EfficientNet-B0.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex rounded-lg bg-slate-900/90 p-1 border border-slate-700">
          <button
            onClick={() => setActiveTab('side-by-side')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'side-by-side' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setActiveTab('overlay')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'overlay' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Grad-CAM Overlay
          </button>
          <button
            onClick={() => setActiveTab('original')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'original' ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Original
          </button>
        </div>
      </div>

      {isDemo && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>Demo Mode: Heatmap is generated via synthetic attention modeling. Connect trained weights to run live layer gradients.</span>
        </div>
      )}

      {/* Image Display */}
      {activeTab === 'side-by-side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex flex-col items-center">
            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/70 text-[11px] font-medium text-slate-200 backdrop-blur">
              Original Waste Photo
            </span>
            <img
              src={originalImage}
              alt="Original Waste"
              className="w-full h-64 object-contain"
            />
          </div>
          <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex flex-col items-center">
            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[11px] font-medium backdrop-blur">
              Grad-CAM Heatmap Focus
            </span>
            <img
              src={gradcamImage || originalImage}
              alt="Grad-CAM Heatmap"
              className="w-full h-64 object-contain"
            />
          </div>
        </div>
      ) : activeTab === 'overlay' ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex justify-center">
          <img
            src={gradcamImage || originalImage}
            alt="Grad-CAM Overlay"
            className="w-full max-h-80 object-contain rounded-xl"
          />
          <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-slate-900/90 text-xs text-slate-300 border border-slate-700 flex items-center gap-1.5 backdrop-blur">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            Red/Warm zones = Highest neural attention
          </span>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex justify-center">
          <img
            src={originalImage}
            alt="Original"
            className="w-full max-h-80 object-contain rounded-xl"
          />
        </div>
      )}
    </div>
  );
}
