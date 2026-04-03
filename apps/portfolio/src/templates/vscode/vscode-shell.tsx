"use client";

import Layout from "./components/Layout";
import { PortfolioBaseProvider } from "./base-context";

export function VscodeShell({
  base,
  titlebarTitle,
  children,
}: {
  base: string;
  titlebarTitle: string;
  children: React.ReactNode;
}) {
  return (
    <PortfolioBaseProvider base={base}>
      <Layout titlebarTitle={titlebarTitle}>{children}</Layout>
    </PortfolioBaseProvider>
  );
}
