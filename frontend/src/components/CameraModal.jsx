import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedBlob(null);
      setCapturedPreview(null);
      setCameraError(null);
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera access denied or unavailable. You can use standard file upload instead.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_waste_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setCapturedBlob(file);
        setCapturedPreview(canvas.toDataURL('image/jpeg'));
      }
    }, 'image/jpeg', 0.92);
  };

  const handleRetake = () => {
    setCapturedBlob(null);
    setCapturedPreview(null);
  };

  const handleConfirm = () => {
    if (capturedBlob) {
      onCapture(capturedBlob);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Camera className="w-5 h-5 text-emerald-400" />
            <span>Capture Biomedical Waste Photo</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-red-400 text-sm max-w-md">
              <p>{cameraError}</p>
            </div>
          ) : capturedPreview ? (
            <img src={capturedPreview} alt="Captured" className="w-full h-full object-contain" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Guide Overlay */}
          {!capturedPreview && !cameraError && (
            <div className="absolute inset-8 border-2 border-dashed border-emerald-400/40 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-xs text-emerald-300/80 bg-slate-900/80 px-2 py-1 rounded backdrop-blur">
                Center waste item in frame
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-center gap-4 bg-slate-900/90">
          {capturedPreview ? (
            <>
              <button
                onClick={handleRetake}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition"
              >
                <Check className="w-4 h-4" />
                Analyze This Photo
              </button>
            </>
          ) : (
            <button
              onClick={handleCapture}
              disabled={!!cameraError}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold shadow-lg shadow-emerald-500/20 transition"
            >
              <Camera className="w-5 h-5" />
              Capture Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
