'use client'

import { useState, useEffect } from 'react'
import { Package, Search, Sparkles } from 'lucide-react'

const getStockHealth = (quantity: number) => {
  const maxStock = 100
  const percentage = Math.min((quantity / maxStock) * 100, 100)
  
  if (quantity === 0) return { color: '#ef4444', percentage: 0, label: 'Out' }
  if (quantity < 10) return { color: '#f59e0b', percentage, label: 'Low' }
  if (quantity < 30) return { color: '#3b82f6', percentage, label: 'OK' }
  return { color: '#10b981', percentage, label: 'Good' }
}

export default function InventoryPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [aiSearchEnabled, setAiSearchEnabled] = useState(false)
  const [aiSearchResults, setAiSearchResults] = useState([])
  const [aiSearching, setAiSearching] = useState(false)

  useEffect(() => {
    fetch('/api/products/all')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.code?.toLowerCase().includes(search.toLowerCase())
  )

  const performAISearch = async (query: string) => {
    if (!query || query.length < 3) {
      setAiSearchResults([])
      return
    }
    
    setAiSearching(true)
    try {
      const res = await fetch('/api/ai/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      
      const data = await res.json()
      setAiSearchResults(data.products)
    } catch (error) {
      console.error(error)
    } finally {
      setAiSearching(false)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px' }}>📦 Inventory Management</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', padding: '10px 15px', background: 'white', flex: 1 }}>
            <Search size={20} color="#666" />
            <input 
              type="text" 
              placeholder={aiSearchEnabled ? "Try: 'show low stock items' or 'raw materials under 100 units'..." : "Search products..."}
              style={{ border: 'none', outline: 'none', marginLeft: '10px', fontSize: '16px', width: '100%' }}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                if (aiSearchEnabled) performAISearch(e.target.value)
              }}
            />
          </div>
          <button
            onClick={() => setAiSearchEnabled(!aiSearchEnabled)}
            style={{
              background: aiSearchEnabled ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6',
              color: aiSearchEnabled ? 'white' : '#374151',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: aiSearchEnabled ? 'bold' : 'normal'
            }}
          >
            <Sparkles size={18} />
            AI Search {aiSearchEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
        {aiSearching && <p style={{ marginTop: '10px', color: '#666' }}>🤖 AI analyzing your query...</p>}
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '15px', textAlign: 'left' }}>Code</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Weight (kg)</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Price (₹)</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Quantity</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(aiSearchEnabled ? aiSearchResults : filteredProducts).map((p: any) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}><code>{p.code}</code></td>
                <td style={{ padding: '15px' }}><strong>{p.name}</strong></td>
                <td style={{ padding: '15px' }}>
                  {p.isRawMaterial ? '🔵 Raw' : p.isFinishedGood ? '🟢 Finished' : '⚪ Other'}
                </td>
                <td style={{ padding: '15px', textAlign: 'right' }}>{p.weight} kg</td>
                <td style={{ padding: '15px', textAlign: 'right' }}>₹{p.price}</td>
                <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>{p.quantity}</td>
                <td style={{ padding: '15px', minWidth: '120px' }}>
                  {(() => {
                    const health = getStockHealth(p.quantity)
                    return (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>{health.label}</span>
                          <span>{p.quantity}</span>
                        </div>
                        <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${health.percentage}%`, 
                            height: '100%', 
                            background: health.color,
                            borderRadius: '3px'
                          }} />
                        </div>
                      </div>
                    )
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
