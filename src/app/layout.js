import "./globals.css";
import ConsentBanner from "../components/ConsentBanner";
import AdSenseLoader from "../components/AdSenseLoader";

export const metadata = {
  title: "What&apos;s For Dinner?",
  description: "Random dinner idea generator with simple filters.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
        {/* Consent shows until accepted */}
        <ConsentBanner />
        {/* Loads AdSense script only after consent is granted */}
        <AdSenseLoader />
      </body>
    </html>
  );
}
