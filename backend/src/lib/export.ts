import { Parser } from "json2csv";
import { Response } from "express";
import { logger } from "./logger";

export interface ExportOptions {
  filename: string;
  fields?: string[];
  transforms?: ((item: any) => any)[];
  flatten?: boolean;
  flattenSeparator?: string;
}

export function toCSV<T extends object>(
  data: T[],
  options: Partial<ExportOptions> = {}
): string {
  const { fields, transforms, flatten = true, flattenSeparator = "." } = options;

  try {
    const parserOptions: any = {
      flatten,
      flattenSeparator,
    };

    if (fields && fields.length > 0) {
      parserOptions.fields = fields;
    }

    if (transforms && transforms.length > 0) {
      parserOptions.transforms = transforms;
    }

    const parser = new Parser(parserOptions);
    return parser.parse(data);
  } catch (error) {
    logger.error({ error }, "Failed to convert data to CSV");
    throw new Error("Failed to generate CSV export");
  }
}

export function sendCSVResponse<T extends object>(
  res: Response,
  data: T[],
  options: ExportOptions
): void {
  const { filename } = options;
  const csv = toCSV(data, options);

  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_-]/g, "_");
  const timestamp = new Date().toISOString().split("T")[0];
  const fullFilename = `${sanitizedFilename}_${timestamp}.csv`;

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${fullFilename}"`);
  res.setHeader("Cache-Control", "no-cache");
  res.send(csv);
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().replace("T", " ").substring(0, 19);
}

export function formatCurrency(amount: number | undefined, currency: string = "USD"): string {
  if (amount === undefined || amount === null) return "";
  return `${currency} ${amount.toFixed(2)}`;
}

export const bookingExportFields = [
  { label: "Confirmation #", value: "confirmationNumber" },
  { label: "Status", value: "status" },
  { label: "Guest Name", value: (row: any) => row.guestId ? `${row.guestId.firstName} ${row.guestId.lastName}` : "" },
  { label: "Guest Email", value: "guestId.email" },
  { label: "Property", value: "propertyId.name" },
  { label: "Room Type", value: "roomTypeId.name" },
  { label: "Check-in", value: (row: any) => formatDate(row.dates?.checkIn) },
  { label: "Check-out", value: (row: any) => formatDate(row.dates?.checkOut) },
  { label: "Nights", value: "dates.nights" },
  { label: "Adults", value: "occupancy.adults" },
  { label: "Children", value: "occupancy.children" },
  { label: "Rooms", value: "occupancy.rooms" },
  { label: "Room Total", value: "pricing.roomTotal" },
  { label: "Add-ons Total", value: "pricing.addOnsTotal" },
  { label: "Taxes", value: "pricing.taxes" },
  { label: "Grand Total", value: "pricing.grandTotal" },
  { label: "Amount Paid", value: "payment.amountPaid" },
  { label: "Amount Due", value: "payment.amountDue" },
  { label: "Payment Status", value: "payment.status" },
  { label: "Source", value: "source" },
  { label: "Created At", value: (row: any) => formatDateTime(row.createdAt) },
];

export const guestExportFields = [
  { label: "First Name", value: "firstName" },
  { label: "Last Name", value: "lastName" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "Nationality", value: "nationality" },
  { label: "City", value: "address.city" },
  { label: "Country", value: "address.country" },
  { label: "Stay Count", value: "stayCount" },
  { label: "Total Spend", value: "totalSpend" },
  { label: "Last Stay", value: (row: any) => formatDate(row.lastStayDate) },
  { label: "Tags", value: (row: any) => (row.tags || []).join(", ") },
  { label: "Marketing Consent", value: (row: any) => row.marketingConsent ? "Yes" : "No" },
  { label: "Created At", value: (row: any) => formatDateTime(row.createdAt) },
];

export const revenueExportFields = [
  { label: "Date", value: "date" },
  { label: "Bookings", value: "bookings" },
  { label: "Room Revenue", value: "roomRevenue" },
  { label: "Add-ons Revenue", value: "addOnsRevenue" },
  { label: "Total Revenue", value: "totalRevenue" },
  { label: "Taxes Collected", value: "taxesCollected" },
  { label: "Average Daily Rate", value: "averageDailyRate" },
];

export const occupancyExportFields = [
  { label: "Date", value: "date" },
  { label: "Total Rooms", value: "totalRooms" },
  { label: "Occupied Rooms", value: "occupiedRooms" },
  { label: "Available Rooms", value: "availableRooms" },
  { label: "Occupancy Rate (%)", value: "occupancyRate" },
  { label: "Revenue", value: "revenue" },
  { label: "RevPAR", value: "revPAR" },
];

export const paymentExportFields = [
  { label: "Payment ID", value: "_id" },
  { label: "Booking #", value: "bookingId.confirmationNumber" },
  { label: "Guest", value: (row: any) => row.guestId ? `${row.guestId.firstName} ${row.guestId.lastName}` : "" },
  { label: "Amount", value: "amount" },
  { label: "Currency", value: "currency" },
  { label: "Method", value: "method" },
  { label: "Status", value: "status" },
  { label: "Transaction ID", value: "transactionId" },
  { label: "Date", value: (row: any) => formatDateTime(row.createdAt) },
];
