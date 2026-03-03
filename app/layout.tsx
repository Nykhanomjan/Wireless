import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MqttProvider } from "./context/MqttContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IoT Fall Detection",
  description: "Dashboard for monitoring fall detection system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MqttProvider>{children}</MqttProvider>
      </body>
    </html>
  );
}
