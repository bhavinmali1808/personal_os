'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Share2, Pencil, Trash2 } from 'lucide-react'
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

function groupByDay(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {}
  transactions.forEach(tx => {
    const key = new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(tx)
  })
  return groups
}

const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍽️', Transport: '🚗', Bills: '💡', Rent: '🏠',
  Shopping: '🛍️', Health: '💊', Salary: '💰', Freelance: '💻', Other: '📌',
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [now] = useState(new Date())

  const fetchData = useCallback(async () => {
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    const res = await fetch(`/api/transactions?month=${month}&year=${year}`)
    const data = await res.json()
    setTransactions(Array.isArray(data) ? data : [])
  }, [now])

  useEffect(() => { fetchData() }, [fetchData])

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net = income - expense

  // Today's transactions
  const todayKey = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const todayTxs = transactions.filter(t =>
    new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) === todayKey
  )
  const todayNet = todayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    - todayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Recent 10
  const recent = [...transactions].slice(0, 10)
  const groups = groupByDay(recent)

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

  const monthName = now.toLocaleDateString('en-IN', { month: 'long' })

  return (
    <div className="page-content" style={{ paddingTop: '24px' }}>
      {/* Today's net */}
      <div style={{ marginBottom: '24px' }}>
        <p className="section-label" style={{ margin: '0 0 4px' }}>Today</p>
        <div style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-2px', color: todayNet >= 0 ? '#FFFFFF' : '#EF4444' }}>
          ₹{Math.abs(todayNet).toLocaleString('en-IN')}
        </div>
        {todayNet < 0 && <p style={{ color: '#EF4444', fontSize: '13px' }}>net expense today</p>}
      </div>

      {/* Month summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
        <div className="card">
          <p style={{ fontSize: '11px', color: '#888884', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{monthName} income</p>
          <p style={{ fontSize: '22px', fontWeight: 700, color: '#22C55E' }}>₹{income.toLocaleString('en-IN')}</p>
        </div>
        <div className="card">
          <p style={{ fontSize: '11px', color: '#888884', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{monthName} expense</p>
          <p style={{ fontSize: '22px', fontWeight: 700, color: '#EF4444' }}>₹{expense.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Monthly net */}
      <div className="card" style={{ marginBottom: '28px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#888884', marginBottom: '4px' }}>Net this month</p>
        <p style={{ fontSize: '28px', fontWeight: 800, color: net >= 0 ? '#22C55E' : '#EF4444' }}>
          {net >= 0 ? '+' : '-'}₹{Math.abs(net).toLocaleString('en-IN')}
        </p>
      </div>

      {/* Recent transactions */}
      <p className="section-label">Recent transactions</p>
      {Object.keys(groups).length === 0 && (
        <p style={{ color: '#888884', fontSize: '14px', marginTop: '16px' }}>No transactions yet. Tap + to add one.</p>
      )}
      {Object.entries(groups).map(([day, txs]) => (
        <div key={day}>
          <p style={{ fontSize: '12px', color: '#888884', margin: '16px 0 6px' }}>{day}</p>
          <div className="card" style={{ padding: '0 16px' }}>
            {txs.map(tx => (
              <div key={tx._id} className="tx-row">
                <div className={`tx-icon ${tx.type}`}>
                  {CATEGORY_ICONS[tx.category] || '📌'}
                </div>
                <div className="tx-info">
                  <div className="tx-cat">{tx.eventTag || tx.category}</div>
                  {tx.note && <div className="tx-note">{tx.note}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={`tx-amount ${tx.type}`}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                  <button onClick={() => share(tx)} style={{ background: 'none', border: 'none', color: '#888884', cursor: 'pointer', padding: '4px' }}>
                    <Share2 size={14} />
                  </button>
                  <button onClick={() => setEditTx(tx)} style={{ background: 'none', border: 'none', color: '#888884', cursor: 'pointer', padding: '4px' }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteTx(tx._id)} style={{ background: 'none', border: 'none', color: '#888884', cursor: 'pointer', padding: '4px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* FAB */}
      <button className="fab" onClick={() => setShowAdd(true)}>
        <Plus size={28} />
      </button>

      {showAdd && (
        <AddTransaction onClose={() => setShowAdd(false)} onSaved={fetchData} />
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
