import { Document, Schema, Types } from 'mongoose';

export interface AuditLog extends Document {
  action: string;
  performedBy: Types.ObjectId;
  target: Types.ObjectId;
  timestamp: Date;
  message: string;
  targetEntity: string;
}
export const AuditLogSchema = new Schema({
  action: { type: String, required: true },
  message: { type: String, required: true },
  performedBy: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  target: { type: Types.ObjectId, ref: 'Task', required: true },
  timestamp: { type: Date, default: Date.now },
  targetEntity: { type: String, required: true },
});
