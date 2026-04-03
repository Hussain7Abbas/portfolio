import type { Metadata } from "next";
import "@/templates/vscode/styles/themes.css";

export const metadata: Metadata = {
  title: "DevPort Portfolio",
  description: "DevPort",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
