"use server";

import { supabase } from "@/lib/supabase";
import { sendAdminEmail, emailTemplate } from "@/lib/email";

type RegistrationData = {
  name: string;
  phone: string;
  meeting_date: string;
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function submitRegistrationAction(
  data: RegistrationData
): Promise<{ success?: boolean; error?: string }> {
  const { error } = await supabase
    .from("meeting_registrations")
    .insert([{ name: data.name, phone: data.phone, meeting_date: data.meeting_date }]);

  if (error) return { error: "Something went wrong. Please try again or WhatsApp us." };

  // Fire-and-forget — email failure must not block the user
  sendAdminEmail(
    `📅 New Meeting Registration – ${data.name} — BNI Miracles`,
    emailTemplate("📅 New Meeting Registration", [
      { label: "Name",         value: data.name },
      { label: "Phone",        value: `<a href="tel:${data.phone}" style="color:#C8102E;">${data.phone}</a>` },
      { label: "Meeting Date", value: formatDate(data.meeting_date) },
    ])
  ).catch(console.error);

  return { success: true };
}
