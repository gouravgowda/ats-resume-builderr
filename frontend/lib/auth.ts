/**
 * Auth helpers — Firebase Auth state, ID tokens, route guard.
 * Replaces the old localStorage "ats_token" JWT flow.
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "./firebase";

/**
 * Get a fresh Firebase ID token for API requests.
 * Returns null when nobody is signed in.
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/**
 * Route guard hook: redirects to /auth/login when signed out.
 * Waits for Firebase to restore the session before deciding.
 */
export function useRequireAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/auth/login");
      } else {
        setUser(u);
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  return { user, loading };
}

/** Sign out and return to the landing page. */
export async function logout(router: { push: (href: string) => void }) {
  await signOut(auth);
  router.push("/");
}
