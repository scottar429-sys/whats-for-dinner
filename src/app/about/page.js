import Link from "next/link";

export default function About() {
  return (
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <h1>About What&apos;s For Dinner?</h1>
      <p>
        <strong>What&apos;s For Dinner?</strong> is a simple meal idea generator that helps you decide
        what to cook—fast. Click one button to get a random dinner suggestion, or narrow things down
        with protein and dietary filters.
      </p>
      <p>
        Recipes are written to be short, approachable, and adaptable. Feel free to swap ingredients,
        adjust seasoning, and use what you already have on hand.
      </p>
      <p>
        Food safety matters: always cook meats and seafood to safe internal temperatures and follow
        current food handling guidance.
      </p>
      <p>
        Have feedback or recipe ideas? Reach out any time at{" "}
        <a href="mailto:whats4dinnerinspiration@gmail.com">whats4dinnerinspiration@gmail.com</a>.
      </p>

      <div style={{ marginTop: "2rem" }}>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "0.6rem 1.2rem",
            backgroundColor: "#ff6b35",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
