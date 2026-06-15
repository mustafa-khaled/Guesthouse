import { Types, Document } from "mongoose";

export interface BaseDocument extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeleteDocument extends BaseDocument {
  isDeleted: boolean;
  deletedAt?: Date;
  softDelete(): Promise<this>;
  restore(): Promise<this>;
}

export interface AuditableDocument extends BaseDocument {
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

export interface AddressSchema {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface CoordinatesSchema {
  lat?: number;
  lng?: number;
}

export interface FullAddressSchema extends AddressSchema {
  coordinates?: CoordinatesSchema;
}

export interface ImageSchema {
  url: string;
  caption?: string;
  isPrimary?: boolean;
}

export interface ContactSchema {
  phone?: string;
  email?: string;
  website?: string;
}

export interface MongooseId {
  _id: Types.ObjectId;
  id: string;
}

export type WithId<T> = T & MongooseId;

export interface TimeRange {
  start: string;
  end: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PriceAmount {
  amount: number;
  currency: string;
}
