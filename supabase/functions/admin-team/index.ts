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
  },
);

function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return response(
      { error: "Method not allowed." },
      405,
    );
  }

  try {
    // -----------------------------------------
    // 1. VERIFY ENVIRONMENT CONFIGURATION
    // -----------------------------------------

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        "Supabase environment configuration is missing.",
      );
    }

    // -----------------------------------------
    // 2. VERIFY AUTHENTICATION
    // -----------------------------------------

    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return response(
        { error: "Authentication required." },
        401,
      );
    }

    const token = authorization.replace("Bearer ", "");

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return response(
        { error: "Invalid or expired authentication session." },
        401,
      );
    }

    // -----------------------------------------
    // 3. VERIFY CALLER'S ADMIN ROLE
    // -----------------------------------------

    const { data: callerRoles, error: roleError } =
      await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

    if (roleError) {
      console.error(
        "Admin role verification failed:",
        roleError,
      );

      return response(
        { error: "Could not verify administrator permissions." },
        500,
      );
    }

    const callerIsAdmin = (callerRoles ?? []).some(
      (item) =>
        item.role === "admin" ||
        item.role === "main_admin",
    );

    const callerIsMainAdmin = (callerRoles ?? []).some(
      (item) => item.role === "main_admin",
    );

    if (!callerIsAdmin) {
      return response(
        {
          error: "You are not authorized to manage administrators.",
        },
        403,
      );
    }

    // -----------------------------------------
    // 4. READ REQUEST
    // -----------------------------------------

    const body = await req.json();
    const { action } = body;

    // =========================================
    // ACTION: LIST ADMINISTRATORS
    // =========================================

    if (action === "list") {
      const members = [];
      let page = 1;
      const perPage = 1000;

      // Retrieve all Auth users
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
        ]),
      );

      // Return only administrator accounts
      const administrators = members
        .filter((member) => {
          const role = roleMap.get(member.id);

          return (
            role === "admin" ||
            role === "main_admin"
          );
        })
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

    // =========================================
    // ACTION: CREATE ADMINISTRATOR
    // =========================================

    if (action === "create") {
      const email =
        typeof body.email === "string"
          ? body.email.trim().toLowerCase()
          : "";

      const password =
        typeof body.password === "string"
          ? body.password
          : "";

      // Validate email
      if (
        !email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return response(
          { error: "Please provide a valid email address." },
          400,
        );
      }

      // Validate password
      if (password.length < 8) {
        return response(
          {
            error: "Password must contain at least 8 characters.",
          },
          400,
        );
      }

      // Create Supabase Auth account
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
          400,
        );
      }

      // Assign admin role
      const { error: insertRoleError } =
        await supabaseAdmin
          .from("user_roles")
          .insert({
            user_id: newUser.id,
            role: "admin",
          });

      // Rollback account if role assignment fails
      if (insertRoleError) {
        console.error(
          "Administrator role assignment failed:",
          insertRoleError,
        );

        await supabaseAdmin.auth.admin.deleteUser(
          newUser.id,
        );

        return response(
          {
            error:
              "The account was created, but administrator role assignment failed. The account creation was rolled back.",
          },
          500,
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
        201,
      );
    }

    // =========================================
    // ACTION: DELETE ADMINISTRATOR
    // =========================================

    if (action === "delete") {
      // Only Main Admin can delete administrators
      if (!callerIsMainAdmin) {
        return response(
          {
            error:
              "Only the Main Admin can delete administrator accounts.",
          },
          403,
        );
      }

      const targetUserId =
        typeof body.userId === "string"
          ? body.userId.trim()
          : "";

      if (!targetUserId) {
        return response(
          { error: "Administrator user ID is required." },
          400,
        );
      }

      // Prevent deleting yourself
      if (targetUserId === user.id) {
        return response(
          {
            error: "You cannot delete your own administrator account.",
          },
          400,
        );
      }

      // -----------------------------------------
      // Verify the target user's role
      // -----------------------------------------

      const { data: targetRoles, error: targetRoleError } =
        await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", targetUserId);

      if (targetRoleError) {
        console.error(
          "Target administrator role lookup failed:",
          targetRoleError,
        );

        return response(
          {
            error: "Could not verify the target administrator.",
          },
          500,
        );
      }

      const targetIsMainAdmin = (targetRoles ?? []).some(
        (item) => item.role === "main_admin",
      );

      const targetIsAdmin = (targetRoles ?? []).some(
        (item) => item.role === "admin",
      );

      // Never delete the Main Admin
      if (targetIsMainAdmin) {
        return response(
          {
            error: "The Main Admin account cannot be deleted.",
          },
          403,
        );
      }

      // Target must actually have an admin role
      if (!targetIsAdmin) {
        return response(
          {
            error: "The selected user is not an administrator.",
          },
          404,
        );
      }

      // -----------------------------------------
      // Delete Auth user
      // -----------------------------------------

      const { error: deleteUserError } =
        await supabaseAdmin.auth.admin.deleteUser(
          targetUserId,
        );

      if (deleteUserError) {
        console.error(
          "Administrator deletion failed:",
          deleteUserError,
        );

        return response(
          {
            error:
              deleteUserError.message ??
              "Could not delete administrator account.",
          },
          500,
        );
      }

      return response({
        message: "Administrator deleted successfully.",
        deletedUserId: targetUserId,
      });
    }

    // =========================================
    // UNKNOWN ACTION
    // =========================================

    return response(
      { error: "Unsupported action." },
      400,
    );
  } catch (error) {
    console.error(
      "Admin team function error:",
      error,
    );

    return response(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected server error occurred.",
      },
      500,
    );
  }
});