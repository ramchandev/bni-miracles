"use client";

import { createContext, useContext, useState } from "react";
import type { SessionMember } from "@/lib/supabase";

type SessionCtx = {
  member: SessionMember | null;
  setMember: (m: SessionMember | null) => void;
  canManageBvd: boolean;
};

const Ctx = createContext<SessionCtx>({
  member: null,
  setMember: () => {},
  canManageBvd: false,
});

export function MemberSessionProvider({
  children,
  initialMember,
  canManageBvd = false,
}: {
  children: React.ReactNode;
  initialMember: SessionMember | null;
  canManageBvd?: boolean;
}) {
  const [member, setMember] = useState<SessionMember | null>(initialMember);
  return (
    <Ctx.Provider value={{ member, setMember, canManageBvd }}>
      {children}
    </Ctx.Provider>
  );
}

export function useMemberSession() {
  return useContext(Ctx);
}
