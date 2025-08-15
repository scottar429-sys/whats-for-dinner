"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import mealsData from "@/data/meals.json";

// -------------------- Helpers --------------------
const toArray = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [v];
};

function normalizeMeal(m) {
  // Lowercased copies
  let protein = toArray(m.protein).map((s) => String(s).toLowerCase().trim());
  let diet = (Array.isArray(m.diet) ? m.diet : m.dietary) || [];
  diet = toArray(diet).map((s) => String(s).toLowerCase().trim());
  const methods = toArray(m.methods).map((s) => String(s).toLowerCase().trim());
  const allergens = toArray(m.allergens).map((s) => String(s).toLowerCase().trim());

  // Move vegetarian/vegan/pescatarian from protein -> diet (runtime safety)
  const proteinDietTerms = new Set(["vegetarian", "vegan", "pescatarian"]);
  const moved = [];
  protein = protein.filter((p) => {
    if (proteinDietTerms.has(p)) { moved.push(p); return false; }
    return true;
  });
  diet = [...new Set([...diet, ...moved])];

  return {
    ...m,
    name: m.name,
    protein,
    diet,
    methods,
    allergens,
    is_one_pot: Boolean(m.is_one_pot),
    pro_tips: toArray(m.pro_tips),
    variations: toArray(m.variations),
    servings: m.servings ?? m.portion_size ?? ""
  };
}

const pretty = (s) =>
  String(s).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// -------------------- UI Bits --------------------
function Pill({ text }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        border: "1px solid var(--border)",
        background: "var(--card)",
        color: "var(--foreground)",
        fontSize: "0.85rem",
        marginRight: 6,
        marginTop: 4,
      }}
    >
      {text}
    </span>
  );
}

function AdSlot({ label }) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: 90,
        border: "1px dashed var(--border)",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.7,
      }}
    >
      {label}
    </div>
  );
}

// -------------------- Page --------------------
export default function Page() {
  const meals = useMemo(() => mealsData.map(normalizeMeal), []);

  // Filters
  const [protein, setProtein] = useState("");
  const [diet, setDiet] = useState("");
  const [method, setMethod] = useState("");
  const [excludeAllergen, setExcludeAllergen] = useState("");
  const [onePotOnly, setOnePotOnly] = useState(false);
  const [timeFilter, setTimeFilter] = useState(""); // "under-20" | "20-40" | "over-40"

  // Roll result + cue
  const [current, setCurrent] = useState(null);
  const [hasRolled, setHasRolled] = useState(false);
  const [flashKey, setFlashKey] = useState(0); // retrigger animation
  const [showCue, setShowCue] = useState(false);

  const resetFilters = () => {
    setProtein("");
    setDiet("");
    setMethod("");
    setExcludeAllergen("");
    setOnePotOnly(false);
    setTimeFilter("");
    setCurrent(null);
    setHasRolled(false);
    setShowCue(false);
  };

  // Build option sets
  const proteins = useMemo(() => {
    const s = new Set();
    meals.forEach((m) => m.protein.forEach((p) => s.add(p)));
    return Array.from(s).sort();
  }, [meals]);

  const diets = useMemo(() => {
    const s = new Set();
    meals.forEach((m) => m.diet.forEach((d) => s.add(d)));
    return Array.from(s).sort();
  }, [meals]);

  const methodsRaw = useMemo(() => {
    const s = new Set();
    meals.forEach((m) => m.methods.forEach((d) => s.add(d)));
    return Array.from(s).sort();
  }, [meals]);

  // Remove "one-pot" from Cooking Method options (separate checkbox)
  const methodOptions = useMemo(
    () => methodsRaw.filter((x) => x !== "one-pot"),
    [methodsRaw]
  );

  const allergens = useMemo(() => {
    const s = new Set();
    meals.forEach((m) => m.allergens.forEach((a) => s.add(a)));
    return Array.from(s).sort();
  }, [meals]);

  // Time parsing helper (best-effort)
  const minutesOf = (str) => {
    if (!str) return 0;
    const parts = String(str).match(/(\d+)\s*(min|m|minutes?)/gi);
    if (parts) {
      const nums = parts
        .map((x) => parseInt(x.replace(/\D/g, "") || "0", 10))
        .filter(Boolean);
      if (nums.length) return nums.reduce((a, b) => a + b, 0);
    }
    return 0;
  };

  const passesTime = (m) => {
    if (!timeFilter) return true;
    const total = (minutesOf(m.prep_time) ?? 0) + (minutesOf(m.cook_time) ?? 0);
    if (timeFilter === "under-20") return total < 20;
    if (timeFilter === "20-40") return total >= 20 && total <= 40;
    if (timeFilter === "over-40") return total > 40;
    return true;
  };

  // Filtered list
  const filtered = useMemo(() => {
    return meals.filter((m) => {
      if (protein && !m.protein.includes(protein)) return false;
      if (diet && !m.diet.includes(diet)) return false;
      if (method && !m.methods.includes(method)) return false;
      if (excludeAllergen && m.allergens.includes(excludeAllergen)) return false;
      if (onePotOnly && !m.is_one_pot) return false;
      if (!passesTime(m)) return false;
      return true;
    });
  }, [meals, protein, diet, method, excludeAllergen, onePotOnly, timeFilter]);

  const roll = () => {
    const list = filtered.length ? filtered : meals;
    const pick = list[Math.floor(Math.random() * list.length)];
    setCurrent(pick);
    setHasRolled(true);
    setShowCue(true);
    setFlashKey((k) => k + 1); // retrigger flash
  };

  // Auto-hide the cue after ~6s, but re-show on next roll
  useEffect(() => {
    if (!hasRolled || !showCue) return;
    const t = setTimeout(() => setShowCue(false), 6000);
    return () => clearTimeout(t);
  }, [hasRolled, showCue, flashKey]);

  // Colors tuned to your logo
  const accent = "#c8322b";
  const border = "var(--border)";

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 12px 40px",
      }}
    >
      {/* Top ad banner */}
      <div style={{ width: "100%", maxWidth: 1000, margin: "12px 0" }}>
        <AdSlot label="Ad Banner — Top" />
      </div>

      {/* Logo centered (no tagline) */}
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "12px 0 6px",
        }}
      >
        <Image
          src="/logo.png"
          alt="What's for Dinner"
          width={360}
          height={110}
          priority
        />
      </div>

      {/* Filters */}
      <section style={{ width: "100%", maxWidth: 1000, marginTop: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 12 }}>
          <label style={{ gridColumn: "span 12", fontWeight: 600 }}>
            Filters (optional)
          </label>

          {/* Protein */}
          <select
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            style={{
              gridColumn: "span 6",
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${border}`,
            }}
          >
            <option value="">Protein: Any</option>
            {proteins.map((p) => (
              <option key={p} value={p}>
                {pretty(p)}
              </option>
            ))}
          </select>

          {/* Diet */}
          <select
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
            style={{
              gridColumn: "span 6",
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${border}`,
            }}
          >
            <option value="">Diet: Any</option>
            {diets.map((d) => (
              <option key={d} value={d}>
                {pretty(d)}
              </option>
            ))}
          </select>

          {/* Cooking Method (one-pot removed from options) */}
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{
              gridColumn: "span 6",
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${border}`,
            }}
          >
            <option value="">Cooking Method: Any</option>
            {methodOptions.map((m) => (
              <option key={m} value={m}>
                {pretty(m)}
              </option>
            ))}
          </select>

          {/* Allergens (exclude) */}
          <select
            value={excludeAllergen}
            onChange={(e) => setExcludeAllergen(e.target.value)}
            style={{
              gridColumn: "span 6",
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${border}`,
            }}
          >
            <option value="">Exclude Allergen: None</option>
            {allergens.map((a) => (
              <option key={a} value={a}>
                {pretty(a)}
              </option>
            ))}
          </select>

          {/* One-pot separate toggle */}
          <div style={{ gridColumn: "span 6", display: "flex", alignItems: "center", gap: 8 }}>
            <input
              id="onepot"
              type="checkbox"
              checked={onePotOnly}
              onChange={(e) => setOnePotOnly(e.target.checked)}
            />
            <label htmlFor="onepot">One-pot meals only</label>
          </div>

          {/* Total Time */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{
              gridColumn: "span 6",
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${border}`,
            }}
          >
            <option value="">Total Time: Any</option>
            <option value="under-20">Under 20 min</option>
            <option value="20-40">20–40 min</option>
            <option value="over-40">Over 40 min</option>
          </select>

          {/* Roll + Reset */}
          <div
            style={{
              gridColumn: "span 12",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <button
              onClick={roll}
              style={{
                padding: "0.8rem 1.2rem",
                borderRadius: 10,
                border: "none",
                background: accent,
                color: "white",
                cursor: "pointer",
                fontSize: "1.05rem",
                fontWeight: 700,
                boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
              }}
            >
              Roll Dinner 🎲
            </button>

            <button
              onClick={() => {
                resetFilters();
              }}
              style={{
                marginTop: "0.5rem",
                padding: "0.55rem 1rem",
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: "transparent",
                color: "var(--foreground)",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Reset Filters
            </button>

            {/* Flashing mobile cue (auto-hide after ~6s) */}
            {hasRolled && showCue && (
              <div
                key={flashKey}
                className="scroll-cue"
                style={{
                  marginTop: 10,
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  letterSpacing: 0.2,
                  textAlign: "center",
                }}
              >
                Scroll down for your recipe ↓
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom ad */}
      <div style={{ width: "100%", maxWidth: 1000, margin: "16px 0" }}>
        <AdSlot label="Ad Banner — Inline" />
      </div>

      {/* Result */}
      {current && (
        <article style={{ width: "100%", maxWidth: 900, marginTop: 8 }}>
          <h2 style={{ marginBottom: 2 }}>{current.name}</h2>

          {(current.servings || current.portion_size) && (
            <div style={{ opacity: 0.85, marginTop: 2 }}>
              Servings: {current.servings || current.portion_size}
            </div>
          )}

          <div style={{ opacity: 0.9, marginTop: 6 }}>
            {current.protein?.map((p) => (
              <Pill key={p} text={p} />
            ))}
            {current.diet?.map((d) => (
              <Pill key={d} text={d} />
            ))}
            {current.is_one_pot && <Pill text="one-pot" />}
          </div>

          {/* Ingredients */}
          {current.ingredients?.length > 0 && (
            <section style={{ marginTop: 12 }}>
              <h3>Ingredients</h3>
              <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                {current.ingredients.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Instructions */}
          {current.instructions?.length > 0 && (
            <section style={{ marginTop: 12 }}>
              <h3>Instructions</h3>
              <ol style={{ marginTop: 6, paddingLeft: 20 }}>
                {current.instructions.map((step, i) => (
                  <li key={i} style={{ marginTop: 4 }}>
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Pro Tips (visible) */}
          {current.pro_tips?.length > 0 && (
            <section style={{ marginTop: 12 }}>
              <h3>Pro Tips</h3>
              <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                {current.pro_tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Variations: paywall-ready placeholder */}
          {current.variations?.length > 0 && (
            <section style={{ marginTop: 12 }}>
              <div
                style={{
                  padding: "10px 12px",
                  border: `1px dashed ${border}`,
                  borderRadius: 12,
                  color: "var(--muted)",
                }}
              >
                Variations are available for premium members.
              </div>
            </section>
          )}
        </article>
      )}

      {/* Styles for flashing cue */}
      <style jsx>{`
        @keyframes wfdfade {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
        }
        .scroll-cue {
          animation-name: wfdfade;
          animation-duration: 0.9s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: 3; /* flashes 3 times */
        }
        @media (max-width: 480px) {
          .scroll-cue { font-size: 1.1rem; }
        }
      `}</style>
    </main>
  );
}
