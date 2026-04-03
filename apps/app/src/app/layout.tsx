import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevPort",
  description: "Manage your developer portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
