import { Schema, model, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
  userId?: Types.ObjectId;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  status: "SUCCESS" | "FAILURE" | "ALERT";
  details?: Record<string, any>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILURE", "ALERT"],
      required: true,
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);
