"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ImageUploadWidget from "@/components/admin/ImageUploadWidget";
import MemberAssignPicker from "@/components/admin/MemberAssignPicker";
import {
  assignLeadershipMemberAction,
  assignLeadershipNonMemberAction,
  deleteLeadershipRoleAction,
  saveLeadershipRoleAction,
  updateLeadershipRoleAction,
} from "@/app/admin/actions/leadership";
import { getAssignmentMemberId, getNonMemberAssignment } from "@/lib/leadership-data";
import type { LeadershipRoleWithAssignments, Member } from "@/lib/supabase";

const inputStyle = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  borderRadius: 8,
  border: "1.5px solid #E5E7EB",
  fontSize: 13,
  outline: "none",
  background: "#fff",
} as const;

type Props = {
  groupId: string;
  groupColor: string;
  nonMembers: boolean;
  roles: LeadershipRoleWithAssignments[];
  allMembers: Pick<Member, "id" | "name" | "category" | "profile_picture_url">[];
};

type NonMemberState = { name: string; profile_picture_url: string | null };

function buildMemberAssignmentMap(roles: LeadershipRoleWithAssignments[]) {
  return Object.fromEntries(
    roles.map((r) => [r.id, getAssignmentMemberId(r.leadership_assignments)] as const)
  );
}

function buildNonMemberAssignmentMap(roles: LeadershipRoleWithAssignments[]) {
  return Object.fromEntries(
    roles.map((r) => {
      const assignee = getNonMemberAssignment(r.leadership_assignments);
      return [
        r.id,
        assignee
          ? { name: assignee.name, profile_picture_url: assignee.profile_picture_url }
          : { name: "", profile_picture_url: null },
      ] as const;
    })
  );
}

function RoleEditor({
  roleId,
  groupId,
  initialName,
  initialDescription,
  initialOrder,
  disabled,
  onError,
  onSaved,
}: {
  roleId: string;
  groupId: string;
  initialName: string;
  initialDescription: string | null;
  initialOrder: number;
  disabled: boolean;
  onError: (msg: string) => void;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [order, setOrder] = useState(initialOrder);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription ?? "");
    setOrder(initialOrder);
  }, [initialName, initialDescription, initialOrder]);

  const dirty =
    name.trim() !== initialName ||
    (description.trim() || null) !== (initialDescription?.trim() || null) ||
    order !== initialOrder;

  const handleSave = () => {
    if (!name.trim()) {
      onError("Role name cannot be empty.");
      return;
    }
    onError("");
    startTransition(async () => {
      const result = await updateLeadershipRoleAction(roleId, groupId, {
        name: name.trim(),
        description: description.trim() || null,
        sort_order: order,
      });
      if (result.error) {
        onError(result.error);
      } else {
        setSaved(true);
        onSaved();
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 mb-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <div className="flex-1 min-w-0">
          <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--color-gray)" }}>
            Role name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            disabled={disabled || pending}
            style={inputStyle}
          />
        </div>
        <div className="w-20 shrink-0">
          <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--color-gray)" }}>
            Order
          </label>
          <input
            type="number"
            value={order}
            onChange={(e) => {
              setOrder(parseInt(e.target.value, 10) || 0);
              setSaved(false);
            }}
            disabled={disabled || pending}
            style={inputStyle}
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={disabled || pending || !dirty}
          className="text-xs font-semibold px-3 py-2.5 rounded-lg shrink-0"
          style={{
            background: dirty ? "var(--color-primary)" : "#E5E7EB",
            color: dirty ? "#fff" : "var(--color-gray)",
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? "…" : saved ? "Saved ✓" : "Save role"}
        </button>
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--color-gray)" }}>
          One-line description (optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setSaved(false);
          }}
          disabled={disabled || pending}
          placeholder="Briefly explain what this role does"
          style={inputStyle}
        />
      </div>
    </div>
  );
}

function NonMemberAssignEditor({
  roleId,
  groupId,
  initialName,
  initialPhotoUrl,
  disabled,
  isSaving,
  onError,
  onSuccess,
}: {
  roleId: string;
  groupId: string;
  initialName: string;
  initialPhotoUrl: string | null;
  disabled: boolean;
  isSaving: boolean;
  onError: (msg: string) => void;
  onSuccess: (message: string) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(initialName);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(initialName);
    setPhotoUrl(initialPhotoUrl);
  }, [initialName, initialPhotoUrl]);

  const dirty =
    name.trim() !== initialName.trim() || (photoUrl || null) !== (initialPhotoUrl || null);

  const handleSave = () => {
    if (!name.trim()) {
      onError("Name is required.");
      return;
    }
    onError("");
    startTransition(async () => {
      const result = await assignLeadershipNonMemberAction(roleId, groupId, {
        assignee_name: name.trim(),
        assignee_profile_picture_url: photoUrl,
      });
      if (result.error) {
        onError(result.error);
        return;
      }
      setSaved(true);
      onSuccess(`Saved ${name.trim()}.`);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const handleClear = () => {
    onError("");
    startTransition(async () => {
      const result = await assignLeadershipNonMemberAction(roleId, groupId, {
        assignee_name: "",
        assignee_profile_picture_url: null,
      });
      if (result.error) {
        onError(result.error);
        return;
      }
      setName("");
      setPhotoUrl(null);
      onSuccess("Assignee cleared.");
      router.refresh();
    });
  };

  const busy = disabled || pending || isSaving;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--color-gray)" }}>
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          disabled={busy}
          placeholder="Full name"
          style={inputStyle}
        />
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wide block mb-2" style={{ color: "var(--color-gray)" }}>
          Profile photo
        </label>
        <ImageUploadWidget
          currentUrl={photoUrl}
          memberName={name || "Assignee"}
          onUpload={(url) => {
            setPhotoUrl(url);
            setSaved(false);
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={busy || !dirty}
          className="text-xs font-semibold px-3 py-2 rounded-lg"
          style={{
            background: dirty ? "var(--color-primary)" : "#E5E7EB",
            color: dirty ? "#fff" : "var(--color-gray)",
            opacity: busy ? 0.7 : 1,
          }}
        >
          {pending ? "Saving…" : saved ? "Saved ✓" : "Save assignee"}
        </button>
        {(initialName || initialPhotoUrl) && (
          <button
            type="button"
            onClick={handleClear}
            disabled={busy}
            className="text-xs font-semibold px-3 py-2 rounded-lg"
            style={{ color: "#991B1B", background: "#FEE2E2" }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default function LeadershipRolesEditor({
  groupId,
  groupColor,
  nonMembers,
  roles,
  allMembers,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRoleOrder, setNewRoleOrder] = useState(roles.length);
  const [memberAssignments, setMemberAssignments] = useState<Record<string, string | null>>(() =>
    buildMemberAssignmentMap(roles)
  );
  const [nonMemberAssignments, setNonMemberAssignments] = useState<Record<string, NonMemberState>>(() =>
    buildNonMemberAssignmentMap(roles)
  );
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  const rolesKey = roles
    .map((r) => {
      const nonMember = getNonMemberAssignment(r.leadership_assignments);
      return `${r.id}:${r.name}:${r.description ?? ""}:${getAssignmentMemberId(r.leadership_assignments) ?? ""}:${nonMember?.name ?? ""}:${nonMember?.profile_picture_url ?? ""}`;
    })
    .join("|");

  useEffect(() => {
    setMemberAssignments(buildMemberAssignmentMap(roles));
    setNonMemberAssignments(buildNonMemberAssignmentMap(roles));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by rolesKey
  }, [rolesKey]);

  const memberOptions = useMemo(
    () =>
      allMembers.map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        profile_picture_url: m.profile_picture_url,
      })),
    [allMembers]
  );

  const handleAssign = (roleId: string, memberId: string | null) => {
    const previous = memberAssignments[roleId] ?? null;
    setMemberAssignments((prev) => ({ ...prev, [roleId]: memberId }));
    setError("");
    setSuccess("");
    setSavingRoleId(roleId);

    startTransition(async () => {
      const result = await assignLeadershipMemberAction(roleId, groupId, memberId);
      setSavingRoleId(null);

      if (!result.success) {
        setMemberAssignments((prev) => ({ ...prev, [roleId]: previous }));
        setError(result.error ?? "Could not save assignment. Please try again.");
        return;
      }

      const member = memberId ? allMembers.find((m) => m.id === memberId) : null;
      setSuccess(member ? `Assigned ${member.name} successfully.` : "Assignment cleared.");
      router.refresh();
    });
  };

  const handleDeleteRole = (roleId: string, roleName: string) => {
    if (!confirm(`Delete role "${roleName}"?`)) return;
    startTransition(() => deleteLeadershipRoleAction(roleId, groupId));
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      setError("Enter a role name.");
      return;
    }
    setError("");
    const fd = new FormData();
    fd.set("group_id", groupId);
    fd.set("name", newRoleName.trim());
    fd.set("description", newRoleDescription.trim());
    fd.set("sort_order", String(newRoleOrder));
    startTransition(async () => {
      try {
        await saveLeadershipRoleAction(null, fd);
      } catch {
        // redirect from server action
      }
    });
  };

  return (
    <div className="card p-6">
      <h2 className="text-base font-bold mb-1" style={{ color: "var(--color-dark)" }}>
        Roles &amp; Assignments
      </h2>
      <p className="text-sm mb-5" style={{ color: "var(--color-gray)" }}>
        {nonMembers
          ? "Edit each role, then enter the assignee name and upload a profile photo."
          : "Edit each role name, then search and assign a member. Changes save immediately when you pick a member."}
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ background: "#FEE2E2", color: "#991B1B" }}>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium" style={{ background: "#DCFCE7", color: "#166534" }}>
          {success}
        </div>
      )}

      <div className="flex flex-col gap-4 mb-6">
        {roles.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: "var(--color-gray)" }}>
            No roles yet. Add one below.
          </p>
        ) : (
          roles.map((role) => {
            const memberId = memberAssignments[role.id] ?? null;
            const nonMember = nonMemberAssignments[role.id] ?? { name: "", profile_picture_url: null };
            const isSaving = savingRoleId === role.id && pending;

            return (
              <div
                key={role.id}
                className="p-4 rounded-xl"
                style={{
                  background: "#F9FAFB",
                  border: isSaving ? `2px solid ${groupColor}` : `1px solid ${groupColor}33`,
                  borderLeft: `4px solid ${groupColor}`,
                }}
              >
                <RoleEditor
                  roleId={role.id}
                  groupId={groupId}
                  initialName={role.name}
                  initialDescription={role.description}
                  initialOrder={role.sort_order}
                  disabled={pending}
                  onError={setError}
                  onSaved={() => router.refresh()}
                />

                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {nonMembers ? (
                      <NonMemberAssignEditor
                        roleId={role.id}
                        groupId={groupId}
                        initialName={nonMember.name}
                        initialPhotoUrl={nonMember.profile_picture_url}
                        disabled={pending}
                        isSaving={isSaving}
                        onError={setError}
                        onSuccess={setSuccess}
                      />
                    ) : (
                      <>
                        <label className="text-[10px] font-bold uppercase tracking-wide block mb-2" style={{ color: "var(--color-gray)" }}>
                          Assigned member {isSaving ? "(saving…)" : ""}
                        </label>
                        <MemberAssignPicker
                          members={memberOptions}
                          value={memberId}
                          onChange={(id) => handleAssign(role.id, id)}
                          disabled={pending}
                        />
                      </>
                    )}
                  </div>
                  <div className={nonMembers ? "shrink-0" : "lg:pt-6 shrink-0"}>
                    <button
                      type="button"
                      onClick={() => handleDeleteRole(role.id, role.name)}
                      disabled={pending}
                      className="text-xs font-semibold px-3 py-2 rounded-lg w-full lg:w-auto"
                      style={{ color: "#991B1B", background: "#FEE2E2" }}
                    >
                      Delete role
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleAddRole}
        className="p-4 rounded-xl"
        style={{ background: `${groupColor}14`, border: `1px solid ${groupColor}44` }}
      >
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: groupColor }}>
          Add new role
        </p>
        <div className="grid sm:grid-cols-[1fr_100px_auto] gap-3 items-end mb-3">
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--color-dark)" }}>
              Role name
            </label>
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g. Training Coordinator"
              style={inputStyle}
              disabled={pending}
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "var(--color-dark)" }}>
              Order
            </label>
            <input
              type="number"
              value={newRoleOrder}
              onChange={(e) => setNewRoleOrder(parseInt(e.target.value, 10) || 0)}
              style={inputStyle}
              disabled={pending}
            />
          </div>
          <button type="submit" disabled={pending} className="btn-primary text-sm whitespace-nowrap">
            {pending ? "…" : "+ Add Role"}
          </button>
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: "var(--color-dark)" }}>
            One-line description (optional)
          </label>
          <input
            type="text"
            value={newRoleDescription}
            onChange={(e) => setNewRoleDescription(e.target.value)}
            placeholder="Briefly explain what this role does"
            style={inputStyle}
            disabled={pending}
          />
        </div>
      </form>
    </div>
  );
}
