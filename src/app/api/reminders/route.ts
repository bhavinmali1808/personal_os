import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import { Reminder } from '@/models/Reminder'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await dbConnect()
  const reminders = await Reminder.find({ userId: session.user.id }).sort({ dueDate: 1 })
  return NextResponse.json(reminders)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  await dbConnect()
  const reminder = await Reminder.create({ ...body, userId: session.user.id })
  return NextResponse.json(reminder, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, ...data } = await req.json()
  await dbConnect()
  const reminder = await Reminder.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    data,
    { new: true }
  )
  if (!reminder) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(reminder)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await dbConnect()
  await Reminder.findOneAndDelete({ _id: id, userId: session.user.id })
  return NextResponse.json({ success: true })
}
