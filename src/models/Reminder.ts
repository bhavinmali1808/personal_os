import { Schema, Document, model, models, Types } from 'mongoose'

export type RecurringType = 'none' | 'monthly' | 'weekly'

export interface IReminder extends Document {
  userId: Types.ObjectId
  title: string
  amount?: number
  dueDate: Date
  recurring: RecurringType
  notified: boolean
  createdAt: Date
}

const ReminderSchema = new Schema<IReminder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number },
  dueDate: { type: Date, required: true },
  recurring: { type: String, enum: ['none', 'monthly', 'weekly'], default: 'none' },
  notified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

export const Reminder = models.Reminder || model<IReminder>('Reminder', ReminderSchema)
