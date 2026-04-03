import type { Config } from "tailwindcss";
import shared from "@devport/tailwind-config";

const config: Config = {
  ...shared,
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
};

export default config;
