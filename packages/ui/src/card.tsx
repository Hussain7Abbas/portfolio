import type { HTMLAttributes } from "react";
import { ui } from "./styles";

export function Card({
  style,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div style={{ ...ui.card, ...style }} {...props} />;
}
