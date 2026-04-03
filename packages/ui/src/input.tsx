import type { InputHTMLAttributes } from "react";
import { ui } from "./styles";

export function Input({
  style,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input style={{ ...ui.input, ...style }} {...props} />;
}
