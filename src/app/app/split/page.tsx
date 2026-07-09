'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Share2, Trash2, Check } from 'lucide-react'
import { buildWALink } from '@/lib/whatsapp'
import { X } from 'lucide-react'

interface Participant {
  name: string
  phone?: string
  amount: number
  settled: boolean
}

interface SplitExpense {
  _id: string
  totalAmount: number
  eventTag?: string
  participants: Participant[]
  createdAt: string
}

export default function SplitPage() {
  const [splits, setSplits] = useState<SplitExpense[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [eventTag, setEventTag] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([{ name: '', amount: 0, settled: false }])
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/splits')
    const data = await res.json()
    setSplits(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function toggleSettled(splitId: string, pIdx: number, current: boolean) {
    await fetch('/api/splits', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: splitId, participantIndex: pIdx, settled: !current }),
    })
    fetchData()
  }

  async function deleteSplit(id: string) {
    await fetch(`/api/splits?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  async function handleAdd() {
    if (!totalAmount || participants.some(p => !p.name)) return
    setLoading(true)
    await fetch('/api/splits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totalAmount: parseFloat(totalAmount), eventTag, participants }),
    })
    setLoading(false)
    setShowAdd(false)
    setEventTag('')
    setTotalAmount('')
    setParticipants([{ name: '', amount: 0, settled: false }])
    fetchData()
  }

  function shareAll(split: SplitExpense) {
    const url = buildWALink({
      type: 'split',
      eventTag: split.eventTag,
      amount: split.totalAmount,
      date: split.createdAt,
      participants: split.participants,
    })
    window.open(url, '_blank')
  }

  function shareParticipant(split: SplitExpense, p: Participant) {
    const url = buildWALink({
      type: 'split',
      eventTag: split.eventTag,
      amount: p.amount,
      date: split.createdAt,
      participants: [p],
      recipientPhone: p.phone,
    })
    window.open(url, '_blank')
  }

  return (
    <div className="page-content" style={{ paddingTop: '24px' }}>
      <div className="page-header">
        <h1 className="page-title">Split</h1>
        <button className="btn btn-ghost" style={{ width: 'auto', padding: '8px 16px', fontSize: '14px' }} onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add
        </button>
      </div>

      {splits.length === 0 && !showAdd && (
        <p style={{ color: '#888884', fontSize: '14px', marginTop: '32px', textAlign: 'center' }}>No split expenses yet.</p>
      )}

      {splits.map(split => {
        const allSettled = split.participants.every(p => p.settled)
        const unsettledTotal = split.participants.filter(p => !p.settled).reduce((s, p) => s + p.amount, 0)
        return (
          <div key={split._id} className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '16px' }}>{split.eventTag || 'Split Expense'}</p>
                <p style={{ color: '#888884', fontSize: '13px' }}>Total: ₹{split.totalAmount.toLocaleString('en-IN')}</p>
                {!allSettled && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '2px' }}>₹{unsettledTotal.toLocaleString('en-IN')} pending</p>}
                {allSettled && <p style={{ color: '#22C55E', fontSize: '12px', marginTop: '2px' }}>All settled ✓</p>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => shareAll(split)} style={{ background: 'none', border: 'none', color: '#888884', cursor: 'pointer', padding: '4px' }}><Share2 size={16} /></button>
                <button onClick={() => deleteSplit(split._id)} style={{ background: 'none', border: 'none', color: '#888884', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
              </div>
            </div>

            {split.participants.map((p, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 0',
                borderTop: '1px solid #3A3A38',
                opacity: p.settled ? 0.5 : 1,
              }}>
                <button
                  onClick={() => toggleSettled(split._id, i, p.settled)}
                  style={{
                    width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${p.settled ? '#22C55E' : '#3A3A38'}`,
                    background: p.settled ? '#22C55E' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {p.settled && <Check size={12} color="#1F1F1E" />}
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, textDecoration: p.settled ? 'line-through' : 'none' }}>{p.name}</p>
                  {p.phone && <p style={{ fontSize: '11px', color: '#888884' }}>{p.phone}</p>}
                </div>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>₹{p.amount.toLocaleString('en-IN')}</p>
                <button onClick={() => shareParticipant(split, p)} style={{ background: 'none', border: 'none', color: '#888884', cursor: 'pointer', padding: '4px' }}>
                  <Share2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )
      })}

      {/* Add split sheet */}
      {showAdd && (
        <div className="sheet-overlay" onClick={() => setShowAdd(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Add Split</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#888884', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="form-gap">
              <input type="text" placeholder="Event name (e.g. Goa Trip)" value={eventTag} onChange={e => setEventTag(e.target.value)} />
              <input type="number" inputMode="decimal" placeholder="Total amount (₹)" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />

              <p className="section-label" style={{ margin: 0 }}>Participants</p>
              {participants.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    placeholder="Name"
                    value={p.name}
                    onChange={e => {
                      const next = [...participants]
                      next[i] = { ...next[i], name: e.target.value }
                      setParticipants(next)
                    }}
                    style={{ flex: 2 }}
                  />
                  <input
                    type="number"
                    placeholder="₹"
                    value={p.amount || ''}
                    onChange={e => {
                      const next = [...participants]
                      next[i] = { ...next[i], amount: parseFloat(e.target.value) || 0 }
                      setParticipants(next)
                    }}
                    style={{ flex: 1 }}
                  />
                  {participants.length > 1 && (
                    <button onClick={() => setParticipants(participants.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', flexShrink: 0 }}>
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button className="btn btn-ghost" onClick={() => setParticipants([...participants, { name: '', amount: 0, settled: false }])}>
                + Add participant
              </button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={loading}>
                {loading ? 'Saving…' : 'Create split'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
