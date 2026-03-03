import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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

export async function GET() {
  try {
    const logs = await prisma.eventLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 100,
    });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 },
    );
  }
}
