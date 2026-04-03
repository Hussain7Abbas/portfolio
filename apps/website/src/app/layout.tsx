import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL ?? "https://iscoded.com";

export const metadata: Metadata = {
  title: "DevPort — Free developer portfolio platform",
  description:
    "Create your developer portfolio in minutes. Free, open-source, and customizable with community templates.",
  openGraph: {
    title: "DevPort — Free developer portfolio platform",
    description: "Create your developer portfolio in minutes.",
    url: siteUrl,
    siteName: "DevPort",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
