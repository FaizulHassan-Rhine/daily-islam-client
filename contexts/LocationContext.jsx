"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

const DEFAULT = {
  latitude: 23.8103,
  longitude: 90.4125,
  city: "Dhaka",
  country: "Bangladesh",
  timezone: "Asia/Dhaka",
  source: "manual",
};

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const { user, isSignedIn, refreshUser } = useAuth();
  const [location, setLocation] = useState(DEFAULT);
  const [permission, setPermission] = useState("prompt");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (user?.location?.latitude) {
      setLocation(user.location);
      setReady(true);
      return;
    }
    try {
      const stored = JSON.parse(localStorage.getItem("di.location") || "null");
      if (stored?.latitude) setLocation(stored);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [user]);

  useEffect(() => {
    if (location?.latitude) localStorage.setItem("di.location", JSON.stringify(location));
  }, [location]);

  const persist = async (next) => {
    setLocation(next);
    if (isSignedIn) {
      const { data } = await api.patch("/users/me/location", next);
      await refreshUser?.();
      return data.data.user.location;
    }
    return next;
  };

  const requestBrowserLocation = async () => {
    if (!navigator.geolocation) {
      setPermission("denied");
      throw new Error("Geolocation is not supported.");
    }
    const coords = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err),
        { enableHighAccuracy: false, timeout: 8000 }
      );
    });
    setPermission("granted");
    const next = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      source: "geo",
    };
    const { data } = await api.get("/prayers/today", {
      params: { latitude: next.latitude, longitude: next.longitude },
    });
    const resolved = {
      ...next,
      timezone: data.data.timezone,
      city: location.city,
      country: location.country,
    };
    try {
      if (isSignedIn) return persist(resolved);
    } catch {
      /* guest */
    }
    setLocation(resolved);
    return resolved;
  };

  const value = useMemo(
    () => ({ location, setLocation, persist, requestBrowserLocation, permission, ready }),
    [location, permission, ready, isSignedIn]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationStore() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocationStore must be used within LocationProvider");
  return ctx;
}
