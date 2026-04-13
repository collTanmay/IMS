'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Package, Truck, CheckCircle, Clock, ChevronDown } from 'lucide-react'

interface SalesOrder {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  items: any[]
}

export default function SalesOrdersListPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'QUOTATION' | 'PACKING' | 'DISPATCHED'>('ALL')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/sales-orders?page=${page}&limit=20`)
        const result = await res.json()
        
        if (page === 1) {
          setOrders(result.data || [])
          setSelectedOrder((result.data || [])[0] || null)
        } else {
          setOrders(prev => [...prev, ...(result.data || [])])
        }
        
        if (result.pagination) {
          setTotalPages(result.pagination.pages)
          setHasMore(page < result.pagination.pages)
        }
      } catch (error) {
        console.error('Error fetching sales orders:', error)
        __fetchOrdersSync()
      } finally {
        setLoading(false)
      }
    }

    const __fetchOrdersSync = async () => {
      try {
        const res = await fetch('/api/sales-orders')
        const data = await res.json()
        const orderList = Array.isArray(data) ? data : data.data || []
        setOrders(orderList)
        if (orderList.length > 0) setSelectedOrder(orderList[0])
      } catch (e) {
        console.error('Fallback fetch failed:', e)
      }
    }

    fetchOrders()
  }, [page])

  const filteredOrders = orders.filter((o: SalesOrder) => {
    const matchesSearch = o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = statusFilter === 'ALL' || o.status === statusFilter
    return matchesSearch && matchesFilter
  })

  const formatINR = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

  const getStatusBadge = (status: string) => {
    const styles = {
      QUOTATION: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: 'Quotation' },
      PACKING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Package, label: 'Packing' },
      DISPATCHED: { bg: 'bg-green-100', text: 'text-green-800', icon: Truck, label: 'Dispatched' },
      COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle, label: 'Completed' }
    }
    return styles[status as keyof typeof styles] || styles.QUOTATION!
  }

  const StatusIcon = (statusStyle: any) => statusStyle.icon ? statusStyle.icon : null

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      QUOTATION: 'PACKING',
      PACKING: 'DISPATCHED',
      DISPATCHED: 'COMPLETED',
      COMPLETED: 'COMPLETED'
    }
    return statusFlow[currentStatus as keyof typeof statusFlow] || currentStatus
  }

  const moveToNextStage = async () => {
    if (!selectedOrder) return
    
    const nextStatus = getNextStatus(selectedOrder.status)
    try {
      const res = await fetch(`/api/sales-orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      })
      
      if (res.ok) {
        const updatedOrder = { ...selectedOrder, status: nextStatus }
        setSelectedOrder(updatedOrder)
        setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o))
      }
    } catch (error) {
      console.error('Failed to update order:', error)
      alert('Failed to update order status')
    }
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <div className="w-96 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Sales Orders</h2>
            <Link href="/sales-orders/new">
              <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus size={18} />
              </button>
            </Link>
          </div>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-1">
            {['ALL', 'QUOTATION', 'PACKING', 'DISPATCHED'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as 'ALL' | 'QUOTATION' | 'PACKING' | 'DISPATCHED')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  statusFilter === status 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && page === 1 ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No orders found</div>
          ) : (
            <>
              {filteredOrders.map((order) => {
                const statusStyle = getStatusBadge(order.status)
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedOrder?.id === order.id 
                        ? 'bg-blue-50 border-l-4 border-l-blue-600' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-sm font-semibold">{order.orderNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text}`}>
                        <StatusIcon statusStyle={statusStyle} />
                        {statusStyle.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} items
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )
              })}
              {hasMore && (
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading}
                  className="w-full p-3 text-center text-blue-600 hover:bg-blue-50 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ChevronDown size={16} />
                  {loading ? 'Loading...' : 'Load more'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {selectedOrder ? (
          <div className="max-w-3xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedOrder.orderNumber}</h1>
                <p className="text-gray-500">
                  Created: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={moveToNextStage}
                  disabled={selectedOrder.status === 'COMPLETED'}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Move to {getNextStatus(selectedOrder.status)}
                </button>
                <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Edit
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">Current Status</p>
              {(() => {
                const statusStyle = getStatusBadge(selectedOrder.status)
                return (
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                    <StatusIcon statusStyle={statusStyle} />
                    {statusStyle.label}
                  </span>
                )
              })()}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Order Items</h3>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Unit Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item: any) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-3">{item.product?.name}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">{formatINR(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatINR(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold">Total:</td>
                    <td className="px-4 py-3 text-right font-bold">
                      {formatINR(selectedOrder.items?.reduce((sum: number, i: any) => sum + (i.quantity * i.unitPrice), 0) || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Select an order to view details</p>
          </div>
        )}
      </div>
    </div>
  )
}