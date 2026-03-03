"use client";

import { useMqtt } from "./context/MqttContext";
import StatusCard from "./components/StatusCard";
import SensorChart from "./components/SensorChart";
import Link from "next/link";
import { Activity, History, ShieldCheck, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const { isFall, sensorData, connectionStatus } = useMqtt();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main
      className={`min-h-screen transition-colors duration-500 ${isFall ? "bg-red-50" : "bg-slate-50"} p-4 md:p-8`}
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                FallGuard Security
              </h1>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                <span
                  className={`w-2 h-2 rounded-full ${connectionStatus === "Connected" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
                ></span>
                <span className="font-medium text-slate-600">
                  {connectionStatus}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-4 h-4" />
                <span>{currentTime.toLocaleTimeString("th-TH")}</span>
              </div>
            </div>
          </div>

          <Link
            href="/history"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 font-medium"
          >
            <History className="w-4 h-4" />
            View History Logs
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-1 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <StatusCard isFall={isFall} />
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Live Metrics
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">X-Axis</p>
                  <p className="font-mono font-bold text-slate-700">
                    {sensorData[sensorData.length - 1]?.x?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div className="text-center border-x border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">Y-Axis</p>
                  <p className="font-mono font-bold text-slate-700">
                    {sensorData[sensorData.length - 1]?.y?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 mb-1">Z-Axis</p>
                  <p className="font-mono font-bold text-slate-700">
                    {sensorData[sensorData.length - 1]?.z?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-lg">
                Accelerometer Real-time Chart
              </h3>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-bold">
                LIVE
              </span>
            </div>
            <div className="h-[400px]">
              <SensorChart data={sensorData} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
