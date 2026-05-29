"use client";

import { useMemo, useState, useTransition } from "react";
import {
  addPowerTeamMemberAction,
  removePowerTeamMemberAction,
  setPowerTeamCaptainAction,
  updatePowerTeamMemberNotesAction,
} from "@/app/admin/actions/power-teams";
import type { Member, PowerTeamMemberWithMember } from "@/lib/supabase";

type Props = {
  teamId: string;
  captainMemberId: string | null;
  teamMembers: PowerTeamMemberWithMember[];
  allMembers: Pick<Member, "id" | "name" | "category" | "slug">[];
  assignedElsewhere: { member_id: string; team_name: string }[];
};

export default function PowerTeamMembersEditor({
  teamId,
  captainMemberId,
  teamMembers,
  allMembers,
  assignedElsewhere,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [roleNotes, setRoleNotes] = useState("");

  const elsewhereMap = useMemo(
    () => new Map(assignedElsewhere.map((r) => [r.member_id, r.team_name])),
    [assignedElsewhere]
  );

  const availableMembers = useMemo(() => {
    const onTeam = new Set(teamMembers.map((r) => r.member_id));
    return allMembers
      .filter((m) => !onTeam.has(m.id) && !elsewhereMap.has(m.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allMembers, teamMembers, elsewhereMap]);

  const handleAdd = () => {
    if (!selectedMemberId) {
      setError("Select a member to add.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await addPowerTeamMemberAction(teamId, selectedMemberId, roleNotes);
      if (result.error) {
        setError(result.error);
      } else {
        setSelectedMemberId("");
        setRoleNotes("");
      }
    });
  };

  const handleRemove = (rowId: string) => {
    if (!confirm("Remove this member from the team?")) return;
    startTransition(() => removePowerTeamMemberAction(teamId, rowId));
  };

  const handleSetCaptain = (memberId: string) => {
    setError("");
    startTransition(async () => {
      const result = await setPowerTeamCaptainAction(teamId, memberId);
      if (result.error) setError(result.error);
    });
  };

  const handleClearCaptain = () => {
    setError("");
    startTransition(async () => {
      const result = await setPowerTeamCaptainAction(teamId, null);
      if (result.error) setError(result.error);
    });
  };

  const handleNotesBlur = (rowId: string, notes: string) => {
    startTransition(() => {
      void updatePowerTeamMemberNotesAction(teamId, rowId, notes);
    });
  };

  return (
    <div className="card p-6">
      <h2 className="text-base font-bold mb-1" style={{ color: "var(--color-dark)" }}>
        Team Members
      </h2>
      <p className="text-sm mb-5" style={{ color: "var(--color-gray)" }}>
        Each member can belong to only one Power Team at a time. Mark one member as Team Captain.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ background: "#FEE2E2", color: "#991B1B" }}>
          {error}
        </div>
      )}

      {/* Add member */}
      <div
        className="p-4 rounded-xl mb-6 flex flex-col gap-3"
        style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-gray)" }}>
          Add member
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200 bg-white"
            disabled={pending || availableMembers.length === 0}
          >
            <option value="">
              {availableMembers.length === 0 ? "No available members" : "Select a member…"}
            </option>
            {availableMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.category}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={roleNotes}
            onChange={(e) => setRoleNotes(e.target.value)}
            placeholder="Role / referral notes (optional)"
            className="w-full px-3 py-2.5 rounded-lg text-sm border border-gray-200"
            disabled={pending}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={pending || !selectedMemberId}
          className="btn-primary text-sm self-start"
          style={{ opacity: pending || !selectedMemberId ? 0.6 : 1 }}
        >
          {pending ? "Adding…" : "+ Add to Team"}
        </button>
      </div>

      {/* Current roster */}
      {teamMembers.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-gray)" }}>
          No members on this team yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {teamMembers.map((row) => {
            const m = row.members;
            if (!m) return null;
            const isCaptain = captainMemberId === m.id;
            return (
              <div
                key={row.id}
                className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl"
                style={{
                  border: isCaptain ? "2px solid var(--color-accent)" : "1px solid #E5E7EB",
                  background: isCaptain ? "#FFFBEB" : "white",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm" style={{ color: "var(--color-dark)" }}>
                      {m.name}
                    </p>
                    {isCaptain && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "var(--color-accent)", color: "var(--color-dark)" }}
                      >
                        ⭐ Team Captain
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "var(--color-gray)" }}>
                    {m.category} · /members/{m.slug}
                  </p>
                  <input
                    type="text"
                    defaultValue={row.role_notes ?? ""}
                    onBlur={(e) => handleNotesBlur(row.id, e.target.value)}
                    placeholder="Role / referral notes"
                    className="mt-2 w-full px-3 py-2 rounded-lg text-sm border border-gray-200"
                    disabled={pending}
                  />
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {!isCaptain ? (
                    <button
                      type="button"
                      onClick={() => handleSetCaptain(m.id)}
                      disabled={pending}
                      className="text-sm font-semibold px-3 py-2 rounded-lg"
                      style={{ color: "var(--color-dark)", background: "#FEF3C7", border: "1px solid #FCD34D" }}
                    >
                      Make Captain
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleClearCaptain}
                      disabled={pending}
                      className="text-sm font-semibold px-3 py-2 rounded-lg"
                      style={{ color: "var(--color-gray)", background: "#F3F4F6" }}
                    >
                      Remove Captain
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(row.id)}
                    disabled={pending}
                    className="text-sm font-semibold px-3 py-2 rounded-lg"
                    style={{ color: "#991B1B", background: "#FEE2E2" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {assignedElsewhere.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-gray)" }}>
            Members on other teams (not available)
          </p>
          <ul className="text-xs space-y-1" style={{ color: "var(--color-gray)" }}>
            {assignedElsewhere.slice(0, 12).map((r) => (
              <li key={r.member_id}>
                {allMembers.find((m) => m.id === r.member_id)?.name ?? "Member"} → {r.team_name}
              </li>
            ))}
            {assignedElsewhere.length > 12 && (
              <li>…and {assignedElsewhere.length - 12} more</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
