"use server";

import { supabase } from "@/lib/supabase";
import { sendAdminEmail, emailTemplate } from "@/lib/email";

type ContactData = {
  name: string;
  email: string;
  phone?: string;
  message: string;
};

export async function submitContactAction(
  data: ContactData
): Promise<{ success?: boolean; error?: string }> {
  const { error } = await supabase.from("contacts").insert([data]);
  if (error) return { error: "Something went wrong. Please WhatsApp us directly." };

  // Must await on Vercel — the function freezes when the response is sent
  try {
    await sendAdminEmail(
      `📬 New Contact from ${data.name} — BNI Miracles`,
      emailTemplate("📬 New Contact Form Submission", [
        { label: "Name",    value: data.name },
        { label: "Email",   value: `<a href="mailto:${data.email}" style="color:#C8102E;">${data.email}</a>` },
        { label: "Phone",   value: data.phone || "—" },
        { label: "Message", value: data.message.replace(/\n/g, "<br>") },
      ])
    );
  } catch (err) {
    console.error("[submitContactAction] Admin email failed:", err);
  }

  return { success: true };
}
