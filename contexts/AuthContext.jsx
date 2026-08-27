"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { getFirebaseAuth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { api, setAuthTokenGetter } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [appUser, setAppUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    setAuthTokenGetter(async () => {
      const auth = getFirebaseAuth();
      if (!auth?.currentUser) return null;
      return auth.currentUser.getIdToken();
    });
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return undefined;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setAppUser(null);
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.post("/auth/sync");
        setAppUser(data.data.user);
      } catch {
        setAppUser(null);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const value = useMemo(
    () => ({
      configured,
      firebaseUser,
      user: appUser,
      loading,
      isSignedIn: Boolean(appUser),
      signInGoogle: async () => {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase is not configured.");
        await signInWithPopup(auth, googleProvider);
      },
      logout: async () => {
        const auth = getFirebaseAuth();
        if (auth) await signOut(auth);
        setAppUser(null);
      },
      refreshUser: async () => {
        const { data } = await api.get("/users/me");
        setAppUser(data.data.user);
        return data.data.user;
      },
      setAppUser,
    }),
    [configured, firebaseUser, appUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
