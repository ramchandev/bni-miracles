"use server";

import { getMemberSession } from "@/lib/member-session";
import { fetchPlan121Availability } from "@/lib/plan-121s";

export async function fetchPlan121AvailabilityAction() {
  const session = await getMemberSession();
  return fetchPlan121Availability(session?.id ?? null);
}
