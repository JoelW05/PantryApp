import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PantryIQ",
  description: "Smart pantry, meal planning & nutrition tracking",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "PantryIQ" },
  other: { "mobile-web-app-capable": "yes" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="theme-color" content="#059669" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${geist.className} bg-gray-50 text-gray-900 min-h-full`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
