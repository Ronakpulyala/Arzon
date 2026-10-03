"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth, isAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/use-form-action";
import type { Role } from "@prisma/client";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if (!isAdmin(session.user.role)) throw new Error("Only Admins can manage employees.");
  return session;
}

export async function createEmployee(formData: FormData): Promise<ActionState> {
  await assertAdmin();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;
  const department = (formData.get("department") as string)?.trim() || null;
  const designation = (formData.get("designation") as string)?.trim() || null;
  const baseSalary = Number(formData.get("baseSalary") || 0);
  const commissionPct = Number(formData.get("commissionPct") || 0);

  if (!name || !email || !password || !role) return { error: "Please fill in every required field." };
  if (!["ADMIN", "HR", "EMPLOYEE"].includes(role)) return { error: "Choose a valid role." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (!Number.isFinite(baseSalary) || baseSalary < 0) return { error: "Base salary must be 0 or more." };
  if (!Number.isFinite(commissionPct) || commissionPct < 0 || commissionPct > 100) {
    return { error: "Commission % must be between 0 and 100." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists." };

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      department,
      designation,
      baseSalary,
      commissionRate: commissionPct / 100
    }
  });

  revalidatePath("/employees");
  revalidatePath("/salary");
  return { success: true };
}

export async function toggleActive(userId: string) {
  const session = await assertAdmin();
  if (userId === session.user.id) throw new Error("You can't deactivate your own account.");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Employee not found.");

  await prisma.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });
  revalidatePath("/employees");
  revalidatePath("/attendance");
  revalidatePath("/salary");
}
