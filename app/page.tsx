"use client";

import { useMqtt } from "./context/MqttContext";
import StatusCard from "./components/StatusCard";
import SensorChart from "./components/SensorChart";
import Link from "next/link";
import {
  Activity,
  History,
  ShieldCheck,
  Clock,
  Thermometer,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const { isFall, sensorData, latestPayload, connectionStatus } = useMqtt();

  // 1. แก้ไข: เริ่มต้นค่าเป็น null เพื่อไม่ให้ Server และ Client เรนเดอร์ต่างกัน
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // 2. แก้ไข: กำหนดเวลาทันทีที่ Component mount บน Browser
    setCurrentTime(new Date());

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
                FallGuard Dashboard
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
              <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                <Clock className="w-4 h-4" />
                {/* 3. แก้ไข: เช็คก่อนแสดงผล ถ้ายังไม่มีค่าให้แสดง --:--:-- ไปก่อน */}
                <span>
                  {currentTime
                    ? currentTime.toLocaleTimeString("th-TH")
                    : "--:--:--"}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/history"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium"
          >
            <History className="w-4 h-4" /> View History
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <StatusCard isFall={isFall} />

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2 flex items-center gap-2">
                <Thermometer className="w-4 h-4" /> Device Temp
              </h3>
              <p className="text-4xl font-bold text-slate-800">
                {latestPayload?.temp?.toFixed(1) || "--.-"}°C
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Gyroscope (deg/s)
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <p className="text-[10px] text-slate-400">X</p>
                  <p className="font-bold text-indigo-600">
                    {latestPayload?.gyro?.x?.toFixed(1) || "0.0"}
                  </p>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <p className="text-[10px] text-slate-400">Y</p>
                  <p className="font-bold text-indigo-600">
                    {latestPayload?.gyro?.y?.toFixed(1) || "0.0"}
                  </p>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <p className="text-[10px] text-slate-400">Z</p>
                  <p className="font-bold text-indigo-600">
                    {latestPayload?.gyro?.z?.toFixed(1) || "0.0"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="h-[450px]">
              <SensorChart data={sensorData} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
