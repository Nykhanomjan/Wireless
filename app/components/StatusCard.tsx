"use client";

import { Activity, AlertTriangle } from "lucide-react";

interface StatusCardProps {
  isFall: boolean;
}

export default function StatusCard({ isFall }: StatusCardProps) {
  return (
    <div
      className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 ${
        isFall
          ? "bg-red-50 border-red-200 shadow-red-100 animate-pulse"
          : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-600">Current Status</h3>
        {isFall ? (
          <AlertTriangle className="w-6 h-6 text-red-600" />
        ) : (
          <Activity className="w-6 h-6 text-emerald-500" />
        )}
      </div>

      <div className="flex items-center gap-3">
        <div
          className={`w-4 h-4 rounded-full ${isFall ? "bg-red-500" : "bg-emerald-500"}`}
        />
        <span
          className={`text-3xl font-bold ${isFall ? "text-red-700" : "text-slate-800"}`}
        >
          {isFall ? "FALL DETECTED!" : "Normal"}
        </span>
      </div>

      <p className="text-sm text-slate-500 mt-2">
        {isFall
          ? "Emergency alert sent via MQTT."
          : "Monitoring sensor data..."}
      </p>
    </div>
  );
}
