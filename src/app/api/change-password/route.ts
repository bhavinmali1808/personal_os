import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/dbConnect'
import { User } from '@/models/User'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { oldPassword, newPassword } = await req.json()
  if (!oldPassword || !newPassword) return NextResponse.json({ error: 'Both fields required' }, { status: 400 })
  if (newPassword.length < 6) return NextResponse.json({ error: 'New password too short' }, { status: 400 })

  await dbConnect()
  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const valid = await bcrypt.compare(oldPassword, user.passwordHash)
  if (!valid) return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })

  user.passwordHash = await bcrypt.hash(newPassword, 12)
  await user.save()
  return NextResponse.json({ success: true })
}
