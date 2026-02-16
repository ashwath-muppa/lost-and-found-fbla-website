/**
 * Root Layout — The top-level layout wrapper for the entire application.
 * 
 * This layout applies the Inter font globally, includes the NavBar and Footer
 * on every page, and uses semantic HTML elements (<main>) for accessibility.
 * The skip-to-content link allows keyboard users to bypass navigation.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "School Lost & Found | Report & Recover Your Belongings",
  description:
    "A secure, accessible platform for students and staff to report lost items, browse found belongings, and reunite with their possessions. Built for the school community.",
  keywords: ["lost and found", "school", "FBLA", "lost items", "found items"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans">
        {/* Skip-to-content link for keyboard accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <NavBar />

        <main id="main-content" className="flex-1" role="main">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
