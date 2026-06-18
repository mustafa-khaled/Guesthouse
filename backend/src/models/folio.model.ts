import { Schema, model, Types, Document } from "mongoose";
import { toJSONPlugin } from "../common/plugins";

export enum FolioLineItemCategory {
  ROOM = "room",
  ADDON = "addon",
  TAX = "tax",
  FEE = "fee",
  PAYMENT = "payment",
  REFUND = "refund",
  ADJUSTMENT = "adjustment",
}

export enum FolioStatus {
  OPEN = "open",
  CLOSED = "closed",
  VOID = "void",
}

export interface IFolioLineItem {
  date: Date;
  description: string;
  category: FolioLineItemCategory;
  amount: number;
  quantity: number;
  total: number;
  reference?: string;
}

export interface IFolio extends Document {
  bookingId: Types.ObjectId;
  folioNumber: string;
  lineItems: IFolioLineItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  balance: number;
  status: FolioStatus;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const lineItemSchema = new Schema(
  {
    date: { type: Date, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: Object.values(FolioLineItemCategory),
      required: true,
    },
    amount: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    total: { type: Number, required: true },
    reference: String,
  },
  { _id: true }
);

const folioSchema = new Schema<IFolio>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    folioNumber: {
      type: String,
      required: true,
    },
    lineItems: [lineItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
    taxTotal: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(FolioStatus),
      default: FolioStatus.OPEN,
    },
    closedAt: Date,
  },
  { timestamps: true }
);

folioSchema.index({ folioNumber: 1 });
folioSchema.index({ bookingId: 1 });

folioSchema.methods.recalculate = function () {
  let subtotal = 0;
  let taxTotal = 0;
  let payments = 0;

  for (const item of this.lineItems) {
    if (item.category === FolioLineItemCategory.TAX) {
      taxTotal += item.total;
    } else if (
      item.category === FolioLineItemCategory.PAYMENT ||
      item.category === FolioLineItemCategory.REFUND
    ) {
      payments += item.total;
    } else {
      subtotal += item.total;
    }
  }

  this.subtotal = Math.round(subtotal * 100) / 100;
  this.taxTotal = Math.round(taxTotal * 100) / 100;
  this.grandTotal = Math.round((subtotal + taxTotal) * 100) / 100;
  this.amountPaid = Math.round(Math.abs(payments) * 100) / 100;
  this.balance = Math.round((this.grandTotal - this.amountPaid) * 100) / 100;
};

folioSchema.plugin(toJSONPlugin);

export const Folio = model<IFolio>("Folio", folioSchema);
