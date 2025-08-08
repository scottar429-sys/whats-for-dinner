"use client";

import { useEffect, useRef } from "react";

const KEY = "consent.choice";

export default function AdSenseLoader() {
  const loadedRef = useRef(false);

  function loadAdSense() {
    if (loadedRef.current) return;
    const choice = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (choice !== "granted") return;

    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3391816891786326";
    document.head.appendChild(s);

    loadedRef.current = true;
  }

  useEffect(() => {
    try {
      loadAdSense();
    } catch {}
    function onConsent() {
      try {
        loadAdSense();
      } catch {}
    }
    window.addEventListener("consentChanged", onConsent);
    return () => window.removeEventListener("consentChanged", onConsent);
  }, []);

  return null; // ✅ This is inside the function now
}
