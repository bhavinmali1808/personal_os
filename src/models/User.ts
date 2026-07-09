import mongoose, { Schema, Document, model, models } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  createdAt: Date
  pushSubscription?: object
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  pushSubscription: { type: Schema.Types.Mixed, default: null },
})

export const User = models.User || model<IUser>('User', UserSchema)
