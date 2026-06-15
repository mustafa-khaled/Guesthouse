import { z } from "zod";

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((date) => !isNaN(Date.parse(date)), "Invalid date");

export const dateRangeSchema = z
  .object({
    startDate: dateStringSchema,
    endDate: dateStringSchema,
  })
  .refine(
    (data) => new Date(data.startDate) <= new Date(data.endDate),
    "Start date must be before or equal to end date"
  );

export function parseDate(dateString: string): Date {
  const date = new Date(dateString);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  current.setUTCHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setUTCHours(0, 0, 0, 0);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function getNightsBetween(checkIn: Date, checkOut: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const start = new Date(checkIn);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(checkOut);
  end.setUTCHours(0, 0, 0, 0);

  return Math.round((end.getTime() - start.getTime()) / oneDay);
}

export function isDateInRange(
  date: Date,
  startDate: Date,
  endDate: Date
): boolean {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setUTCHours(0, 0, 0, 0);

  return d >= start && d <= end;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setUTCHours(23, 59, 59, 999);
  return result;
}

export function getTodayUTC(): Date {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now;
}

export function isFutureDate(date: Date): boolean {
  return getStartOfDay(date) > getTodayUTC();
}

export function isPastDate(date: Date): boolean {
  return getStartOfDay(date) < getTodayUTC();
}

export function isToday(date: Date): boolean {
  return getStartOfDay(date).getTime() === getTodayUTC().getTime();
}

export function getDayOfWeek(date: Date): number {
  return date.getUTCDay();
}

export function isWeekend(date: Date): boolean {
  const day = getDayOfWeek(date);
  return day === 0 || day === 6;
}

export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return { start, end };
}

export function parseTimeString(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
}

export function combineDateAndTime(date: Date, timeString: string): Date {
  const { hours, minutes } = parseTimeString(timeString);
  const result = new Date(date);
  result.setUTCHours(hours, minutes, 0, 0);
  return result;
}
