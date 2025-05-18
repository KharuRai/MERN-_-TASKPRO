import mongoose, { Document, Schema } from 'mongoose';

export interface IUserBadge extends Document {
  user: mongoose.Types.ObjectId;
  badge: mongoose.Types.ObjectId;
  awardedAt: Date;
  awardedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userBadgeSchema = new Schema<IUserBadge>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    badge: {
      type: Schema.Types.ObjectId,
      ref: 'Badge',
      required: true
    },
    awardedAt: {
      type: Date,
      default: Date.now
    },
    awardedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });
userBadgeSchema.index({ awardedAt: 1 });

export const UserBadge = mongoose.model<IUserBadge>('UserBadge', userBadgeSchema); 