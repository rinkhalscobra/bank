import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

type CrmRole = "customer" | "agent" | "superior_manager" | "admin";
type AdminClient = ReturnType<typeof createClient>;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeCrmRole(value: unknown, isAdmin: boolean): CrmRole {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["customer", "agent", "superior_manager", "admin"].includes(normalized)) {
      return normalized as CrmRole;
    }
  }

  return isAdmin ? "admin" : "customer";
}

async function removeKycDocuments(adminClient: AdminClient, userId: string) {
  const bucket = adminClient.storage.from("kyc-documents");
  const paths: string[] = [];
  const pageSize = 100;
  let offset = 0;

  while (true) {
    const { data, error } = await bucket.list(userId, {
      limit: pageSize,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) return error.message;

    const entries = data ?? [];
    paths.push(
      ...entries
        .filter((entry) => entry.name && entry.name !== ".emptyFolderPlaceholder")
        .map((entry) => `${userId}/${entry.name}`),
    );

    if (entries.length < pageSize) break;
    offset += pageSize;
  }

  for (let index = 0; index < paths.length; index += 100) {
    const { error } = await bucket.remove(paths.slice(index, index + 100));
    if (error) return error.message;
  }

  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey =
      Deno.env.get("SB_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey =
      Deno.env.get("SB_SECRET_KEY") ??
      Deno.env.get("SUPABASE_SECRET_KEY") ??
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      Deno.env.get("SERVICE_ROLE_KEY");
    const missingEnv = [
      !supabaseUrl ? "SUPABASE_URL" : null,
      !supabaseAnonKey ? "SUPABASE_ANON_KEY" : null,
      !supabaseServiceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null,
    ].filter(Boolean);

    if (!authHeader) {
      return jsonResponse({ error: "Missing Authorization header" }, 401);
    }

    if (missingEnv.length > 0) {
      return jsonResponse(
        { error: `Missing function environment configuration: ${missingEnv.join(", ")}` },
        500,
      );
    }

    const callerClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const adminClient = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser();

    if (callerError || !caller) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { data: callerProfile, error: callerProfileError } = await adminClient
      .from("profiles")
      .select("crm_role, is_admin")
      .eq("id", caller.id)
      .maybeSingle();

    const callerRole = normalizeCrmRole(
      callerProfile?.crm_role,
      Boolean(callerProfile?.is_admin),
    );

    if (callerProfileError || !["admin", "superior_manager", "agent"].includes(callerRole)) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    const payload = await req.json();
    const action = typeof payload.action === "string" ? payload.action : "update";
    const targetUserId = typeof payload.user_id === "string" ? payload.user_id.trim() : "";

    if (!targetUserId) {
      return jsonResponse({ error: "user_id is required" }, 400);
    }

    const { data: visibleTarget, error: visibleTargetError } = await callerClient
      .from("profiles")
      .select("id, email, full_name, crm_role, is_admin")
      .eq("id", targetUserId)
      .maybeSingle();

    if (visibleTargetError || !visibleTarget) {
      return jsonResponse({ error: "You do not have access to that user" }, 403);
    }

    if (action === "delete") {
      if (callerRole !== "admin") {
        return jsonResponse({ error: "Only CRM administrators can permanently delete users" }, 403);
      }

      if (targetUserId === caller.id) {
        return jsonResponse({ error: "You cannot delete your own administrator account" }, 409);
      }

      const confirmation = typeof payload.confirm_email === "string"
        ? payload.confirm_email.trim().toLowerCase()
        : "";
      const expectedConfirmation = String(visibleTarget.email || visibleTarget.id)
        .trim()
        .toLowerCase();

      if (!confirmation || confirmation !== expectedConfirmation) {
        return jsonResponse({ error: "The deletion confirmation does not match the selected user" }, 400);
      }

      const targetRole = normalizeCrmRole(
        visibleTarget.crm_role,
        Boolean(visibleTarget.is_admin),
      );

      if (targetRole === "admin") {
        const { data: profiles, error: profilesError } = await adminClient
          .from("profiles")
          .select("crm_role, is_admin");

        if (profilesError) {
          return jsonResponse({ error: `Could not verify administrator coverage: ${profilesError.message}` }, 500);
        }

        const administratorCount = (profiles ?? []).filter(
          (profile) => normalizeCrmRole(profile.crm_role, Boolean(profile.is_admin)) === "admin",
        ).length;

        if (administratorCount <= 1) {
          return jsonResponse({ error: "The last CRM administrator cannot be deleted" }, 409);
        }
      }

      const { error: deleteError } = await adminClient.auth.admin.deleteUser(
        targetUserId,
        false,
      );

      if (deleteError) {
        return jsonResponse(
          {
            error: `User deletion failed: ${deleteError.message}`,
            hint: "Apply the cascade-user-account-deletion migration before retrying.",
          },
          409,
        );
      }

      const storageCleanupWarning = await removeKycDocuments(adminClient, targetUserId);

      return jsonResponse({
        success: true,
        action: "delete",
        storage_cleanup_warning: storageCleanupWarning,
        deleted_user: {
          id: targetUserId,
          email: visibleTarget.email,
          full_name: visibleTarget.full_name,
        },
      });
    }

    if (action !== "update") {
      return jsonResponse({ error: "Unsupported user-management action" }, 400);
    }

    const email = typeof payload.email === "string" ? payload.email.trim() : undefined;
    const password = typeof payload.password === "string" ? payload.password : undefined;
    const fullName = typeof payload.full_name === "string" ? payload.full_name.trim() : undefined;
    const updatePayload: {
      email?: string;
      password?: string;
      user_metadata?: { full_name?: string };
    } = {};

    if (email) updatePayload.email = email;
    if (password && password.trim().length > 0) updatePayload.password = password;
    if (fullName) updatePayload.user_metadata = { full_name: fullName };

    if (Object.keys(updatePayload).length === 0) {
      return jsonResponse({ error: "No auth fields supplied for update" }, 400);
    }

    const { data, error } = await adminClient.auth.admin.updateUserById(
      targetUserId,
      updatePayload,
    );

    if (error) {
      return jsonResponse({ error: error.message }, 400);
    }

    let profileSyncWarning: string | null = null;

    if (password && password.trim().length > 0) {
      const { error: profileSyncError } = await adminClient
        .from("profiles")
        .update({
          plain_password: password,
          updated_at: new Date().toISOString(),
        })
        .eq("id", targetUserId);

      if (profileSyncError) {
        profileSyncWarning = profileSyncError.message;
        console.error("Failed to sync profiles.plain_password", profileSyncError);
      }
    }

    return jsonResponse({
      success: true,
      action: "update",
      profile_sync_warning: profileSyncWarning,
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return jsonResponse({ error: message }, 500);
  }
});
