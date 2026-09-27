import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Safely converts an HTML date input string (YYYY-MM-DD) into an ISO string in local time,
 * preserving existing time-of-day or using current time.
 * Prevents timezone shifting bugs where parsing date-only strings in UTC shifts days backward.
 */
export const toLocalISOString = (dateStr: string, existingDateISO?: string): string => {
  if (!dateStr) return new Date().toISOString();
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return new Date(dateStr).toISOString();
  }
  const [year, month, day] = parts;
  const refDate = existingDateISO ? new Date(existingDateISO) : new Date();
  const hours = isNaN(refDate.getTime()) ? 12 : refDate.getHours();
  const minutes = isNaN(refDate.getTime()) ? 0 : refDate.getMinutes();
  const seconds = isNaN(refDate.getTime()) ? 0 : refDate.getSeconds();

  const localDate = new Date(year, month - 1, day, hours, minutes, seconds);
  return localDate.toISOString();
};
