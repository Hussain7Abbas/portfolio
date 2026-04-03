import type { LabelHTMLAttributes } from "react";
import { ui } from "./styles";

export function Label({
  style,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label style={{ ...ui.fieldLabel, ...style }} {...props} />;
}
