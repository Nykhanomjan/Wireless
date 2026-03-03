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
  client: mqtt.MqttClient | null;
  isFall: boolean;
  connectionStatus: string;
  sensorData: any[];
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [isFall, setIsFall] = useState(false);
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const fallTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAlertTimeRef = useRef(0);

  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_BROKER);

    mqttClient.on("connect", () => {
      setConnectionStatus("Connected");
      mqttClient.subscribe(MQTT_TOPIC);
    });

    mqttClient.on("message", (topic, message) => {
      if (topic === MQTT_TOPIC) {
        const payload = JSON.parse(message.toString());
        const isFallDetected = payload.status === "FALL";

        if (isFallDetected) {
          setIsFall(true);
          if (fallTimerRef.current) clearTimeout(fallTimerRef.current);
          fallTimerRef.current = setTimeout(() => {
            setIsFall(false);
            fallTimerRef.current = null;
          }, 10000);

          // บันทึก Log ลง Database (ย้าย Logic มาไว้ที่นี่เพื่อให้ทำงานได้ทุกหน้า)
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
            }).then(() => console.log("✅ Log saved"));
            lastAlertTimeRef.current = now;
          }
        }

        const newPoint = {
          time: new Date().toLocaleTimeString("th-TH", { hour12: false }),
          x: payload.acc.x,
          y: payload.acc.y,
          z: payload.acc.z,
        };

        setSensorData((prev) => {
          const newData = [...prev, newPoint];
          return newData.slice(-20);
        });
      }
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []);

  return (
    <MqttContext.Provider
      value={{ client, isFall, connectionStatus, sensorData }}
    >
      {children}
    </MqttContext.Provider>
  );
}

export const useMqtt = () => {
  const context = useContext(MqttContext);
  if (!context) throw new Error("useMqtt must be used within an MqttProvider");
  return context;
};
