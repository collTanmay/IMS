'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, Search } from 'lucide-react'
import Link from 'next/link'
import { FeasibilityChecker } from '@/components/FeasibilityChecker'

export default function NewSalesOrderPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([{ productId: '', quantity: 1, unitPrice: 0 }])
  const [customerId, setCustomerId] = useState('')
  const [customerDetails, setCustomerDetails] = useState(null)

  // Auto-fill customer (FR22)
  const fetchCustomer = async (id: string) => {
    if (id.length < 2) return
    try {
      const res = await fetch(`/api/customers/${id}`)
      if (res.ok) {
        const data = await res.json()
        setCustomerDetails(data)
      }
    } catch (error) {
      console.error('Customer not found')
    }
  }

  useEffect(() => {
    fetch('/api/products/all')
      .then(res => res.json())
      .then(data => setProducts(data.filter((p: any) => p.isFinishedGood)))
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
      const product = products.find((p: any) => p.id === value)
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
      const res = await fetch('/api/sales-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerId,
          customerName: customerDetails?.name,
          items 
        })
      })
      
      if (res.ok) {
        router.push('/sales-orders')
      } else {
        alert('Failed to create order')
      }
    } catch (error) {
      console.error(error)
      alert('Error creating order')
    } finally {
      setLoading(false)
    }
  }

  const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/sales-orders" className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4">
            <ArrowLeft size={20} /> Back to Sales Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Sales Order</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Customer Section with Auto-Fill */}
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter customer ID"
                    className="flex-1 border rounded-lg p-2"
                    value={customerId}
                    onChange={(e) => {
                      setCustomerId(e.target.value)
                      fetchCustomer(e.target.value)
                    }}
                  />
                  <button type="button" className="bg-gray-100 p-2 rounded-lg">
                    <Search size={20} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="Auto-filled from ID"
                  className="w-full border rounded-lg p-2 bg-gray-50"
                  value={customerDetails?.name || ''}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Products Section - Unlimited Rows (FR21) */}
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Order Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Plus size={18} /> Add Product
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end border-b pb-3">
                  <div className="col-span-5">
                    <label className="text-xs text-gray-500">Product</label>
                    <select
                      required
                      className="w-full border rounded-lg p-2"
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    >
                      <option value="">Select product...</option>
                      {products.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code}) - ₹{p.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500">Quantity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full border rounded-lg p-2"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500">Unit Price (₹)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      className="w-full border rounded-lg p-2"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500">Subtotal</label>
                    <p className="p-2 font-medium">{formatINR(item.quantity * item.unitPrice)}</p>
                  </div>
                  <div className="col-span-1 text-right">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-end">
                <p className="text-xl font-bold">Total: {formatINR(total)}</p>
              </div>
            </div>
          </div>

          {/* Feasibility Check - Shows when products selected */}
          {items.some(i => i.productId) && (
            <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
              <h2 className="text-lg font-semibold mb-4">Feasibility Check</h2>
              {items.filter(i => i.productId).map((item, idx) => (
                <div key={idx} className="mb-3">
                  <FeasibilityChecker
                    productId={item.productId}
                    productName={products.find(p => p.id === item.productId)?.name || ''}
                    requestedQuantity={item.quantity}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Creating...' : 'Create Order'}
            </button>
            <Link href="/sales-orders">
              <button type="button" className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300">
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}