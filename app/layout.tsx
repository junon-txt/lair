import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Magic Lair - HOTU banlist",
  description: "Static Web Pages for Magic Lair HOTU banlist.",
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

