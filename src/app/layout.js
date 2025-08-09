import "./globals.css";

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
      </body>
    </html>
  );
}
