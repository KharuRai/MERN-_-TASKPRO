import mongoose, { Document, Schema } from 'mongoose';

export interface IAutomation extends Document {
  project: mongoose.Types.ObjectId;
  name: string;
  trigger: {
    type: 'status_change' | 'assignment' | 'due_date';
    conditions: {
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    }[];
  };
  actions: {
    type: 'change_status' | 'assign_user' | 'add_badge' | 'send_notification';
    params: Record<string, any>;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const automationSchema = new Schema<IAutomation>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    trigger: {
      type: {
        type: String,
        enum: ['status_change', 'assignment', 'due_date'],
        required: true
      },
      conditions: [{
        field: {
          type: String,
          required: true
        },
        operator: {
          type: String,
          enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than'],
          required: true
        },
        value: {
          type: Schema.Types.Mixed,
          required: true
        }
      }]
    },
    actions: [{
      type: {
        type: String,
        enum: ['change_status', 'assign_user', 'add_badge', 'send_notification'],
        required: true
      },
      params: {
        type: Schema.Types.Mixed,
        required: true
      }
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
automationSchema.index({ project: 1 });
automationSchema.index({ isActive: 1 });

export const Automation = mongoose.model<IAutomation>('Automation', automationSchema); 