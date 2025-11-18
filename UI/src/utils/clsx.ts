import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClassValue } from "clsx";

export function cleanClassName(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
