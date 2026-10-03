"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { determineStatus, hoursBetween, todayDateOnly } from "@/lib/attendance";

export async function checkIn() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const date = todayDateOnly();
  const now = new Date();

  const existing = await prisma.attendance.findUnique({
    where: { userId_date: { userId: session.user.id, date } }
  });
  if (existing?.loginAt) return; // already checked in today

  await prisma.attendance.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    update: { loginAt: now, status: determineStatus(now) },
    create: { userId: session.user.id, date, loginAt: now, status: determineStatus(now) }
  });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function checkOut() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const date = todayDateOnly();
  const now = new Date();

  const existing = await prisma.attendance.findUnique({
    where: { userId_date: { userId: session.user.id, date } }
  });
  if (!existing?.loginAt || existing.logoutAt) return;

  await prisma.attendance.update({
    where: { userId_date: { userId: session.user.id, date } },
    data: { logoutAt: now, hoursLogged: hoursBetween(existing.loginAt, now) }
  });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}
