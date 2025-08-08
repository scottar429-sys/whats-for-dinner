"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import meals from "../data/meals.json";

export default function Home() {
  const [meal, setMeal] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Filter state
  const [protein, setProtein] = useState("");
  const [dietary, setDietary] = useState("");

  // Build filter options from data
  const { proteinOptions, dietaryOptions } = useMemo(() => {
    const p = new Set();
    const d = new Set();
    meals.forEach((m) => {
      if (m.protein) p.add(m.protein);
      if (Array.isArray(m.dietary)) m.dietary.forEach((t) => d.add(t));
    });
    return {
      proteinOptions: Array.from(p).sort(),
      dietaryOptions: Array.from(d).sort(),
    };
  }, []);

  // Apply filters
  const filteredMeals = useMemo(() => {
    return meals.filter((m) => {
      const proteinOK = protein ? m.protein === protein : true;
      const dietaryOK = dietary
        ? Array.isArray(m.dietary) && m.dietary.includes(dietary)
        : true;
      return proteinOK && dietaryOK;
    });
  }, [protein, dietary]);

  function pickRandom(fromList) {
    const list = Array.isArray(fromList) ? fromList : filteredMeals;
    if (!list.length) {
      setMeal(null);
      return;
    }
    const i = Math.floor(Math.random() * list.length);
    setMeal(list[i]);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        textAlign: "center",
        padding: "2rem",
        fontFamily: "sans-serif",
        backgroundColor: darkMode ? "#222" : "#fffaf4",
        color: darkMode ? "#fff" : "#000",
      }}
    >
      {/* Top bar with quick links + dark mode */}
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: "0.5rem",
        }}
      >
        <nav style={{ display: "flex", gap: 16 }}>
          <Link href="/about" style={{ textDecoration: "underline" }}>
            About
          </Link>
          <Link href="/contact" style={{ textDecoration: "underline" }}>
            Contact
          </Link>
          <Link href="/privacy-policy" style={{ textDecoration: "underline" }}>
            Privacy Policy
          </Link>
        </nav>

        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            background: "none",
            border: "1px solid",
            borderColor: darkMode ? "#fff" : "#000",
            color: darkMode ? "#fff" : "#000",
            padding: "6px 12px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Logo */}
      <div style={{ marginBottom: "1rem" }}>
        <Image
          src="/logo.png"
          alt="What&apos;s For Dinner Logo"
          width={200}
          height={200}
          priority
        />
      </div>

      {/* Title & tagline */}
      <h1 style={{ marginBottom: "0.25rem" }}>What&apos;s For Dinner?</h1>
      <p style={{ color: darkMode ? "#ddd" : "#555", marginBottom: "1rem", maxWidth: 720 }}>
        Your dinner inspiration generator. Choose optional filters and click the
        button to get a quick, simple idea for tonight.
      </p>

      {/* Generate button directly under title */}
      <button
        onClick={() => pickRandom()}
        style={{
          background: "#ff7a00",
          color: "white",
          border: "none",
          padding: "12px 18px",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        🎲 Generate Meal
      </button>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        <select
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #ccc",
            minWidth: 180,
          }}
        >
          <option value="">All Proteins</option>
          {proteinOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={dietary}
          onChange={(e) => setDietary(e.target.value)}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #ccc",
            minWidth: 180,
          }}
        >
          <option value="">All Diets</option>
          {dietaryOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setProtein("");
            setDietary("");
            setMeal(null); // keep page blank until user clicks again
          }}
          style={{
            background: "none",
            color: darkMode ? "#fff" : "#000",
            border: `1px solid ${darkMode ? "#fff" : "#000"}`,
            padding: "10px 16px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Reset
        </button>
      </div>

      {/* Meal Output - blank until first click */}
      {meal && (
        <section
          style={{
            marginTop: "0.5rem",
            width: "100%",
            maxWidth: 720,
            textAlign: "left",
            background: darkMode ? "#2b2b2b" : "#fff",
            color: darkMode ? "#fff" : "#000",
            borderRadius: 12,
            padding: "1.25rem",
            boxShadow: darkMode ? "none" : "0 4px 16px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ marginBottom: "0.5rem", textAlign: "center" }}>
            {meal.name}
          </h2>

          <div
            style={{
              marginBottom: "0.75rem",
              fontSize: "0.95rem",
              textAlign: "center",
            }}
          >
            {meal.protein && <strong>Protein:</strong>} {meal.protein || "—"}
            {Array.isArray(meal.dietary) && meal.dietary.length > 0 && (
              <>
                {"  •  "}
                <strong>Dietary:</strong> {meal.dietary.join(", ")}
              </>
            )}
          </div>

          {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
            <>
              <h3>Ingredients</h3>
              <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                {meal.ingredients.map((it, idx) => (
                  <li key={idx}>{it}</li>
                ))}
              </ul>
            </>
          )}

          {meal.instructions && (
            <>
              <h3 style={{ marginTop: "1rem" }}>Instructions</h3>
              <p style={{ marginTop: 6, whiteSpace: "pre-line" }}>
                {meal.instructions}
              </p>
            </>
          )}
        </section>
      )}

      {/* Footer links + Disclaimer */}
      <footer
        style={{
          marginTop: "2rem",
          maxWidth: 720,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "0.5rem", display: "flex", gap: 16, justifyContent: "center" }}>
          <Link href="/about" style={{ textDecoration: "underline" }}>
            About
          </Link>
          <Link href="/contact" style={{ textDecoration: "underline" }}>
            Contact
          </Link>
          <Link href="/privacy-policy" style={{ textDecoration: "underline" }}>
            Privacy Policy
          </Link>
        </div>

        <div
          style={{
            fontSize: "0.8rem",
            opacity: 0.7,
            lineHeight: 1.4,
          }}
        >
          This website provides meal ideas for inspiration purposes only. Ingredients,
          preparation methods, and cooking times may be adjusted to suit your tastes and
          dietary needs. Always ensure meats, seafood, and other perishable foods are
          cooked to safe internal temperatures. The owner of this site is not responsible
          for any illness, injury, or other issues that may arise from the preparation or
          consumption of meals based on these ideas.
        </div>
      </footer>
    </main>
  );
}
