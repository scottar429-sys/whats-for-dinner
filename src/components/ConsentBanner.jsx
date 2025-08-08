"use client";

import { useEffect, useState } from "react";

const KEY = "consent.choice"; // "granted" | "denied"

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (!choice) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(KEY, "granted");
    setVisible(false);
    window.dispatchEvent(new Event("consentChanged"));
  }

  function decline() {
    localStorage.setItem(KEY, "denied");
    setVisible(false);
    window.dispatchEvent(new Event("consentChanged"));
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        padding: "12px 16px",
        display: "flex",
        gap: 12,
        alignItems: "center",
        justifyContent: "center",
        background: "#111",
        color: "#fff",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.25)",
      }}
    >
      <span style={{ maxWidth: 800, lineHeight: 1.4 }}>
        This site uses cookies (including Google AdSense) to deliver services, show ads, and analyze
        traffic. See our{" "}
        <a href="/privacy-policy" style={{ color: "#ffd27a", textDecoration: "underline" }}>
          Privacy Policy
        </a>.
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={accept}
          style={{
            background: "#22c55e",
            color: "#111",
            border: "none",
            padding: "8px 12px",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Accept
        </button>
        <button
          onClick={decline}
          style={{
            background: "transparent",
            color: "#fff",
            border: "1px solid #555",
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
          }}
          aria-label="Decline cookies"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
