
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

function response(
  data: unknown,
  status = 200
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req: Request) => {
  // Handle browser preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return response(
      { error: "Method not allowed." },
      405
    );
  }

  try {
    // 1. Verify environment configuration
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Supabase environment configuration is missing."
      );
    }

    // 2. Read the signed-in user's access token
    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return response(
        { error: "Authentication required." },
        401
      );
    }

    const token = authorization.replace("Bearer ", "");

    // 3. Verify the access token with Supabase Auth
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return response(
        { error: "Invalid or expired authentication session." },
        401
      );
    }

    // 4. Verify the caller has the admin role
    const { data: callerRole, error: roleError } =
      await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

    if (roleError) {
      console.error("Admin role verification failed:", roleError);

      return response(
        { error: "Could not verify administrator permissions." },
        500
      );
    }

    if (!callerRole) {
      return response(
        { error: "You are not authorized to manage administrators." },
        403
      );
    }

    // 5. Read the requested action
    const body = await req.json();
    const { action } = body;

    // -----------------------------------------
    // ACTION: LIST ADMINISTRATORS
    // -----------------------------------------
    if (action === "list") {
      const members = [];
      let page = 1;
      const perPage = 1000;

      // Retrieve all Auth users in pages
      while (true) {
        const {
          data: { users },
          error: usersError,
        } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage,
        });

        if (usersError) {
          throw usersError;
        }

        members.push(...users);

        if (users.length < perPage) {
          break;
        }

        page++;
      }

      // Retrieve administrator role assignments
      const { data: roles, error: rolesError } =
        await supabaseAdmin
          .from("user_roles")
          .select("user_id, role");

      if (rolesError) {
        throw rolesError;
      }

      const roleMap = new Map(
        (roles ?? []).map((item) => [
          item.user_id,
          item.role,
        ])
      );

      // Return only users with administrator roles
      const administrators = members
        .filter((member) => roleMap.has(member.id))
        .map((member) => ({
          id: member.id,
          email: member.email ?? "",
          role: roleMap.get(member.id),
          created_at: member.created_at,
          last_sign_in_at: member.last_sign_in_at,
        }));

      return response({
        members: administrators,
      });
    }

    // -----------------------------------------
    // ACTION: CREATE ADMINISTRATOR
    // -----------------------------------------
    if (action === "create") {
      const email =
        typeof body.email === "string"
          ? body.email.trim().toLowerCase()
          : "";

      const password =
        typeof body.password === "string"
          ? body.password
          : "";

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return response(
          { error: "Please provide a valid email address." },
          400
        );
      }

      if (password.length < 8) {
        return response(
          { error: "Password must contain at least 8 characters." },
          400
        );
      }

      // Create the Supabase Auth account
      const {
        data: { user: newUser },
        error: createError,
      } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError || !newUser) {
        return response(
          {
            error:
              createError?.message ??
              "Could not create administrator account.",
          },
          400
        );
      }

      // Assign the administrator role
      const { error: insertRoleError } =
        await supabaseAdmin
          .from("user_roles")
          .insert({
            user_id: newUser.id,
            role: "admin",
          });

      // Roll back the Auth account if role assignment fails
      if (insertRoleError) {
        console.error(
          "Administrator role assignment failed:",
          insertRoleError
        );

        await supabaseAdmin.auth.admin.deleteUser(
          newUser.id
        );

        return response(
          {
            error:
              "The account was created, but administrator role assignment failed. The account creation was rolled back.",
          },
          500
        );
      }

      return response(
        {
          message: "Administrator created successfully.",
          member: {
            id: newUser.id,
            email: newUser.email ?? "",
            role: "admin",
            created_at: newUser.created_at,
            last_sign_in_at: newUser.last_sign_in_at,
          },
        },
        201
      );
    }

    // -----------------------------------------
    // UNKNOWN ACTION
    // -----------------------------------------
    return response(
      { error: "Unsupported action." },
      400
    );

  } catch (error) {
    console.error("Admin team function error:", error);

    return response(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected server error occurred.",
      },
      500
    );
  }
});
