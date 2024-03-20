import { Schema } from 'mongoose';
import * as mongoose from 'mongoose';

export const RoleSchema = new mongoose.Schema(
  {
    roleName: { type: String, required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, index: true },
    description: { type: String, index: true },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permissions',
      },
    ],
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);
