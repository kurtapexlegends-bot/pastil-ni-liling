"use client";

import { SWRConfig } from "swr";
import { useEffect, useState } from "react";

function localStorageProvider() {
  if (typeof window === "undefined") return new Map();

  // Restore the data from localStorage into a map on initialization
  const map = new Map(JSON.parse(localStorage.getItem("app-cache") || "[]"));

  // Before unloading the app, write back all the data into localStorage
  window.addEventListener("beforeunload", () => {
    try {
      const appCache = JSON.stringify(Array.from(map.entries()));
      localStorage.setItem("app-cache", appCache);
    } catch (e) {
      console.warn("Failed to persist SWR cache to localStorage", e);
    }
  });

  // Use the map for read/write performance
  return map as any;
}

export default function SWRProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid hydration mismatch by rendering bare children on the server
    return <>{children}</>;
  }

  return (
    <SWRConfig value={{ provider: localStorageProvider }}>
      {children}
    </SWRConfig>
  );
}
