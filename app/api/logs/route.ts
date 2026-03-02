import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. รับข้อมูล (POST) - ใช้ตอนบันทึกจากหน้า Dashboard
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newLog = await prisma.eventLog.create({
      data: {
        type: body.type,
        x: body.x,
        y: body.y,
        z: body.z,
      },
    });
    return NextResponse.json(newLog);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create log" },
      { status: 500 },
    );
  }
}

// 2. ดึงข้อมูล (GET) - ใช้ตอนแสดงหน้า History
export async function GET() {
  try {
    const logs = await prisma.eventLog.findMany({
      orderBy: { timestamp: "desc" }, // เรียงจาก ล่าสุด -> เก่าสุด
      take: 100, // ดึงมาแค่ 100 รายการล่าสุด (กันหน้าเว็บอืด)
    });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 },
    );
  }
}
