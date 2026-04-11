'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Edit, 
  Trash2,
  Save,
  X,
  AlertCircle
} from 'lucide-react'

export default function PurchaseOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [status, setStatus] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchOrder()
    }
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/purchase-orders/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
        setStatus(data.status)
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    setProcessing(true)
    try {
      // If moving to RECEIVED, call the receive endpoint
      if (newStatus === 'RECEIVED' && order.status !== 'RECEIVED') {
        const receiveRes = await fetch(`/api/purchase-orders/${params.id}/receive`, {
          method: 'POST'
        })
        
        if (!receiveRes.ok) {
          throw new Error('Failed to receive order')
        }
        
        alert('✅ Order received! Inventory has been updated.')
      } else {
        // Just update status
        const res = await fetch(`/api/purchase-orders/${params.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
        
        if (!res.ok) throw new Error('Failed to update status')
      }
      
      setStatus(newStatus)
      setOrder({ ...order, status: newStatus })
      setEditMode(false)
    } catch (error) {
      console.error('Failed to update:', error)
      alert('Failed to update status')
    } finally {
      setProcessing(false)
    }
  }

  const deleteOrder = async () => {
    if (!confirm('Are you sure you want to delete this order? This cannot be undone.')) {
      return
    }
    
    setProcessing(true)
    try {
      const res = await fetch(`/api/purchase-orders/${params.id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        alert('Order deleted successfully')
        router.push('/purchase-orders')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('Failed to delete order')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (statusValue: string) => {
    const styles: any = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock, label: 'Draft' },
      ORDERED: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Truck, label: 'Ordered' },
      RECEIVED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Received' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', icon: X, label: 'Cancelled' }
    }
    return styles[statusValue] || styles.DRAFT
  }

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)
  }

  const calculateTotal = () => {
    if (!order?.items) return 0
    return order.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The purchase order you're looking for doesn't exist.</p>
          <Link href="/purchase-orders">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Back to Purchase Orders
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const statusStyle = getStatusBadge(status)
  const StatusIcon = statusStyle.icon

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/purchase-orders" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <ArrowLeft size={20} /> Back to Purchase Orders
          </Link>
        </div>

        {/* Order Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Purchase Order: {order.orderNumber}
              </h1>
              <p className="text-gray-500">
                Created: {new Date(order.createdAt).toLocaleString()}
              </p>
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <p className="text-gray-500 text-sm">
                  Last Updated: {new Date(order.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
            
            {/* Status Section */}
            <div className="text-right">
              {editMode ? (
                <div className="flex items-center gap-2">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                    disabled={processing}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ORDERED">Ordered</option>
                    <option value="RECEIVED">Received</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <button
                    onClick={() => updateStatus(status)}
                    disabled={processing}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setStatus(order.status)
                      setEditMode(false)
                    }}
                    disabled={processing}
                    className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                    <StatusIcon size={16} />
                    {statusStyle.label}
                  </span>
                  <button
                    onClick={() => setEditMode(true)}
                    disabled={processing || status === 'RECEIVED' || status === 'CANCELLED'}
                    className="text-gray-500 hover:text-blue-600 p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={status === 'RECEIVED' ? 'Cannot edit received orders' : 'Edit status'}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={deleteOrder}
                    disabled={processing}
                    className="text-gray-500 hover:text-red-600 p-2 disabled:opacity-50"
                    title="Delete order"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {status !== 'RECEIVED' && status !== 'CANCELLED' && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-blue-600" size={20} />
                <span className="text-blue-800">
                  {status === 'DRAFT' && 'Ready to place this order?'}
                  {status === 'ORDERED' && 'Have you received these items?'}
                </span>
              </div>
              <div className="flex gap-2">
                {status === 'DRAFT' && (
                  <button
                    onClick={() => updateStatus('ORDERED')}
                    disabled={processing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Truck size={18} />
                    Mark as Ordered
                  </button>
                )}
                {status === 'ORDERED' && (
                  <button
                    onClick={() => updateStatus('RECEIVED')}
                    disabled={processing}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Receive Order & Update Inventory
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Order Items</h2>
          </div>
          
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item: any) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-6 py-4">
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-gray-500">{item.product?.code}</p>
                  </td>
                  <td className="px-6 py-4 text-right">{item.quantity}</td>
                  <td className="px-6 py-4 text-right">{formatINR(item.unitPrice)}</td>
                  <td className="px-6 py-4 text-right font-medium">
                    {formatINR(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-semibold">Total:</td>
                <td className="px-6 py-4 text-right font-bold text-lg">
                  {formatINR(calculateTotal())}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Status Information */}
        {status === 'RECEIVED' && (
          <div className="mt-6 bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle size={20} />
              <span className="font-medium">Order Received</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Inventory has been updated. All items have been added to stock.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
