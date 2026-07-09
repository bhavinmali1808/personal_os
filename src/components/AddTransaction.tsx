'use client'
import { useState } from 'react'
import { X } from 'lucide-react'

const DEFAULT_CATEGORIES = ['Food', 'bike', 'Transport', 'Bills', 'Rent', 'Shopping', 'Health', 'Salary', 'Freelance', 'Other']

interface AddTransactionProps {
  onClose: () => void
  onSaved: () => void
  initial?: Partial<{
    id: string
    type: 'income' | 'expense'
    amount: number
    category: string
    note: string
    eventTag: string
    date: string
  }>
}

export default function AddTransaction({ onClose, onSaved, initial }: AddTransactionProps) {
  const [type, setType] = useState<'income' | 'expense'>(initial?.type || 'expense')
  const [amountStr, setAmountStr] = useState(initial?.amount ? String(initial.amount) : '')
  const [category, setCategory] = useState(initial?.category || '')
  const [note, setNote] = useState(initial?.note || '')
  const [eventTag, setEventTag] = useState(initial?.eventTag || '')
  const [date, setDate] = useState(initial?.date || new Date().toISOString().split('T')[0])
  const [customCat, setCustomCat] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = customCat
    ? [...DEFAULT_CATEGORIES, customCat]
    : DEFAULT_CATEGORIES

  async function handleSave() {
    const amount = parseFloat(amountStr)
    if (!amount || amount <= 0) return setError('Enter a valid amount')
    if (!category) return setError('Pick a category')
    setError('')
    setLoading(true)

    const body = { type, amount, category, note, eventTag, date: new Date(date) }
    const method = initial?.id ? 'PUT' : 'POST'
    const payload = initial?.id ? { id: initial.id, ...body } : body

    const res = await fetch('/api/transactions', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    if (res.ok) { onSaved(); onClose() }
    else setError('Failed to save')
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{initial?.id ? 'Edit' : 'Add'} Transaction</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888884', cursor: 'pointer', padding: '4px' }}><X size={20} /></button>
        </div>

        {/* Type toggle */}
        <div className="type-toggle" style={{ marginBottom: '20px' }}>
          <button className={type === 'expense' ? 'active-expense' : ''} onClick={() => setType('expense')}>Expense</button>
          <button className={type === 'income' ? 'active-income' : ''} onClick={() => setType('income')}>Income</button>
        </div>

        {/* Amount */}
        <div className="amount-display" style={{ color: type === 'income' ? '#22C55E' : '#EF4444' }}>
          ₹{amountStr || '0'}
        </div>
        <input
          type="number"
          inputMode="decimal"
          placeholder="Amount"
          value={amountStr}
          onChange={e => setAmountStr(e.target.value)}
          style={{ marginBottom: '16px', textAlign: 'center', fontSize: '20px' }}
        />

        {/* Category */}
        <p className="section-label">Category</p>
        <div className="chip-group" style={{ marginBottom: '12px' }}>
          {categories.map(c => (
            <button key={c} className={`chip ${category === c ? 'selected' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
        <input
          type="text"
          placeholder="+ Custom category"
          value={customCat}
          onChange={e => { setCustomCat(e.target.value); if (e.target.value) setCategory(e.target.value) }}
          style={{ marginBottom: '16px' }}
        />

        {/* Date */}
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ marginBottom: '12px' }} />

        {/* Event tag */}
        <input
          type="text"
          placeholder="Event / Tag (e.g. Goa Trip)"
          value={eventTag}
          onChange={e => setEventTag(e.target.value)}
          style={{ marginBottom: '12px' }}
        />

        {/* Note */}
        <textarea
          placeholder="Note (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          style={{ marginBottom: '16px', resize: 'none' }}
        />

        {error && <p style={{ color: '#EF4444', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}

        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving…' : initial?.id ? 'Save changes' : 'Add transaction'}
        </button>
      </div>
    </div>
  )
}
