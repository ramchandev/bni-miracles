import fs from "fs";
import path from "path";

// Manually parse .env.local
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    for (const line of envConfig.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val.trim();
      }
    }
  }
} catch (e) {}

import("@/lib/supabase-admin").then(async ({ createSupabaseAdminClient }) => {
  const admin = createSupabaseAdminClient();
  const { data: member, error: mError } = await admin
    .from("members")
    .select("id, name")
    .ilike("name", "%JOB PETER%")
    .single();

  if (mError || !member) {
    console.error("MEMBER ERROR:", mError?.message || "Not found");
    return;
  }

  console.log(`Found member: ${member.name} (ID: ${member.id})`);

  // Insert session
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const { data: session, error: sError } = await admin
    .from("bizrox_sessions")
    .insert({
      member_id: member.id,
      expires_at: expiresAt.toISOString()
    })
    .select("id")
    .single();

  if (sError || !session) {
    console.error("SESSION CREATE ERROR:", sError?.message || "Not found");
  } else {
    console.log(`SUCCESS! Created session ID: ${session.id}`);
    console.log(`Cookie to set in browser: bizrox_sid=${session.id}`);
  }
}).catch(console.error);
