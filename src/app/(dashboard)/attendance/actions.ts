"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { determineStatus, hoursBetween, todayDateOnly } from "@/lib/attendance";

function refresh() {
  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

async function todaysRow(userId: string) {
  const date = todayDateOnly();
  return { date, row: await prisma.attendance.findUnique({ where: { userId_date: { userId, date } } }) };
}

export async function checkIn() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const { date, row } = await todaysRow(session.user.id);
  if (row?.loginAt) return; // already checked in today

  const now = new Date();
  await prisma.attendance.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    update: { loginAt: now, status: determineStatus(now) },
    create: { userId: session.user.id, date, loginAt: now, status: determineStatus(now) }
  });

  refresh();
}

export async function checkOut() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const { date, row } = await todaysRow(session.user.id);
  if (!row?.loginAt || row.logoutAt) return;
  if (row.breakStartedAt) throw new Error("End your break before checking out.");

  const now = new Date();
  await prisma.attendance.update({
    where: { userId_date: { userId: session.user.id, date } },
    data: { logoutAt: now, hoursLogged: hoursBetween(row.loginAt, now, row.breakMinutes) }
  });

  refresh();
}

export async function startBreak() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const { date, row } = await todaysRow(session.user.id);
  if (!row?.loginAt || row.logoutAt) throw new Error("Check in first.");
  if (row.breakStartedAt) return; // already on a break

  await prisma.attendance.update({
    where: { userId_date: { userId: session.user.id, date } },
    data: { breakStartedAt: new Date() }
  });

  refresh();
}

export async function endBreak() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const { date, row } = await todaysRow(session.user.id);
  if (!row?.breakStartedAt) return;

  const elapsedMinutes = Math.round((Date.now() - row.breakStartedAt.getTime()) / 60_000);

  await prisma.attendance.update({
    where: { userId_date: { userId: session.user.id, date } },
    data: { breakStartedAt: null, breakMinutes: row.breakMinutes + Math.max(elapsedMinutes, 0) }
  });

  refresh();
}
