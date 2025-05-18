import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectInvitation extends Document {
  email: string;
  project: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  invitedBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectInvitationSchema = new Schema<IProjectInvitation>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }
  },
  {
    timestamps: true
  }
);

// Indexes
projectInvitationSchema.index({ email: 1, project: 1 }, { unique: true });
projectInvitationSchema.index({ status: 1 });
projectInvitationSchema.index({ expiresAt: 1 });

export const ProjectInvitation = mongoose.model<IProjectInvitation>('ProjectInvitation', projectInvitationSchema); 