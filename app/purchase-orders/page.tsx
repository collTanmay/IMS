'use client'

import { useState, useEffect } from 'react'
import { Package, Plus, Truck, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/purchase-orders?page=${page}&limit=20`)
        const result = await res.json()
        
        if (page === 1) {
          setOrders(result.data || result)
        } else {
          setOrders(prev => [...prev, ...(result.data || result)])
        }
        
        if (result.pagination) {
          setHasMore(page < result.pagination.pages)
        }
      } catch (err) {
        console.error(err)
        // Fallback
        try {
          const fallbackRes = await fetch('/api/purchase-orders')
          const fallbackData = await fallbackRes.json()
          const fallbackList = Array.isArray(fallbackData) ? fallbackData : fallbackData.data || fallbackData
          if (page === 1) setOrders(fallbackList)
        } catch (e) {
          console.error('Fallback failed:', e)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [page])

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'DRAFT': return { bg: '#f3f4f6', color: '#374151', icon: <Clock size={14} />, label: 'Draft' }
      case 'ORDERED': return { bg: '#dbeafe', color: '#1d4ed8', icon: <Truck size={14} />, label: 'Ordered' }
      case 'RECEIVED': return { bg: '#dcfce7', color: '#16a34a', icon: <CheckCircle size={14} />, label: 'Received' }
      default: return { bg: '#f3f4f6', color: '#374151', icon: null, label: status }
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Package size={32} /> Purchase Orders
        </h1>
        <Link href="/purchase-orders/new">
          <button style={{ 
            background: '#16a34a', 
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Plus size={20} /> New Purchase Order
          </button>
        </Link>
      </div>

      {loading && page === 1 ? (
        <p>⏳ Loading purchase orders...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
          <Package size={48} color="#ccc" />
          <p style={{ marginTop: '20px', color: '#666', marginBottom: '20px' }}>No purchase orders yet.</p>
          <Link href="/purchase-orders/new">
            <button style={{ 
              background: '#16a34a', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              Create Your First PO
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '15px', textAlign: 'left' }}>PO Number</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Items</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Created</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => {
                  const statusStyle = getStatusBadge(order.status)
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '15px' }}><code>{order.orderNumber}</code></td>
                      <td style={{ padding: '15px' }}>{order.items?.length || 0} item(s)</td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          background: statusStyle.bg, 
                          color: statusStyle.color, 
                          padding: '6px 12px', 
                          borderRadius: '20px',
                          fontSize: '13px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {statusStyle.icon} {statusStyle.label}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '15px', textAlign: 'center' }}>
                        <Link href={`/purchase-orders/${order.id}`}>
                          <button style={{ 
                            background: '#eff6ff', 
                            color: '#0284c7',
                            border: '1px solid #bfdbfe', 
                            padding: '8px 16px', 
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#0284c7'
                            e.currentTarget.style.color = 'white'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#eff6ff'
                            e.currentTarget.style.color = '#0284c7'
                          }}>
                            View Details
                          </button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={loading}
                style={{
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? '⏳ Loading...' : '⬇️ Load More Orders'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
