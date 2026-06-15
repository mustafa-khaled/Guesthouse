import { Schema, Query } from "mongoose";

export interface SoftDeleteDocument {
  isDeleted: boolean;
  deletedAt?: Date;
}

export function softDeletePlugin(schema: Schema) {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  schema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };

  schema.methods.restore = function () {
    this.isDeleted = false;
    this.deletedAt = null;
    return this.save();
  };

  schema.statics.findActive = function (filter = {}) {
    return this.find({ ...filter, isDeleted: false });
  };

  schema.statics.findOneActive = function (filter = {}) {
    return this.findOne({ ...filter, isDeleted: false });
  };

  schema.statics.findByIdActive = function (id: string) {
    return this.findOne({ _id: id, isDeleted: false });
  };

  const excludeDeleted = function (this: Query<any, any>) {
    const conditions = this.getQuery();
    if (conditions.isDeleted === undefined && conditions.includeDeleted !== true) {
      this.where({ isDeleted: false });
    }
    delete conditions.includeDeleted;
  };

  schema.pre("find", excludeDeleted);
  schema.pre("findOne", excludeDeleted);
  schema.pre("countDocuments", excludeDeleted);
  schema.pre("findOneAndUpdate", excludeDeleted);
}

export interface AuditDocument {
  createdBy?: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
}

export function auditPlugin(schema: Schema) {
  schema.add({
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  });
}

export function toJSONPlugin(schema: Schema) {
  schema.set("toJSON", {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  });

  schema.set("toObject", {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  });
}
