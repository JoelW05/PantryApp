import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PantryIQ",
  description: "Smart pantry, meal planning & nutrition tracking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geist.className} bg-gray-50 text-gray-900 min-h-full`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
