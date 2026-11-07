import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Current session plus whether the signed-in user holds the admin role (checked in the database). */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) { setIsAdmin(null); return; }
    let active = true;
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }).then(({ data, error }) => {
      if (active) setIsAdmin(!error && data === true);
    });
    return () => { active = false; };
  }, [userId]);

  return { session, loading, isAdmin };
}
