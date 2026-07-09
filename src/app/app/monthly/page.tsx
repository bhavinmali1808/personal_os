'use client'
import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Transaction {
  _id: string
  type: 'income' | 'expense'
  amount: number
  category: string
}

export default function MonthlyPage() {
  const [date, setDate] = useState(new Date())
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const fetchData = useCallback(async () => {
    const m = date.getMonth() + 1
    const y = date.getFullYear()
    const res = await fetch(`/api/transactions?month=${m}&year=${y}`)
    const data = await res.json()
    setTransactions(Array.isArray(data) ? data : [])
  }, [date])

  useEffect(() => { fetchData() }, [fetchData])

  function prevMonth() {
    setDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n })
  }
  function nextMonth() {
    setDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n })
  }

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net = income - expense

  // Category breakdown (expenses only)
  const catMap: Record<string, number> = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount
  })
  const maxCat = Math.max(...Object.values(catMap), 1)
  const cats = Object.entries(catMap).sort((a, b) => b[1] - a[1])

  const monthLabel = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="page-content" style={{ paddingTop: '24px' }}>
      {/* Month selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '8px' }}>
          <ChevronLeft size={20} />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 700 }}>{monthLabel}</h1>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '8px' }}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#888884', marginBottom: '4px' }}>Income</p>
          <p style={{ fontSize: '22px', fontWeight: 700, color: '#22C55E' }}>₹{income.toLocaleString('en-IN')}</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#888884', marginBottom: '4px' }}>Expense</p>
          <p style={{ fontSize: '22px', fontWeight: 700, color: '#EF4444' }}>₹{expense.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center', marginBottom: '28px' }}>
        <p style={{ fontSize: '12px', color: '#888884', marginBottom: '4px' }}>Net</p>
        <p style={{ fontSize: '28px', fontWeight: 800, color: net >= 0 ? '#22C55E' : '#EF4444' }}>
          {net >= 0 ? '+' : '-'}₹{Math.abs(net).toLocaleString('en-IN')}
        </p>
      </div>

      {/* Category bar chart */}
      {cats.length > 0 && (
        <>
          <p className="section-label">Expenses by category</p>
          <div className="card">
            {cats.map(([cat, amt]) => (
              <div key={cat} className="bar-chart-row">
                <div className="bar-chart-label">
                  <span style={{ color: '#FFFFFF' }}>{cat}</span>
                  <span style={{ color: '#888884' }}>₹{amt.toLocaleString('en-IN')}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(amt / maxCat) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {transactions.length === 0 && (
        <p style={{ color: '#888884', fontSize: '14px', textAlign: 'center', marginTop: '32px' }}>No transactions this month.</p>
      )}
    </div>
  )
}
