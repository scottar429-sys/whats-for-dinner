"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import meals from "../data/meals.json";

const STANDARD_ALLERGENS = [
  "Dairy","Eggs","Fish","Shellfish","Tree Nuts","Peanuts","Soy","Wheat/Gluten","Sesame",
];

const METHOD_OPTIONS = [
  { value: "", label: "Cooking Methods" },
  { value: "stove-top", label: "Stove-top" },
  { value: "oven-bake", label: "Oven-bake" },
  { value: "grill", label: "Grill" },
  { value: "crockpot", label: "Crockpot" },
  { value: "instant-pot", label: "Instant Pot" },
  { value: "air-fryer", label: "Air Fryer" },
  { value: "no-cook", label: "No-cook" },
];

const TIME_OPTIONS = [
  { value: "", label: "Max Total Time" },
  { value: "15", label: "≤ 15 min" },
  { value: "30", label: "≤ 30 min" },
  { value: "45", label: "≤ 45 min" },
  { value: "60", label: "≤ 60 min" },
  { value: "61", label: "61+ min" }, // acts as "no upper cap beyond 60"
];

export default function Home() {
  const [meal, setMeal] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Filters
  const [protein, setProtein] = useState("");
  const [dietary, setDietary] = useState("");
  const [excludeAllergen, setExcludeAllergen] = useState("");
  const [method, setMethod] = useState("");
  const [maxTime, setMaxTime] = useState("");

  // Options from data
  const { proteinOptions, dietaryOptions } = useMemo(() => {
    const p = new Set(), d = new Set();
    meals.forEach((m) => {
      if (m.protein) p.add(m.protein);
      if (Array.isArray(m.dietary)) m.dietary.forEach((x) => d.add(x));
    });
    return { proteinOptions: [...p].sort(), dietaryOptions: [...d].sort() };
  }, []);

  // Apply filters
  const filteredMeals = useMemo(() => {
    const norm = (s) => (typeof s === "string" ? s.trim().toLowerCase() : "");
    return meals.filter((m) => {
      const proteinOK = protein ? m.protein === protein : true;
      const dietaryOK = dietary ? m.dietary?.includes(dietary) : true;
      const allergenOK = excludeAllergen ? !(m.allergens?.includes(excludeAllergen)) : true;
      const methodOK = method ? norm(m.method) === norm(method) : true;

      // Total time check (treat empty or missing as pass)
      let timeOK = true;
      if (maxTime) {
        const t = typeof m.totalTime === "number" ? m.totalTime : (Number(m.prep_time || 0) + Number(m.cook_time || 0));
        const cap = Number(maxTime);
        if (cap === 61) {
          // 61+ means anything over 60 qualifies, plus missing/<=60 also allowed? No — we’ll require >60.
          timeOK = t > 60;
        } else {
          timeOK = t <= cap;
        }
      }

      return proteinOK && dietaryOK && allergenOK && methodOK && timeOK;
    });
  }, [protein, dietary, excludeAllergen, method, maxTime]);

  function pickRandom(fromList) {
    const list = Array.isArray(fromList) ? fromList : filteredMeals;
    if (!list.length) return setMeal(null);
    setMeal(list[Math.floor(Math.random() * list.length)]);
  }

  const textColor = darkMode ? "#fff" : "#000";
  const subTextColor = darkMode ? "#ddd" : "#555";
  const cardBg = darkMode ? "#2b2b2b" : "#fff";
  const borderColor = darkMode ? "#444" : "#ccc";
  const pageBg = darkMode ? "#222" : "#fffaf4";

  return (
    <main style={{
      minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center",
      textAlign:"center", padding:"2rem", fontFamily:"sans-serif",
      backgroundColor:pageBg, color:textColor
    }}>
      {/* Nav + theme */}
      <div style={{width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:"0.5rem"}}>
        <nav style={{ display:"flex", gap:16 }}>
          <Link href="/about" style={{ textDecoration:"underline" }}>About</Link>
          <Link href="/contact" style={{ textDecoration:"underline" }}>Contact</Link>
          <Link href="/privacy-policy" style={{ textDecoration:"underline" }}>Privacy Policy</Link>
        </nav>
        <button onClick={()=>setDarkMode(!darkMode)} style={{ background:"none", border:`1px solid ${textColor}`, color:textColor, padding:"6px 12px", borderRadius:"6px", cursor:"pointer" }}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Logo */}
      <div style={{ marginBottom:"1rem" }}>
        <Image src="/logo.png" alt="What&apos;s For Dinner Logo" width={200} height={200} priority />
      </div>

      <h1 style={{ marginBottom:"0.25rem" }}>What&apos;s For Dinner?</h1>
      <p style={{ color:subTextColor, marginBottom:"1rem", maxWidth:720 }}>
        Choose optional filters and click the button to get a dinner idea. All recipes serve 2.
      </p>

      <button onClick={()=>pickRandom()} style={{
        background:"#ff7a00", color:"#fff", border:"none", padding:"12px 18px",
        borderRadius:"10px", cursor:"pointer", fontSize:"1rem", marginBottom:"1.25rem"
      }}>
        🎲 Generate Meal
      </button>

      {/* Filters */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginBottom:"1rem", maxWidth:980 }}>
        <select value={protein} onChange={(e)=>setProtein(e.target.value)} style={{ padding:"8px 10px", borderRadius:8, border:`1px solid ${borderColor}`, minWidth:180, backgroundColor:cardBg, color:textColor }}>
          <option value="">All Proteins</option>
          {proteinOptions.map((p)=><option key={p} value={p}>{p}</option>)}
        </select>

        <select value={dietary} onChange={(e)=>setDietary(e.target.value)} style={{ padding:"8px 10px", borderRadius:8, border:`1px solid ${borderColor}`, minWidth:180, backgroundColor:cardBg, color:textColor }}>
          <option value="">All Diets</option>
          {dietaryOptions.map((d)=><option key={d} value={d}>{d}</option>)}
        </select>

        <select value={method} onChange={(e)=>setMethod(e.target.value)} style={{ padding:"8px 10px", borderRadius:8, border:`1px solid ${borderColor}`, minWidth:180, backgroundColor:cardBg, color:textColor }}>
          {METHOD_OPTIONS.map((m)=><option key={m.value} value={m.value}>{m.label}</option>)}
        </select>

        <select value={maxTime} onChange={(e)=>setMaxTime(e.target.value)} style={{ padding:"8px 10px", borderRadius:8, border:`1px solid ${borderColor}`, minWidth:180, backgroundColor:cardBg, color:textColor }}>
          {TIME_OPTIONS.map((t)=><option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <select value={excludeAllergen} onChange={(e)=>setExcludeAllergen(e.target.value)} style={{ padding:"8px 10px", borderRadius:8, border:`1px solid ${borderColor}`, minWidth:220, backgroundColor:cardBg, color:textColor }}>
          <option value="">Exclude Allergen (optional)</option>
          {STANDARD_ALLERGENS.map((a)=><option key={a} value={a}>{a}</option>)}
        </select>

        <button onClick={()=>{ setProtein(""); setDietary(""); setExcludeAllergen(""); setMethod(""); setMaxTime(""); setMeal(null); }} style={{
          background:"none", color:textColor, border:`1px solid ${textColor}`,
          padding:"10px 16px", borderRadius:"10px", cursor:"pointer", fontSize:"1rem"
        }}>
          Reset
        </button>
      </div>

      {/* Meal card */}
      {meal && (
        <section style={{
          marginTop:"0.5rem", width:"100%", maxWidth:720, textAlign:"left",
          background:cardBg, color:textColor, borderRadius:12, padding:"1.25rem",
          border:`1px solid ${borderColor}`, boxShadow: darkMode ? "none" : "0 4px 16px rgba(0,0,0,0.08)"
        }}>
          <h2 style={{ marginBottom:"0.5rem", textAlign:"center", fontWeight:800 }}>{meal.name}</h2>

          <div style={{ marginBottom:"0.75rem", fontSize:"0.95rem", textAlign:"center", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:12 }}>
            {meal.protein && <span><strong>Protein:</strong> {meal.protein}</span>}
            {meal.dietary?.length > 0 && <span><strong>Dietary:</strong> {meal.dietary.join(", ")}</span>}
            {meal.method && <span><strong>Method:</strong> {meal.method}</span>}
            {meal.secondaryCookingMethod && <span><strong>Alt:</strong> {meal.secondaryCookingMethod}</span>}
            {typeof meal.prep_time === "number" && <span><strong>Prep:</strong> {meal.prep_time} min</span>}
            {typeof meal.cook_time === "number" && <span><strong>Cook:</strong> {meal.cook_time} min</span>}
            {typeof meal.totalTime === "number" && <span><strong>Total:</strong> {meal.totalTime} min</span>}
            {meal.servings && <span><strong>Serves:</strong> {meal.servings}</span>}
          </div>

          {meal.ingredients?.length > 0 && (
            <>
              <h3>Ingredients</h3>
              <ul style={{ marginTop:6, paddingLeft:20 }}>
                {meal.ingredients.map((it, idx)=><li key={idx}>{it}</li>)}
              </ul>
            </>
          )}

          {meal.instructions && (
            <>
              <h3 style={{ marginTop:"1rem" }}>Instructions</h3>
              <p style={{ marginTop:6, whiteSpace:"pre-line" }}>
                {Array.isArray(meal.instructions)
                  ? meal.instructions.map((step,i)=>`${i+1}. ${step}`).join("\n")
                  : meal.instructions}
              </p>
            </>
          )}

          {meal.recommendedSides?.length > 0 && (
            <>
              <h3 style={{ marginTop:"1rem" }}>Recommended Sides</h3>
              <ul style={{ marginTop:6, paddingLeft:20 }}>
                {meal.recommendedSides.map((s,i)=><li key={i}>{s}</li>)}
              </ul>
            </>
          )}
        </section>
      )}

      <footer style={{ marginTop:"3rem", paddingTop:"1rem", borderTop:`1px solid ${borderColor}`, width:"100%", maxWidth:900, textAlign:"center" }}>
        <p style={{ marginBottom:"0.5rem" }}>
          <Link href="/about" style={{ margin:"0 10px", textDecoration:"underline" }}>About</Link> |
          <Link href="/contact" style={{ margin:"0 10px", textDecoration:"underline" }}>Contact</Link> |
          <Link href="/privacy-policy" style={{ margin:"0 10px", textDecoration:"underline" }}>Privacy Policy</Link>
        </p>
        <div style={{ fontSize:"0.85rem", opacity: 0.8, lineHeight:1.4, maxWidth:720, margin:"0.5rem auto 0" }}>
          This website provides meal ideas for inspiration only. Adjust ingredients and times to your needs.
          Always follow safe cooking practices and cook proteins to safe temperatures.
          <div style={{ marginTop:"0.5rem" }}>© {new Date().getFullYear()} What&apos;s For Dinner?</div>
        </div>
      </footer>
    </main>
  );
}
