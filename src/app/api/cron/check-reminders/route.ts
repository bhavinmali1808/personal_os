import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import dbConnect from '@/lib/dbConnect'
import { Reminder } from '@/models/Reminder'
import { User } from '@/models/User'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function GET(req: NextRequest) {
  // Simple security: require a cron secret header for automated calls
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'dev-cron'}`) {
    // Allow in dev without secret
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  await dbConnect()

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Find unnotified reminders due today or tomorrow
  const reminders = await Reminder.find({
    notified: false,
    dueDate: { $lte: tomorrow },
  })

  let sent = 0

  for (const reminder of reminders) {
    const user = await User.findById(reminder.userId)
    if (!user?.pushSubscription) continue

    const amountText = reminder.amount ? ` — ₹${reminder.amount}` : ''
    const payload = JSON.stringify({
      title: 'personal_os reminder',
      body: `${reminder.title}${amountText} due ${new Date(reminder.dueDate).toLocaleDateString('en-IN')}`,
    })

    try {
      await webpush.sendNotification(user.pushSubscription as webpush.PushSubscription, payload)
      reminder.notified = true

      // Auto-regenerate for recurring reminders
      if (reminder.recurring === 'weekly') {
        const next = new Date(reminder.dueDate)
        next.setDate(next.getDate() + 7)
        await Reminder.create({
          userId: reminder.userId,
          title: reminder.title,
          amount: reminder.amount,
          dueDate: next,
          recurring: reminder.recurring,
          notified: false,
        })
      } else if (reminder.recurring === 'monthly') {
        const next = new Date(reminder.dueDate)
        next.setMonth(next.getMonth() + 1)
        await Reminder.create({
          userId: reminder.userId,
          title: reminder.title,
          amount: reminder.amount,
          dueDate: next,
          recurring: reminder.recurring,
          notified: false,
        })
      }

      await reminder.save()
      sent++
    } catch (err) {
      console.error('Push failed for reminder', reminder._id, err)
    }
  }

  return NextResponse.json({ checked: reminders.length, sent })
}
