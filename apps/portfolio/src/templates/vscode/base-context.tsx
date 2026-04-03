"use client";

import { createContext, useContext } from "react";

const PortfolioBaseContext = createContext({ base: "" });

export function PortfolioBaseProvider({
  base,
  children,
}: {
  base: string;
  children: React.ReactNode;
}) {
  return (
    <PortfolioBaseContext.Provider value={{ base }}>{children}</PortfolioBaseContext.Provider>
  );
}

export function usePortfolioBase() {
  return useContext(PortfolioBaseContext);
}
