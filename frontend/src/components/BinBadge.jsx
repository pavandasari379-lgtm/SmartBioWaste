import React from 'react';

export default function BinBadge({ bin, size = "md" }) {
  const b = (bin || "YELLOW").toUpperCase();

  const styles = {
    YELLOW: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    RED: "bg-red-500/20 text-red-300 border-red-500/40",
    WHITE: "bg-slate-100/20 text-slate-100 border-slate-300/40",
    BLUE: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    BLACK: "bg-slate-700/50 text-slate-300 border-slate-600",
    RADIATION_ALERT: "bg-amber-900/50 text-amber-200 border-amber-500 animate-pulse font-bold"
  };

  const labels = {
    YELLOW: "Yellow Bin (Incineration / Autoclave)",
    RED: "Red Bin (Recyclable Plastics)",
    WHITE: "White Bin (Puncture-Proof Sharps)",
    BLUE: "Blue Box (Glassware & Implants)",
    BLACK: "Black / Green Bin (General)",
    RADIATION_ALERT: "⚠️ RADIATION HAZARD PROTOCOL"
  };

  const sizeClass = size === "sm" 
    ? "text-xs px-2 py-0.5" 
    : size === "lg" 
      ? "text-base px-4 py-2 font-semibold" 
      : "text-sm px-3 py-1";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${styles[b] || styles.YELLOW} ${sizeClass}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${
        b === 'YELLOW' ? 'bg-amber-400' :
        b === 'RED' ? 'bg-red-500' :
        b === 'WHITE' ? 'bg-white' :
        b === 'BLUE' ? 'bg-blue-400' :
        b === 'RADIATION_ALERT' ? 'bg-amber-400 animate-ping' : 'bg-slate-400'
      }`} />
      {labels[b] || b}
    </span>
  );
}
