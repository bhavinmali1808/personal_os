import { Schema, Document, model, models, Types } from 'mongoose'

export interface IParticipant {
  name: string
  phone?: string
  amount: number
  settled: boolean
}

export interface ISplitExpense extends Document {
  userId: Types.ObjectId
  transactionId?: Types.ObjectId
  totalAmount: number
  eventTag?: string
  participants: IParticipant[]
  createdAt: Date
}

const ParticipantSchema = new Schema<IParticipant>({
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  amount: { type: Number, required: true },
  settled: { type: Boolean, default: false },
})

const SplitExpenseSchema = new Schema<ISplitExpense>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  totalAmount: { type: Number, required: true },
  eventTag: { type: String, default: '' },
  participants: [ParticipantSchema],
  createdAt: { type: Date, default: Date.now },
})

export const SplitExpense = models.SplitExpense || model<ISplitExpense>('SplitExpense', SplitExpenseSchema)
