import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import { Transaction } from '@/models/Transaction'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()
  const { searchParams } = new URL(req.url)
  const filter: Record<string, unknown> = { userId: session.user.id }

  const date = searchParams.get('date')
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  if (date) {
    const d = new Date(date)
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    filter.date = { $gte: start, $lt: end }
  } else if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1)
    const end = new Date(Number(year), Number(month), 1)
    filter.date = { $gte: start, $lt: end }
  }

  const limit = Number(searchParams.get('limit')) || 0
  const transactions = await Transaction.find(filter).sort({ date: -1 }).limit(limit)
  return NextResponse.json(transactions)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  await dbConnect()
  const tx = await Transaction.create({ ...body, userId: session.user.id })
  return NextResponse.json(tx, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...data } = body
  await dbConnect()
  const tx = await Transaction.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    data,
    { new: true }
  )
  if (!tx) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(tx)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  await dbConnect()
  await Transaction.findOneAndDelete({ _id: id, userId: session.user.id })
  return NextResponse.json({ success: true })
}
