"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { sendEmail, emailTemplate } from "@/lib/email";
import {
  fetchBvdSettings,
  requireBvdManager,
} from "@/lib/bvd-permissions";
import { parseNotificationEmails } from "@/lib/bvd-format";
import { fetchBvdRegistrations } from "@/lib/bvd-server";
import type { BvdPaymentStatus, BvdRegistration, BvdAttendanceStatus } from "@/lib/supabase";
import * as XLSX from "xlsx";

export type BvdRegisterInput = {
  name: string;
  business_name: string;
  business_category: string;
  invited_by: string;
  phone: string;
  email: string;
  wants_breakfast: boolean;
};

export async function submitBvdRegistrationAction(
  data: BvdRegisterInput
): Promise<{ success?: boolean; error?: string }> {
  const name = data.name?.trim();
  const business_name = data.business_name?.trim();
  const business_category = data.business_category?.trim();
  const invited_by = data.invited_by?.trim();
  const phone = data.phone?.trim();
  const email = data.email?.trim();

  if (!name || !business_name || !business_category || !invited_by || !phone || !email) {
    return { error: "Please fill in all required fields." };
  }

  if (!email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("bvd_registrations").insert([
    {
      name,
      business_name,
      business_category,
      invited_by,
      phone,
      email,
      wants_breakfast: Boolean(data.wants_breakfast),
      status: "payment_pending",
    },
  ]);

  if (error) {
    console.error("[submitBvdRegistrationAction]", error.message);
    return { error: "Something went wrong. Please try again or WhatsApp us." };
  }

  const settings = await fetchBvdSettings();
  const recipients = parseNotificationEmails(settings?.notification_emails);

  if (recipients.length > 0) {
    try {
      await sendEmail(
        recipients,
        `🎉 New BVD Registration – ${name} — Miracle Members`,
        emailTemplate("🎉 New BVD Registration", [
          { label: "Name", value: name },
          { label: "Business", value: business_name },
          { label: "Category", value: business_category },
          { label: "Invited by", value: invited_by },
          {
            label: "Phone",
            value: `<a href="tel:${phone}" style="color:#C8102E;">${phone}</a>`,
          },
          {
            label: "Email",
            value: `<a href="mailto:${email}" style="color:#C8102E;">${email}</a>`,
          },
          {
            label: "Breakfast",
            value: data.wants_breakfast
              ? `Yes — ₹${settings?.breakfast_amount ?? ""}`
              : "No",
          },
          { label: "Status", value: "Payment Pending" },
        ])
      );
    } catch (err) {
      console.error("[submitBvdRegistrationAction] email", err);
    }
  }

  revalidatePath("/bvd");
  revalidatePath("/bvd/registrations");
  revalidatePath("/admin/bvd");
  return { success: true };
}

export async function updateBvdRegistrationStatusAction(
  id: string,
  status: BvdPaymentStatus
): Promise<{ success?: boolean; error?: string }> {
  const gate = await requireBvdManager();
  if (!gate.allowed) return { error: gate.error };

  if (status !== "payment_pending" && status !== "paid") {
    return { error: "Invalid status." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("bvd_registrations")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/bvd/registrations");
  revalidatePath("/admin/bvd");
  return { success: true };
}

export async function updateBvdRegistrationAttendanceAction(
  id: string,
  attendance: BvdAttendanceStatus
): Promise<{ success?: boolean; error?: string }> {
  const gate = await requireBvdManager();
  if (!gate.allowed) return { error: gate.error };

  if (attendance !== "pending" && attendance !== "present" && attendance !== "absent") {
    return { error: "Invalid attendance status." };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("bvd_registrations")
    .update({ attendance })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/bvd/registrations");
  revalidatePath("/admin/bvd");
  return { success: true };
}

export async function uploadBvdPaymentScreenshotAction(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const gate = await requireBvdManager();
  if (!gate.allowed) return { error: gate.error };

  const id = String(formData.get("id") ?? "").trim();
  const file = formData.get("file") as File | null;
  if (!id) return { error: "Missing registration id." };
  if (!file || file.size === 0) return { error: "No file provided." };

  const MAX_MB = 8;
  if (file.size > MAX_MB * 1024 * 1024) {
    return { error: `File too large — max ${MAX_MB} MB.` };
  }

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"];
  if (!allowed.includes(ext)) return { error: "Only JPG, PNG, WEBP, or GIF allowed." };

  const fileName = `screenshots/${id}-${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const admin = createSupabaseAdminClient();

  const { error: uploadError } = await admin.storage
    .from("bvd-media")
    .upload(fileName, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = admin.storage.from("bvd-media").getPublicUrl(fileName);

  const { error } = await admin
    .from("bvd_registrations")
    .update({
      payment_screenshot_url: publicUrl,
      status: "paid",
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/bvd/registrations");
  revalidatePath("/admin/bvd");
  return { url: publicUrl };
}

export async function exportBvdRegistrationsAction(): Promise<{
  base64?: string;
  filename?: string;
  error?: string;
}> {
  const gate = await requireBvdManager();
  if (!gate.allowed) return { error: gate.error };

  const rows = await fetchBvdRegistrations();
  const sheetRows = rows.map((r: BvdRegistration) => ({
    Name: r.name,
    "Business Name": r.business_name,
    Category: r.business_category,
    "Invited By": r.invited_by,
    Phone: r.phone,
    Email: r.email,
    Breakfast: r.wants_breakfast ? "Yes" : "No",
    Status: r.status === "paid" ? "Paid" : "Payment Pending",
    "Payment Screenshot": r.payment_screenshot_url ?? "",
    Attendance: r.attendance === "present" ? "Present" : r.attendance === "absent" ? "Absent" : "Pending",
    Registered: new Date(r.created_at).toLocaleString("en-IN"),
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sheetRows);
  XLSX.utils.book_append_sheet(wb, ws, "BVD Registrations");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const filename = `bvd-registrations-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return {
    base64: buffer.toString("base64"),
    filename,
  };
}
