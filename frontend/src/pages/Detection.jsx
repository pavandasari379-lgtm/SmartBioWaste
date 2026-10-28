import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Camera,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import CameraModal from '../components/CameraModal';

export default function Detection() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Analysis State & Progress
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [qualityError, setQualityError] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const ANALYSIS_STEPS = [
    t('detection.step_checking'),
    t('detection.step_inference'),
    t('detection.step_gradcam'),
    t('detection.step_rules')
  ];

  const handleFileChange = (file) => {
    if (!file) return;
    setError(null);
    setQualityError(null);

    // Validate type
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setError("Please upload an image file (JPG, PNG, or WEBP).");
      return;
    }

    // Validate size (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      setError("File size exceeds 15MB limit. Please upload a smaller image.");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    setQualityError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startAnalysis = async (skipQuality = false) => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setError(null);
    setQualityError(null);
    setAnalysisStep(0);

    // Simulate step progress
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      const result = await api.predictWaste(selectedFile, skipQuality);
      clearInterval(stepInterval);
      setAnalysisStep(3);
      // Navigate to results page with prediction payload
      navigate('/detection/result', { state: { result } });
    } catch (err) {
      clearInterval(stepInterval);
      setAnalyzing(false);
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error === 'POOR_IMAGE_QUALITY') {
          setQualityError(parsed);
          return;
        }
      } catch {
        // Not a quality error JSON
      }
      setError(err.message || "Failed to analyze image. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EfficientNet-B0 + Grad-CAM Explainable Vision</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t('detection.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          {t('detection.subtitle')}
        </p>
      </div>

      {/* Main Upload / Camera Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Analysis Notice</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Poor Quality Warning Prompt */}
        {qualityError && (
          <div className="mb-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-bold text-sm">Image Quality Alert: {qualityError.message}</p>
                <p className="mt-1 text-slate-300">
                  Quality Score: {(qualityError.quality_score * 100).toFixed(0)}% • Blur Rating: {qualityError.blur_score}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleClear}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
              >
                Retake Clearer Photo
              </button>
              <button
                onClick={() => startAnalysis(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
              >
                Proceed Anyway (Bypass Quality Check)
              </button>
            </div>
          </div>
        )}

        {!previewUrl ? (
          /* Drag & Drop Area */
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
              dragActive
                ? 'border-emerald-400 bg-emerald-500/10 scale-[0.99]'
                : 'border-slate-750 hover:border-emerald-500/50 bg-slate-950/40 hover:bg-slate-950/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                {t('detection.drop_prompt')}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {t('detection.supported_formats')}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                Browse Files
              </button>
              <span className="text-xs text-slate-500">or</span>
              <button
                type="button"
                onClick={() => setCameraModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition"
              >
                <Camera className="w-3.5 h-3.5" />
                Live Camera
              </button>
            </div>
          </div>
        ) : (
          /* Preview and Action Box */
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video max-h-96 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Waste Preview"
                className="w-full h-full object-contain"
              />

              {!analyzing && (
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={handleClear}
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-red-500/80 text-white backdrop-blur border border-slate-700 transition"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Live Loading Overlay */}
              {analyzing && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {ANALYSIS_STEPS[analysisStep]}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Step {analysisStep + 1} of 4 • Analyzing biohazard traits
                    </p>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-48 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${((analysisStep + 1) / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            {!analyzing && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Image ready for AI inspection & safety rule matching</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => startAnalysis(false)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t('detection.analyze_btn')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={(blobFile) => handleFileChange(blobFile)}
      />
    </div>
  );
}
