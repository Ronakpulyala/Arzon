"use server";

import { revalidatePath } from "next/cache";
import { auth, canReview, isAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PAYMENT_METHOD_LABELS, SALES_STATUS_LABELS } from "@/lib/sales";
import type { ActionState } from "@/lib/use-form-action";
import type { PaymentMethod, SalesStatus } from "@prisma/client";

function refresh() {
  revalidatePath("/sales-reports");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
}

export async function addSalesReport(formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };

  const clientName = (formData.get("clientName") as string)?.trim();
  const courseOrPlan = (formData.get("courseOrPlan") as string)?.trim();
  const dealValue = Number(formData.get("dealValue"));
  const status = formData.get("status") as SalesStatus;
  const reportDate = formData.get("reportDate") as string;
  const remarks = (formData.get("remarks") as string)?.trim() || null;

  if (!clientName || !courseOrPlan || !reportDate || !status) {
    return { error: "Please fill in every required field." };
  }
  if (!(status in SALES_STATUS_LABELS)) return { error: "Choose a valid stage." };
  if (!Number.isFinite(dealValue) || dealValue <= 0) {
    return { error: "Deal value must be a positive number." };
  }
  const date = new Date(reportDate);
  if (Number.isNaN(date.getTime())) return { error: "Enter a valid date." };

  await prisma.salesReport.create({
    data: { userId: session.user.id, clientName, courseOrPlan, dealValue, status, reportDate: date, remarks }
  });

  refresh();
  return { success: true };
}

/**
 * Employees log a payment and it lands as PENDING until an Admin approves it.
 * If an Admin logs the payment themselves, it's auto-approved (they're the approver).
 */
export async function addPayment(formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated." };

  const salesReportId = formData.get("salesReportId") as string;
  const amount = Number(formData.get("amount"));
  const method = formData.get("method") as PaymentMethod;
  const paidOn = formData.get("paidOn") as string;
  const reference = (formData.get("reference") as string)?.trim() || null;

  if (!salesReportId || !paidOn || !method) return { error: "Please fill in every required field." };
  if (!(method in PAYMENT_METHOD_LABELS)) return { error: "Choose a valid payment method." };
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Payment amount must be a positive number." };
  const date = new Date(paidOn);
  if (Number.isNaN(date.getTime())) return { error: "Enter a valid date." };

  const report = await prisma.salesReport.findUnique({
    where: { id: salesReportId },
    include: { payments: true }
  });
  if (!report) return { error: "That sales report no longer exists." };
  if (!canReview(session.user.role) && report.userId !== session.user.id) {
    return { error: "You can only log payments against your own deals." };
  }
  if (report.status === "CLOSED_LOST") return { error: "This deal is marked as lost." };

  // Count approved + already-pending payments so a flood of pending claims can't overshoot the deal.
  const claimed = report.payments
    .filter((p) => p.status !== "REJECTED")
    .reduce((s, p) => s + p.amount, 0);
  if (claimed + amount > report.dealValue) {
    return {
      error: `That would exceed the deal value. Remaining balance: ₹${Math.max(report.dealValue - claimed, 0).toLocaleString("en-IN")}.`
    };
  }

  const autoApprove = isAdmin(session.user.role);

  await prisma.salesPayment.create({
    data: {
      salesReportId,
      amount,
      method,
      paidOn: date,
      reference,
      status: autoApprove ? "APPROVED" : "PENDING",
      approvedBy: autoApprove ? session.user.id : null
    }
  });

  refresh();
  return { success: true };
}

export async function deletePayment(paymentId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const payment = await prisma.salesPayment.findUnique({
    where: { id: paymentId },
    include: { salesReport: true }
  });
  if (!payment) return;

  const owner = payment.salesReport.userId === session.user.id;
  if (!canReview(session.user.role) && !owner) {
    throw new Error("Not authorized to remove this payment.");
  }
  // Employees can only pull back their own payment while it's still awaiting approval.
  if (!canReview(session.user.role) && payment.status !== "PENDING") {
    throw new Error("Only an admin can remove an approved or rejected payment.");
  }

  await prisma.salesPayment.delete({ where: { id: paymentId } });
  refresh();
}

export async function approvePayment(paymentId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if (!isAdmin(session.user.role)) throw new Error("Only Admins can approve payments.");

  await prisma.salesPayment.update({
    where: { id: paymentId },
    data: { status: "APPROVED", approvedBy: session.user.id }
  });
  refresh();
}

export async function rejectPayment(paymentId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if (!isAdmin(session.user.role)) throw new Error("Only Admins can reject payments.");

  await prisma.salesPayment.update({
    where: { id: paymentId },
    data: { status: "REJECTED", approvedBy: session.user.id }
  });
  refresh();
}

export async function updateSalesStatus(salesReportId: string, status: SalesStatus) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");
  if (!(status in SALES_STATUS_LABELS)) throw new Error("Invalid status");

  const report = await prisma.salesReport.findUnique({ where: { id: salesReportId } });
  if (!report) throw new Error("Sales report not found");
  if (!canReview(session.user.role) && report.userId !== session.user.id) {
    throw new Error("Not authorized to update this deal.");
  }

  await prisma.salesReport.update({ where: { id: salesReportId }, data: { status } });
  refresh();
}
