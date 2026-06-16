import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function normalizeCrmRole(value: unknown, isAdmin: boolean) {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["customer", "agent", "superior_manager", "admin"].includes(normalized)) {
      return normalized;
    }
  }

  return isAdmin ? "admin" : "customer";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
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
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (missingEnv.length > 0) {
      return new Response(
        JSON.stringify({ error: `Missing function environment configuration: ${missingEnv.join(", ")}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser();

    if (callerError || !caller) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payload = await req.json();
    const targetUserId = typeof payload.user_id === "string" ? payload.user_id : "";
    const email = typeof payload.email === "string" ? payload.email.trim() : undefined;
    const password = typeof payload.password === "string" ? payload.password : undefined;
    const fullName = typeof payload.full_name === "string" ? payload.full_name.trim() : undefined;

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: visibleTarget, error: visibleTargetError } = await callerClient
      .from("profiles")
      .select("id")
      .eq("id", targetUserId)
      .maybeSingle();

    if (visibleTargetError || !visibleTarget) {
      return new Response(
        JSON.stringify({ error: "You do not have access to that user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const updatePayload: {
      email?: string;
      password?: string;
      user_metadata?: { full_name?: string };
    } = {};

    if (email) {
      updatePayload.email = email;
    }

    if (password && password.trim().length > 0) {
      updatePayload.password = password;
    }

    if (fullName) {
      updatePayload.user_metadata = { full_name: fullName };
    }

    if (Object.keys(updatePayload).length === 0) {
      return new Response(
        JSON.stringify({ error: "No auth fields supplied for update" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data, error } = await adminClient.auth.admin.updateUserById(
      targetUserId,
      updatePayload,
    );

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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

    return new Response(
      JSON.stringify({
        success: true,
        profile_sync_warning: profileSyncWarning,
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
