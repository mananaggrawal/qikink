import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Merch Studio — Qikink",
  description: "Generate AI designs and order custom print-on-demand merchandise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full bg-gray-950 text-gray-100">{children}</body>
    </html>
  );
}
