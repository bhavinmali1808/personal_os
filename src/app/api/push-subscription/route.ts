import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import { User } from '@/models/User'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { subscription } = await req.json()
  await dbConnect()
  await User.findByIdAndUpdate(session.user.id, { pushSubscription: subscription })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await dbConnect()
  await User.findByIdAndUpdate(session.user.id, { pushSubscription: null })
  return NextResponse.json({ success: true })
}
