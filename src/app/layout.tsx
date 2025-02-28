import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LoL Analytics",
  description: "League of Legends Analytics Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 flex flex-col`}
      >
        <Nav />
        <div className="flex-1 bg-gradient-radial from-blue-500/5 via-blue-500/5 to-transparent">
          <main className="container mx-auto p-4 flex-grow">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
