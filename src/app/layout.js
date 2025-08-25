// src/app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "What's For Dinner?",
  description: "Your daily dinner inspiration",
};

// (Optional) Fixes the themeColor warning in Next.js 15
export const viewport = {
  themeColor: "#F8F3EB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
     <head>
  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3391816891786326"
    crossOrigin="anonymous"></script>
</head>

      <body className={inter.className}>{children}</body>
    </html>
  );
}
