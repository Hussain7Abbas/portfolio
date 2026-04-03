import type { TextareaHTMLAttributes } from "react";
import { ui } from "./styles";

export function Textarea({
  style,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea style={{ ...ui.textarea, ...style }} {...props} />;
}
