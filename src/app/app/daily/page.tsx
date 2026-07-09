'use client'
import { useEffect, useState, useCallback } from 'react'
import { Pencil, Trash2, Share2 } from 'lucide-react'
import AddTransaction from '@/components/AddTransaction'
import { buildWALink } from '@/lib/whatsapp'

interface Transaction {
  _id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  note?: string
  eventTag?: string
  date: string
}

const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍽️', Transport: '🚗', Bills: '💡', Rent: '🏠',
  Shopping: '🛍️', Health: '💊', Salary: '💰', Freelance: '💻', Other: '📌',
}

export default function DailyPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [editTx, setEditTx] = useState<Transaction | null>(null)

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/transactions?date=${selectedDate}`)
    const data = await res.json()
    setTransactions(Array.isArray(data) ? data : [])
  }, [selectedDate])

  useEffect(() => { fetchData() }, [fetchData])

  async function deleteTx(id: string) {
    await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  function share(tx: Transaction) {
    const url = buildWALink({
      type: 'transaction',
      eventTag: tx.eventTag,
      category: tx.category,
      amount: tx.amount,
      txType: tx.type,
      date: tx.date,
      note: tx.note,
    })
    window.open(url, '_blank')
  }

  const dayIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const dayExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="page-content" style={{ paddingTop: '24px' }}>
      <div className="page-header">
        <h1 className="page-title">Daily</h1>
      </div>

      {/* Date picker */}
      <input
        type="date"
        value={selectedDate}
        onChange={e => setSelectedDate(e.target.value)}
        style={{ marginBottom: '20px' }}
      />

      {/* Day summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#888884', marginBottom: '4px' }}>Income</p>
          <p style={{ fontSize: '20px', fontWeight: 700, color: '#22C55E' }}>₹{dayIncome.toLocaleString('en-IN')}</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#888884', marginBottom: '4px' }}>Expense</p>
          <p style={{ fontSize: '20px', fontWeight: 700, color: '#EF4444' }}>₹{dayExpense.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Transactions list */}
      {transactions.length === 0 ? (
        <p style={{ color: '#888884', fontSize: '14px', marginTop: '32px', textAlign: 'center' }}>No transactions on this day.</p>
      ) : (
        <div className="card" style={{ padding: '0 16px' }}>
          {transactions.map(tx => (
            <div key={tx._id} className="tx-row">
              <div className={`tx-icon ${tx.type}`}>{CATEGORY_ICONS[tx.category] || '📌'}</div>
              <div className="tx-info">
                <div className="tx-cat">{tx.eventTag || tx.category}</div>
                {tx.note && <div className="tx-note">{tx.note}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className={`tx-amount ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                </div>
                <button onClick={() => share(tx)} style={{ background: 'none', border: 'none', color: '#888884', cursor: 'pointer', padding: '4px' }}><Share2 size={14} /></button>
                <button onClick={() => setEditTx(tx)} style={{ background: 'none', border: 'none', color: '#888884', cursor: 'pointer', padding: '4px' }}><Pencil size={14} /></button>
                <button onClick={() => deleteTx(tx._id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editTx && (
        <AddTransaction
          onClose={() => setEditTx(null)}
          onSaved={fetchData}
          initial={{
            id: editTx._id,
            type: editTx.type,
            amount: editTx.amount,
            category: editTx.category,
            note: editTx.note,
            eventTag: editTx.eventTag,
            date: new Date(editTx.date).toISOString().split('T')[0],
          }}
        />
      )}
    </div>
  )
}
