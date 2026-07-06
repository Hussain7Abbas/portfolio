import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { ui } from "./styles";
export { Button } from "./button";
export { Input } from "./input";
export { Textarea } from "./textarea";
export { Label } from "./label";
export { Card } from "./card";
export { Spinner } from "./spinner";
export { Skeleton } from "./skeleton";
export { EmptyState } from "./empty-state";
export { ErrorState } from "./error-state";
export { ConfirmDialog, useConfirm } from "./confirm-dialog";
export type { ConfirmOptions } from "./confirm-dialog";
export { ToastProvider, useToast } from "./toast";
