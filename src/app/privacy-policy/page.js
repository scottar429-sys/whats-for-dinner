export default function PrivacyPolicy() {
  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>

      <p>
        This Privacy Policy describes how What&apos;s For Dinner? (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;)
        collects, uses, and shares information when you use our website.
      </p>

      <h2>Information We Collect</h2>
      <p>
        We may collect non-personal information such as browser type, operating system,
        and pages visited. If you contact us by email, we may store your email address to respond.
      </p>

      <h2>Cookies &amp; Advertising</h2>
      <p>
        We use cookies to improve your browsing experience and to display personalized advertisements
        through Google AdSense and other third-party vendors. These vendors may use cookies to serve ads
        based on your prior visits to our site or other websites.
      </p>
      <p>
        You can opt out of personalized advertising by visiting{" "}
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
          Google Ads Settings
        </a>.
      </p>

      <h2>Third-Party Services</h2>
      <p>We are not responsible for the content or privacy practices of third-party websites linked from this site.</p>

      <h2>Contact</h2>
      <p>
        For questions about this Privacy Policy, please email{" "}
        <a href="mailto:whats4dinnerinspiration@gmail.com">whats4dinnerinspiration@gmail.com</a>.
      </p>
    </main>
  );
}
