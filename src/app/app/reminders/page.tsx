'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Bell, X } from 'lucide-react'

interface Reminder {
  _id: string
  title: string
  amount?: number
  dueDate: string
  recurring: 'none' | 'monthly' | 'weekly'
  notified: boolean
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [recurring, setRecurring] = useState<'none' | 'monthly' | 'weekly'>('none')
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/reminders')
    const data = await res.json()
    setReminders(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleAdd() {
    if (!title || !dueDate) return
    setLoading(true)
    await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, amount: amount ? parseFloat(amount) : undefined, dueDate, recurring }),
    })
    setLoading(false)
    setShowAdd(false)
    setTitle('')
    setAmount('')
    setDueDate(new Date().toISOString().split('T')[0])
    setRecurring('none')
    fetchData()
  }

  async function deleteReminder(id: string) {
    await fetch(`/api/reminders?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const overdue = reminders.filter(r => new Date(r.dueDate) < today)
  const upcoming = reminders.filter(r => new Date(r.dueDate) >= today)

  function ReminderRow({ r }: { r: Reminder }) {
    const due = new Date(r.dueDate)
    const isOverdue = due < today
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0', borderBottom: '1px solid #2A2A28' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: isOverdue ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Bell size={18} color={isOverdue ? '#EF4444' : '#888884'} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '15px', fontWeight: 500, color: isOverdue ? '#EF4444' : '#FFFFFF' }}>{r.title}</p>
          <p style={{ fontSize: '12px', color: '#888884', marginTop: '2px' }}>
            {due.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {r.recurring !== 'none' && ` · ${r.recurring}`}
          </p>
        </div>
        {r.amount && <p style={{ fontSize: '15px', fontWeight: 600 }}>₹{r.amount.toLocaleString('en-IN')}</p>}
        <button onClick={() => deleteReminder(r._id)} style={{ background: 'none', border: 'none', color: '#888884', cursor: 'pointer', padding: '4px' }}>
          <Trash2 size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="page-content" style={{ paddingTop: '24px' }}>
      <div className="page-header">
        <h1 className="page-title">Reminders</h1>
        <button className="btn btn-ghost" style={{ width: 'auto', padding: '8px 16px', fontSize: '14px' }} onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add
        </button>
      </div>

      {overdue.length > 0 && (
        <>
          <p className="section-label overdue">Overdue</p>
          <div className="card" style={{ padding: '0 16px' }}>
            {overdue.map(r => <ReminderRow key={r._id} r={r} />)}
          </div>
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <p className="section-label" style={{ marginTop: '20px' }}>Upcoming</p>
          <div className="card" style={{ padding: '0 16px' }}>
            {upcoming.map(r => <ReminderRow key={r._id} r={r} />)}
          </div>
        </>
      )}

      {reminders.length === 0 && (
        <p style={{ color: '#888884', fontSize: '14px', textAlign: 'center', marginTop: '32px' }}>No reminders yet.</p>
      )}

      {/* Add sheet */}
      {showAdd && (
        <div className="sheet-overlay" onClick={() => setShowAdd(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Add Reminder</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#888884', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="form-gap">
              <input placeholder="Title (e.g. Rent, Netflix)" value={title} onChange={e => setTitle(e.target.value)} />
              <input type="number" inputMode="decimal" placeholder="Amount (₹, optional)" value={amount} onChange={e => setAmount(e.target.value)} />
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              <div className="type-toggle">
                {(['none', 'weekly', 'monthly'] as const).map(r => (
                  <button key={r} className={recurring === r ? 'active-income' : ''} onClick={() => setRecurring(r)}
                    style={{ color: recurring === r ? '#22C55E' : '#888884', textTransform: 'capitalize' }}>
                    {r === 'none' ? 'One-time' : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary" onClick={handleAdd} disabled={loading}>
                {loading ? 'Saving…' : 'Add reminder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
