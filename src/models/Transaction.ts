import { Schema, Document, model, models, Types } from 'mongoose'

export type TransactionType = 'income' | 'expense'

export interface ITransaction extends Document {
  userId: Types.ObjectId
  type: TransactionType
  amount: number
  category: string
  note?: string
  eventTag?: string
  date: Date
  createdAt: Date
}

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  note: { type: String, default: '' },
  eventTag: { type: String, default: '' },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
})

export const Transaction = models.Transaction || model<ITransaction>('Transaction', TransactionSchema)
