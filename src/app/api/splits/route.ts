import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import { SplitExpense } from '@/models/SplitExpense'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await dbConnect()
  const splits = await SplitExpense.find({ userId: session.user.id }).sort({ createdAt: -1 })
  return NextResponse.json(splits)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  await dbConnect()
  const split = await SplitExpense.create({ ...body, userId: session.user.id })
  return NextResponse.json(split, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, participantIndex, settled, eventTag, totalAmount, participants } = await req.json()
  await dbConnect()

  const split = await SplitExpense.findOne({ _id: id, userId: session.user.id })
  if (!split) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Toggle a single participant's settled status
  if (participantIndex !== undefined) {
    split.participants[participantIndex].settled = settled
  }
  // Full update
  if (eventTag !== undefined) split.eventTag = eventTag
  if (totalAmount !== undefined) split.totalAmount = totalAmount
  if (participants !== undefined) split.participants = participants

  await split.save()
  return NextResponse.json(split)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await dbConnect()
  await SplitExpense.findOneAndDelete({ _id: id, userId: session.user.id })
  return NextResponse.json({ success: true })
}
