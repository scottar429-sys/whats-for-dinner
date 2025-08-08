import Link from "next/link";

export default function Contact() {
  return (
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <h1>Contact Us</h1>
      <p>Questions, suggestions, or a recipe you love? We&apos;d love to hear from you.</p>
      <p>
        Email:{" "}
        <a href="mailto:whats4dinnerinspiration@gmail.com">
          whats4dinnerinspiration@gmail.com
        </a>
      </p>
      <p style={{ opacity: 0.8, fontSize: "0.95rem" }}>
        We usually reply within a few days. Please don&apos;t send sensitive personal information.
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
