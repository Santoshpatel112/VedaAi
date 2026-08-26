import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VedaAI — AI Assessment Extraction & Answer Mapping",
  description:
    "AI-powered assessment analysis platform for teachers. Extract questions, detect handwritten answers, and map with spatial highlighting.",
};

/**
 * Root layout — intentionally bare (no sidebar, no topbar).
 * Public pages (/, /login, /signup) use this directly.
 * Authenticated pages use their own nested layout at app/(dashboard)/layout.tsx
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F6F6F6] text-[#21262C] font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
