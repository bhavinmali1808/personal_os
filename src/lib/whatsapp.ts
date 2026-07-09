/** Builds a WhatsApp share URL for a transaction or split expense */
export function buildWALink(data: {
  type: 'transaction' | 'split'
  eventTag?: string
  category?: string
  amount: number
  txType?: 'income' | 'expense'
  date: Date | string
  note?: string
  participants?: { name: string; amount: number; settled: boolean; phone?: string }[]
  recipientPhone?: string
}): string {
  const dateStr = new Date(data.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const label = data.eventTag || data.category || 'Expense'
  const typeLabel = data.txType === 'income' ? 'received' : 'paid'

  let msg = ''

  if (data.type === 'transaction') {
    msg = `📌 ${label}
💸 ₹${data.amount.toLocaleString('en-IN')} — ${typeLabel}
📅 ${dateStr}`
    if (data.note) msg += `\n📝 ${data.note}`
    msg += '\n\n— via personal_os'
  } else {
    // Split expense
    msg = `📌 ${label} — Split Expense
💸 Total: ₹${data.amount.toLocaleString('en-IN')}
📅 ${dateStr}
\nParticipants:`
    data.participants?.forEach(p => {
      const status = p.settled ? '✅' : '⏳'
      msg += `\n${status} ${p.name}: ₹${p.amount.toLocaleString('en-IN')}`
    })
    msg += '\n\n— via personal_os'
  }

  const encoded = encodeURIComponent(msg)

  if (data.recipientPhone) {
    const phone = data.recipientPhone.replace(/\D/g, '')
    return `https://wa.me/${phone}?text=${encoded}`
  }

  return `https://wa.me/?text=${encoded}`
}
