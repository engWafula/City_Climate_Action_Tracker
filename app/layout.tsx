import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "City Climate Action Tracker",
  description: "Track city climate actions and progress toward net zero."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
