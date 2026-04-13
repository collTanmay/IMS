'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Product } from '@prisma/client'

interface OrderItem {
  productId: string
  quantity: number
  unitPrice: number
}

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<OrderItem[]>([{ productId: '', quantity: 1, unitPrice: 0 }])

  useEffect(() => {
    fetch('/api/products/all?limit=100')
      .then(res => res.json())
      .then(result => {
        const productList = Array.isArray(result) ? result : result.data || result
        setProducts(productList.filter((p: Product) => p.isRawMaterial))
      })
      .catch(console.error)
  }, [])

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    if (field === 'productId') {
      const product = products.find((p) => p.id === value)
      if (product) {
        newItems[index].unitPrice = product.price
      }
    }
    
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })
      
      if (res.ok) {
        router.push('/purchase-orders')
      } else {
        alert('Failed to create purchase order')
      }
    } catch (error) {
      console.error(error)
      alert('Error creating purchase order')
    } finally {
      setLoading(false)
    }
  }

  const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <Link href="/purchase-orders" style={{ textDecoration: 'none', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={20} /> Back to Purchase Orders
        </Link>
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px' }}>📦 New Purchase Order</h1>

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Order Items</h2>
            <button
              type="button"
              onClick={addItem}
              style={{ 
                background: 'none', 
                border: '1px solid #3b82f6', 
                color: '#3b82f6',
                padding: '8px 16px', 
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} /> Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#666' }}>Product</label>
                <select
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                  value={item.productId}
                  onChange={(e) => updateItem(index, 'productId', e.target.value)}
                >
                  <option value="">Select raw material...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (₹{p.price}/{p.weight}kg)</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666' }}>Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#666' }}>Unit Price (₹)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                />
              </div>
              <div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '10px'
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '18px', fontWeight: 'bold' }}>
            Total: ₹{total.toFixed(2)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{ 
              background: '#16a34a', 
              color: 'white', 
              border: 'none', 
              padding: '14px 30px', 
              borderRadius: '8px', 
              fontSize: '16px', 
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Save size={20} />
            {loading ? 'Creating...' : 'Create Purchase Order'}
          </button>
          <Link href="/purchase-orders">
            <button
              type="button"
              style={{ 
                background: '#f3f4f6', 
                color: '#374151', 
                border: 'none', 
                padding: '14px 30px', 
                borderRadius: '8px', 
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </Link>
        </div>
      </form>
    </div>
  )
}
