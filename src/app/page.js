"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import mealsRaw from "../data/meals.json";

/* =========================
   Helpers & Normalizers
   ========================= */
function toArray(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  if (typeof x === "string") return [x];
  return [];
}

// Parse time strings like "1 hour 15 minutes", "8–10 minutes", "30 min" → minutes (number)
function toMinutes(str) {
  if (!str || typeof str !== "string") return 0;
  const s = str.toLowerCase();
  let minutes = 0;

  // hours
  const hrMatch = s.match(/(\d+)\s*hour/);
  if (hrMatch) minutes += parseInt(hrMatch[1], 10) * 60;

  // ranges like 8–10 minutes or 8-10 min: take upper bound
  const rangeMatch = s.match(/(\d+)\s*[–-]\s*(\d+)\s*min/);
  if (rangeMatch) {
    minutes += parseInt(rangeMatch[2], 10);
    return minutes;
  }

  // plain minutes
  const minMatch = s.match(/(\d+)\s*min/);
  if (minMatch) {
    minutes += parseInt(minMatch[1], 10);
  }
  return minutes;
}

// Normalize method names to a consistent set
function normalizeMethod(raw) {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();
  const map = new Map([
    ["stovetop", "stove-top"],
    ["stove top", "stove-top"],
    ["stove-top", "stove-top"],
    ["pan-fry", "stove-top"],
    ["skillet", "stove-top"],

    ["oven", "oven-bake"],
    ["baked", "oven-bake"],
    ["bake", "oven-bake"],
    ["roast", "oven-bake"],
    ["roasting", "oven-bake"],
    ["sheet pan", "oven-bake"],
    ["sheet-pan", "oven-bake"],

    ["grilled", "grill"],
    ["bbq", "grill"],
    ["barbecue", "grill"],
    ["smoker", "grill"],

    ["slow-cooker", "slow cooker"],
    ["slow cooker", "slow cooker"],
    ["crockpot", "slow cooker"],
    ["crock pot", "slow cooker"],

    ["instant pot", "instant pot"],
    ["pressure cooker", "instant pot"],

    ["air fryer", "air fryer"],
    ["air-fryer", "air fryer"]
  ]);
  return map.get(s) || s;
}

// Display labels for canonical methods
const METHOD_LABELS = new Map([
  ["stove-top", "Stove-top"],
  ["oven-bake", "Oven-bake"],
  ["grill", "Grill"],
  ["slow cooker", "Slow cooker"],
  ["instant pot", "Instant Pot"],
  ["air fryer", "Air Fryer"],
  ["one-pot", "One-Pot"]
]);

function normalizeMeal(m) {
  let protein = toArray(m.protein).map((s) => String(s).toLowerCase());
  let dietary = (Array.isArray(m.diet) ? m.diet : m.dietary) || [];
  const methods = toArray(m.method || m.methods).map((s) => normalizeMethod(s)).filter(Boolean);
  const allergens = toArray(m.allergens).map((s) => String(s).toLowerCase());
  // --- Move vegetarian/vegan/pescatarian from protein -> diet (runtime safety) ---
  const proteinDietTerms = new Set(["vegetarian","vegan","pescatarian"]);
  const movedToDiet = [];
  protein = protein.filter((p) => {
    const keep = !proteinDietTerms.has(p);
    if (!keep) movedToDiet.push(p);
    return keep;
  });
  dietary = [...new Set([...dietary, ...movedToDiet])];

  const isOnePot = !!m.is_one_pot || methods.includes("one-pot") || methods.includes("one pot");
  if (isOnePot && !methods.includes("one-pot")) methods.push("one-pot");

  let t = 0;
  if (m.total_time) t = toMinutes(String(m.total_time));
  else t = toMinutes(String(m.cook_time)) + toMinutes(String(m.prep_time));

  return {
    name: m.name || "Untitled",
    protein,
    dietary: dietary.map((s) => String(s).toLowerCase()),
    methods,
    allergens,
    is_one_pot: isOnePot,
    time_minutes: t,
    servings: m.servings || "",
    prep_time: m.prep_time || "",
    cook_time: m.cook_time || "",
    total_time: m.total_time || "",
    ingredients: toArray(m.ingredients),
    instructions: toArray(m.instructions),
    variations: toArray(m.variations),
    pro_tips: toArray(m.pro_tips),
    description: m.description || "",
  };
}

const meals = mealsRaw.map(normalizeMeal);

const STANDARD_ALLERGENS = [
  "dairy","eggs","fish","shellfish","tree nuts","peanuts","soy","wheat/gluten","sesame",
];

const TIME_OPTIONS = [
  { value: "", label: "Any time" },
  { value: "15", label: "≤ 15 min" },
  { value: "30", label: "≤ 30 min" },
  { value: "45", label: "≤ 45 min" },
  { value: "60", label: "≤ 60 min" },
  { value: "61+", label: "> 60 min" },
];

/* =========================
   Ad Slot (placeholder)
   ========================= */
function AdSlot({ id, size = "300x250" }) {
  const [w, h] = size.split("x").map(Number);
  return (
    <div
      id={id}
      role="complementary"
      aria-label={`Ad slot ${id}`}
      style={{
        width: "100%",
        maxWidth: w,
        minHeight: h,
        margin: "16px auto",
        border: "2px dashed var(--border)",
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--muted)",
        background: "var(--card)",
      }}
    >
      Ad space: {size}
    </div>
  );
}


function Pill({ text, highlight=false }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      border: highlight ? "1px solid #2ecc71" : "1px solid var(--border)",
      background: highlight ? "rgba(46, 204, 113, 0.12)" : "var(--card)",
      color: highlight ? "#2ecc71" : "var(--foreground)",
      fontSize: "0.85rem",
      marginRight: 6,
      marginTop: 4
    }}>{text}</span>
  );
}

/* =========================
   Page
   ========================= */
export default function Page() {
  // ---- Paywall flags ----
  const showPremium = false;  // flip to true to reveal Variations
  const showUpsell = true;    // show small upsell note when premium is off

  // Filters
  const [protein, setProtein] = useState("");
  const [dietary, setDietary] = useState("");
  const [method, setMethod] = useState("");
  const [onePotOnly, setOnePotOnly] = useState(false);
  const [excludeAllergen, setExcludeAllergen] = useState("");
  const [timeFilter, setTimeFilter] = useState("");
  const resetFilters = () => {
    setProtein("");
    setDietary("");
    setMethod("");
    setOnePotOnly(false);
    setExcludeAllergen("");
    setTimeFilter("");
    setCurrent(null);
  };


  // Options from data
  const { proteinOptions, dietaryOptions, methodOptions } = useMemo(() => {
    const p = new Set(), d = new Set(), me = new Set();
    meals.forEach((m) => {
      m.protein.forEach((x) => p.add(x));
      m.dietary.forEach((x) => d.add(x));
      m.methods.forEach((x) => me.add(x));
      if (m.is_one_pot) me.add("one-pot");
    });
    return {
      proteinOptions: [...p].sort(),
      dietaryOptions: [...d].sort(),
      methodOptions: [...me].sort(),
    };
  }, []);

  function pickRandom(list) {
    if (!list || list.length === 0) return null;
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  }

  const filteredMeals = useMemo(() => {
    return meals.filter((m) => {
      const proteinOK = protein ? m.protein.includes(protein) : true;
      const dietaryOK = dietary ? m.dietary.includes(dietary) : true;
      const methodOK = method
        ? m.methods.includes(method) || (method === "one-pot" && m.is_one_pot)
        : true;
      const onePotOK = onePotOnly ? m.is_one_pot === true : true;
      const allergenOK = excludeAllergen ? !(m.allergens || []).includes(excludeAllergen) : true;
      let timeOK = true;
      if (timeFilter) {
        const t = m.time_minutes || 0;
        if (timeFilter === "61+") timeOK = t > 60;
        else timeOK = t <= parseInt(timeFilter, 10);
      }
      return proteinOK && dietaryOK && methodOK && onePotOK && allergenOK && timeOK;
    });
  }, [protein, dietary, method, onePotOnly, excludeAllergen, timeFilter]);

  const [current, setCurrent] = useState(null);
  function roll() { setCurrent(pickRandom(filteredMeals)); }

  return (
    <main style={{ padding: "1.75rem", maxWidth: 980, margin: "0 auto" }}>
      {/* Logo hero */}
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 10,
          marginBottom: "1rem",
        }}
      >
        <Image
          src="/logo.png"
          alt="What's For Dinner"
          width={220}
          height={220}
          priority
          style={{ height: "auto" }}
        />
        <h1 style={{ fontSize: "2rem", margin: 0 }}>What&apos;s For Dinner?</h1>
        <p style={{ opacity: 0.8, marginTop: 6 }}>Your daily dinner inspiration.</p>
      </header>

      {/* Top banner ad */}
      <AdSlot id="ad-top" size="728x90" />

      {/* Filter helpers note */}
      <p style={{ textAlign: "center", margin: "12px 0 6px", color: "var(--muted)" }}>
        Use the filters to narrow your dinner ideas — or leave them blank and just roll!
      </p>

      {/* Filters – tidy grid */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 12,
          margin: "0 0 16px",
        }}
      >
        <div style={filterCell(6)}>
          <label htmlFor="proteinSelect" style={label}>Protein</label>
          <select id="proteinSelect" value={protein} onChange={(e) => setProtein(e.target.value)} style={select}>
            <option value="">Any</option>
            {proteinOptions.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div style={filterCell(6)}>
          <label htmlFor="dietSelect" style={label}>Diet</label>
          <select id="dietSelect" value={dietary} onChange={(e) => setDietary(e.target.value)} style={select}>
            <option value="">Any</option>
            {dietaryOptions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div style={filterCell(4)}>
          <label htmlFor="methodSelect" style={label}>Method</label>
          <select id="methodSelect" value={method} onChange={(e) => setMethod(e.target.value)} style={select}>
            <option value="">Any method</option>
            {methodOptions.map((m) => <option key={m} value={m}>{METHOD_LABELS.get(m) || m}</option>)}
            {!methodOptions.includes("one-pot") && <option value="one-pot">{METHOD_LABELS.get("one-pot")}</option>}
          </select>
        </div>

        <div style={filterCell(4)}>
          <label htmlFor="allergenSelect" style={label}>Exclude Allergen</label>
          <select id="allergenSelect" value={excludeAllergen} onChange={(e) => setExcludeAllergen(e.target.value)} style={select}>
            <option value="">None</option>
            {STANDARD_ALLERGENS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div style={filterCell(4)}>
          <label htmlFor="timeSelect" style={label}>Cook Time</label>
          <select id="timeSelect" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} style={select}>
            {TIME_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div style={{ gridColumn: "span 12", display: "flex", justifyContent: "center", marginTop: 4 }}>
          <button onClick={roll} style={rollBtn}>Roll Dinner 🎲</button>
          <button onClick={resetFilters} style={{
            marginTop: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--foreground)",
            cursor: "pointer",
            fontSize: "1rem"
          }}>
            Reset Filters
          </button>
        </div>
      </section>

      {/* Inline rectangle ad */}
      <AdSlot id="ad-inline" size="300x250" />

      {/* Result Card */}
      {current ? (
        <article style={card}>
          <h2 style={{ marginTop: 0 }}>{current.name}</h2>
          <div style={{ opacity: 0.9, marginTop: 4 }}>
            {current.protein && current.protein.length > 0 && current.protein.map(p => <Pill key={p} text={p} />)}
            {current.diet && current.diet.length > 0 && current.diet.map(d => <Pill key={d} text={d} highlight={d === "vegan"} />)}
            {current.is_one_pot && <Pill text="one-pot" />}
          </div>
          {(current.servings || current.prep_time || current.cook_time || current.total_time) && (
            <p style={{ opacity: 0.8, marginTop: 4 }}>
              {current.servings && <span>Servings: {current.servings} • </span>}
              {current.prep_time && <span>Prep: {current.prep_time} • </span>}
              {current.cook_time && <span>Cook: {current.cook_time} • </span>}
              {current.total_time && <span>Total: {current.total_time}</span>}
            </p>
          )}

          {/* Ingredients */}
          {current.ingredients.length > 0 && (
            <section style={{ marginTop: 12 }}>
              <h3>Ingredients</h3>
              <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                {current.ingredients.map((it, idx) => <li key={idx}>{it}</li>)}
              </ul>
            </section>
          )}

          {/* Instructions */}
          {current.instructions.length > 0 && (
            <section style={{ marginTop: 12 }}>
              <h3>Instructions</h3>
              <ol style={{ marginTop: 6, paddingLeft: 20 }}>
                {current.instructions.map((s, idx) => <li key={idx}>{s}</li>)}
              </ol>
            </section>
          )}

          {/* Pro Tips ALWAYS visible */}
          {current.pro_tips.length > 0 && (
            <section style={{ marginTop: 12 }}>
              <h3>Pro Tips</h3>
              <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                {current.pro_tips.map((t, idx) => <li key={idx}>{t}</li>)}
              </ul>
            </section>
          )}

          {/* Premium: Variations (paywalled) */}
          {current.variations.length > 0 && (
            showPremium ? (
              <section style={{ marginTop: 12 }}>
                <h3>Variations</h3>
                <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                  {current.variations.map((v, idx) => <li key={idx}>{v}</li>)}
                </ul>
              </section>
            ) : (
              showUpsell && (
                <div style={{ marginTop: 10, padding: "10px 12px", border: "1px dashed var(--border)", borderRadius: 12, color: "var(--muted)" }}>
                  Variations available with premium.
                </div>
              )
            )
          )}
        </article>
      ) : (
        <article style={{ ...card, opacity: 0.95 }}>
          <p>Use the controls above to dial in your dinner, then hit <strong>Roll Dinner 🎲</strong>.</p>
        </article>
      )}

      {/* Footer */}
      <footer style={{ marginTop: "3rem", paddingTop: "1rem", borderTop: "1px solid var(--border)", width: "100%", maxWidth: 900, textAlign: "center" }}>
        <p style={{ marginBottom: 6 }}>
          <Link href="/about" style={{ margin: "0 10px", textDecoration: "underline" }}>About</Link> |
          <Link href="/contact" style={{ margin: "0 10px", textDecoration: "underline" }}>Contact</Link> |
          <Link href="/privacy-policy" style={{ margin: "0 10px", textDecoration: "underline" }}>Privacy Policy</Link>
        </p>
        <div style={{ fontSize: "0.85rem", opacity: 0.8, lineHeight: 1.4, maxWidth: 720, margin: "0.5rem auto 0" }}>
          This website provides meal ideas for inspiration only. Adjust ingredients and times to your needs.
          Always follow safe cooking practices and cook proteins to safe temperatures.
          <div style={{ marginTop: "0.5rem" }}>© {new Date().getFullYear()} What&apos;s For Dinner?</div>
        </div>
      </footer>
    </main>
  );
}

/* =========================
   Inline styles
   ========================= */
const card = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 18,
};

const label = {
  display: "block",
  fontWeight: 600,
  marginBottom: 6,
};

const select = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  background: "var(--card)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
};

function filterCell(span) {
  return {
    gridColumn: `span ${span}`,
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 12,
  };
}

const rollBtn = {
  background: "linear-gradient(90deg, #5eead4, #a78bfa)",
  color: "#081218",
  border: "none",
  borderRadius: 999,
  padding: "12px 18px",
  fontWeight: 700,
  fontSize: "1rem",
  cursor: "pointer",
  minWidth: 240,
};
