import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Live কুইজ - Daily Quiz Challenge",
  description: "A clean, minimalist daily quiz challenge application with real-time feedback and a countdown timer.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
