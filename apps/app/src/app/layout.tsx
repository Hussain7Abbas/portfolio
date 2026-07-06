import type { Metadata } from "next";
import { ToastProvider } from "@devport/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevPort",
  description: "Manage your developer portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
