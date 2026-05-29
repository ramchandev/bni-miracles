import { redirect } from "next/navigation";

/** Legacy URL — Power Team now lives at /power-team */
export default function LegacyPowerTeamInitiativePage() {
  redirect("/power-team");
}
