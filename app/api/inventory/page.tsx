'use client'

import { useState, useEffect } from 'react'
import { Package, Search, Plus, Minus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  code: string
  name: string
  description: string | null
  weight: number
  price: number
  quantity: number
  lastUpdated: string
  isRawMaterial: boolean
  isFinishedGood: boolean
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'raw' | 'finished'>('all')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products/all')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
                          (filter === 'raw' && p.isRawMaterial) ||
                          (filter === 'finished' && p.isFinishedGood)
    return matchesSearch && matchesFilter
  })

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    if (quantity < 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <Link href="/inventory/new">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Total Products</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Raw Materials</p>
            <p className="text-2xl font-bold">{products.filter(p => p.isRawMaterial).length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Finished Goods</p>
            <p className="text-2xl font-bold">{products.filter(p => p.isFinishedGood).length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-gray-600">Low Stock Items</p>
            <p className="text-2xl font-bold text-yellow-600">{products.filter(p => p.quantity < 10 && p.quantity > 0).length}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or code..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border rounded-lg px-4 py-2"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">All Products</option>
              <option value="raw">Raw Materials</option>
              <option value="finished">Finished Goods</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading products...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price (₹)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.quantity)
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">{product.code}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-gray-500">{product.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {product.isRawMaterial ? (
                          <span className="text-blue-600">Raw Material</span>
                        ) : product.isFinishedGood ? (
                          <span className="text-green-600">Finished Good</span>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">{product.weight.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-right">₹{product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium">{product.quantity}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}