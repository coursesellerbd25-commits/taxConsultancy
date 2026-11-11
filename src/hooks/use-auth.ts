
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;

      setSession(newSession);
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        setSession(null);
      } else {
        setSession(data.session);
      }

      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id;

  useEffect(() => {
    let active = true;

    if (!userId) {
      setIsAdmin(null);
      setRoleLoading(false);
      return;
    }

    setIsAdmin(null);
    setRoleLoading(true);

    supabase
      .rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      })
      .then(({ data, error }) => {
        if (!active) return;

        setIsAdmin(!error && data === true);
        setRoleLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  return {
    session,
    loading: authLoading || roleLoading,
    isAdmin,
  };
}
