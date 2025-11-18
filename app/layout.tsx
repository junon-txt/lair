import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Magic Lair - Yu-Gi-Oh! Decks",
  description: "Static Web Pages for Magic Lair Yu-Gi-Oh! related stuff.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

