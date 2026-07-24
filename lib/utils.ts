import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateReadingTime(text: string): string {
  const wpm = 225; // Average reading speed
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / wpm);
  return `${time} min read`;
}
