"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import mqtt from "mqtt";

const MQTT_BROKER = "ws://broker.hivemq.com:8000/mqtt";
const MQTT_TOPIC = "my_home/fall_detection/data";

interface MqttContextType {
  isFall: boolean;
  sensorData: any[]; // ข้อมูลสำหรับกราฟ
  latestPayload: any | null; // ข้อมูลล่าสุดทั้งหมด (รวม Gyro, Temp)
  connectionStatus: string;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const [isFall, setIsFall] = useState(false);
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [latestPayload, setLatestPayload] = useState<any | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");

  const fallTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAlertTimeRef = useRef(0);

  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER);

    client.on("connect", () => {
      setConnectionStatus("Connected");
      client.subscribe(MQTT_TOPIC);
    });

    client.on("message", (topic, message) => {
      if (topic === MQTT_TOPIC) {
        const payload = JSON.parse(message.toString());
        setLatestPayload(payload); // เก็บข้อมูลล่าสุดไว้ใช้งาน

        const isFallDetected = payload.status === "FALL";

        if (isFallDetected) {
          setIsFall(true);
          if (fallTimerRef.current) clearTimeout(fallTimerRef.current);
          fallTimerRef.current = setTimeout(() => {
            setIsFall(false);
            fallTimerRef.current = null;
          }, 10000);

          const now = Date.now();
          if (now - lastAlertTimeRef.current > 5000) {
            fetch("/api/logs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "FALL DETECTED",
                x: payload.acc.x,
                y: payload.acc.y,
                z: payload.acc.z,
              }),
            });
            lastAlertTimeRef.current = now;
          }
        }

        const newPoint = {
          time: new Date().toLocaleTimeString("th-TH", { hour12: false }),
          x: payload.acc.x,
          y: payload.acc.y,
          z: payload.acc.z,
        };
        setSensorData((prev) => [...prev, newPoint].slice(-20));
      }
    });

    return () => {
      if (client) client.end();
    };
  }, []);

  return (
    <MqttContext.Provider
      value={{ isFall, sensorData, latestPayload, connectionStatus }}
    >
      {children}
    </MqttContext.Provider>
  );
}

export const useMqtt = () => {
  const context = useContext(MqttContext);
  if (!context) throw new Error("useMqtt must be used within MqttProvider");
  return context;
};
