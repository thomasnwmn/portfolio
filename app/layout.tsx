import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "@/components/arc/foundation.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Arc components set their body text in Inter.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thomas Newman",
  description: "Computer engineering student building across hardware and software: RISC-V, embedded control, sensing, systems programming, and full-stack applications.",

};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      data-accent="neutral"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-svh flex flex-col">
        <Navbar />
        <main id="main" tabIndex={-1} className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
