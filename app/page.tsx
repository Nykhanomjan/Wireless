"use client";

import { useState, useEffect, useRef } from "react"; // เพิ่ม useRef
import mqtt from "mqtt";
import StatusCard from "./components/StatusCard";
import SensorChart from "./components/SensorChart";
import Link from "next/link";

// *** ตั้งค่า MQTT ***
const MQTT_BROKER = "wss://broker.hivemq.com:8000/mqtt";
const MQTT_TOPIC = "my_home/fall_detection/data";

export default function Home() {
  const [isFall, setIsFall] = useState(false);
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");

  // ใช้ useRef เพื่อจำเวลาล่าสุดที่แจ้งเตือน (ค่าจะไม่หายและไม่อ้างอิง State เก่า)
  const lastAlertTimeRef = useRef(0);

  useEffect(() => {
    console.log("Connecting to MQTT...");

    const client = mqtt.connect(MQTT_BROKER);

    client.on("connect", () => {
      console.log("Connected to MQTT Broker");
      setConnectionStatus("Connected");
      client.subscribe(MQTT_TOPIC);
    });

    client.on("message", (topic, message) => {
      if (topic === MQTT_TOPIC) {
        const payload = JSON.parse(message.toString());

        // 1. แก้การเช็คสถานะล้ม (จาก Python ส่งมาเป็น string "FALL" หรือ "false")
        const isFallDetected = payload.status === "FALL";
        setIsFall(isFallDetected);

        // -------------------------------------------------------
        // ส่วนบันทึก Log ลง Database
        // -------------------------------------------------------
        if (isFallDetected) {
          const now = Date.now();
          if (now - lastAlertTimeRef.current > 5000) {
            fetch("/api/logs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "FALL DETECTED",
                // 2. แก้การดึงค่า XYZ (ต้องเจาะเข้าไปใน object "acc")
                x: payload.acc.x,
                y: payload.acc.y,
                z: payload.acc.z,
              }),
            })
              .then(() => console.log("✅ Log saved"))
              .catch((err) => console.error("❌ Save failed:", err));

            lastAlertTimeRef.current = now;
          }
        }

        // -------------------------------------------------------
        // 3. แก้การดึงค่าลงกราฟ (เจาะเข้า object "acc" เหมือนกัน)
        // -------------------------------------------------------
        const nowTime = new Date();
        const timeStr = nowTime.toLocaleTimeString("th-TH", { hour12: false });

        const newPoint = {
          time: timeStr,
          x: payload.acc.x, // แก้ตรงนี้
          y: payload.acc.y, // แก้ตรงนี้
          z: payload.acc.z, // แก้ตรงนี้
        };

        setSensorData((prev) => {
          const newData = [...prev, newPoint];
          if (newData.length > 20) return newData.slice(newData.length - 20);
          return newData;
        });
      }
    });

    // Cleanup function
    return () => {
      if (client) client.end();
    };
  }, []); // dependency array ว่าง เพื่อให้ connect แค่ครั้งเดียวตอนเปิดหน้าเว็บ

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Fall Detection Dashboard
          </h1>
          <p className="text-slate-500">
            System Status:{" "}
            <span
              className={
                connectionStatus === "Connected"
                  ? "text-green-600 font-bold"
                  : "text-red-500"
              }
            >
              {connectionStatus}
            </span>
          </p>
        </div>

        <div className="flex gap-3">
          {/* ปุ่มไปหน้า History */}
          <Link
            href="/history"
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium flex items-center gap-2"
          >
            View History
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <StatusCard isFall={isFall} />
          {/* คุณสามารถใส่ Device Info เพิ่มตรงนี้ได้ตามเดิม */}
        </div>

        <div className="md:col-span-2">
          <SensorChart data={sensorData} />
        </div>
      </div>
    </main>
  );
}
