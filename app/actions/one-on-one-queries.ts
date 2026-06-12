"use server";

import {
  fetchMy121Calendar,
  fetchPublic121Profile,
  getRequestDanceCardLinks,
  getRequesterPrefill,
} from "@/lib/one-on-one-queries";

export async function fetchPublic121ProfileAction(hostMemberId: string) {
  return fetchPublic121Profile(hostMemberId);
}

export async function fetchMy121CalendarAction(memberId: string) {
  return fetchMy121Calendar(memberId);
}

export async function getRequesterPrefillAction() {
  return getRequesterPrefill();
}

export async function getRequestDanceCardLinksAction(requestId: string) {
  return getRequestDanceCardLinks(requestId);
}
