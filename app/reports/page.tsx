'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Package, ShoppingCart, Factory, DollarSign } from 'lucide-react'

export default function ReportsPage() {
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports/summary')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const exportToCSV = () => {
    if (!stats.recentTransactions) return
    
    let csv = 'Product,Type,Quantity,Date\n'
    stats.recentTransactions.forEach((tx: any) => {
      csv += `"${tx.product}","${tx.type}",${tx.quantity},"${new Date(tx.date).toLocaleDateString()}"\n`
    })
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={32} /> Reports & Analytics
        </h1>
        <button 
          onClick={exportToCSV}
          style={{ 
            background: '#4f46e5', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ⬇️ Export CSV
        </button>
      </div>

      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <Package size={24} color="#2563eb" />
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>Total Products</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '5px' }}>{stats.totalProducts || 0}</p>
            </div>

            <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <ShoppingCart size={24} color="#16a34a" />
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>Sales Orders</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '5px' }}>{stats.totalSalesOrders || 0}</p>
            </div>

            <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <Factory size={24} color="#ea580c" />
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>Mfg Batches</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '5px' }}>{stats.totalManufacturingBatches || 0}</p>
            </div>

            <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <DollarSign size={24} color="#9333ea" />
              <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>Inventory Value</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', marginTop: '5px' }}>₹{(stats.totalInventoryValue || 0).toLocaleString()}</p>
            </div>
          </div>

          {stats.lowStockCount > 0 && (
            <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', padding: '15px 20px', marginBottom: '30px' }}>
              ⚠️ <strong>{stats.lowStockCount}</strong> products are running low on stock.
            </div>
          )}

          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ padding: '20px', borderBottom: '1px solid #eee', fontSize: '18px', fontWeight: 'bold' }}>Recent Transactions</h2>
            {stats.recentTransactions?.length > 0 ? (
              stats.recentTransactions.map((tx: any) => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid #eee' }}>
                  <div>
                    <p style={{ fontWeight: '500' }}>{tx.product}</p>
                    <p style={{ fontSize: '13px', color: '#666' }}>{tx.type}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 'bold', color: tx.quantity > 0 ? '#16a34a' : '#dc2626' }}>
                      {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                    </p>
                    <p style={{ fontSize: '12px', color: '#999' }}>{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ padding: '20px', color: '#666' }}>No recent transactions</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
