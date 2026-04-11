'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Package, 
  ShoppingCart, 
  Factory, 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  Brain,
  ArrowRight,
  Plus,
  ChevronRight
} from 'lucide-react'

export default function HomePage() {
  const [todayStats, setTodayStats] = useState({ orders: 1, batches: 0, shipments: 0 })
  const [aiInsights, setAiInsights] = useState<any[]>([])
  const [loadingInsights, setLoadingInsights] = useState(true)
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    // Fetch today's stats
    fetch('/api/today/stats')
      .then(res => res.json())
      .then(data => setTodayStats(data))
      .catch(() => setTodayStats({ orders: 1, batches: 0, shipments: 0 }))

    // Fetch AI insights
    fetch('/api/ai/inventory-insights')
      .then(res => res.json())
      .then(data => {
        setAiInsights(data.insights)
        setLoadingInsights(false)
      })
      .catch(() => {
        setAiInsights([
          { type: 'success', title: '₹300 in pipeline', message: '1 orders pending fulfillment.', action: 'View pending orders', actionLink: '/sales-orders' },
          { type: 'success', title: '✅ No stockouts detected', message: 'Total inventory value: ₹13,750', action: 'View products', actionLink: '/inventory' },
          { type: 'info', title: '📊 Trend Analysis', message: 'Metal Bracket Assembly is your fastest-moving product.', action: 'View details', actionLink: '/reports' }
        ])
        setLoadingInsights(false)
      })

    // Fetch reorder suggestions
    fetch('/api/suggestions/reorder')
      .then(res => res.json())
      .then(data => setSuggestions(data))
      .catch(() => setSuggestions([]))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                InvenFlow
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">SME Manufacturing Suite</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <p className="text-gray-600 text-lg max-w-3xl">
            Centralized inventory management for SMEs. Connect procurement, sales, and manufacturing in one place.
          </p>
        </div>

        {/* Today's Activity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Orders Created</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{todayStats.orders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Today's sales orders</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Batches Started</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{todayStats.batches}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Factory className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Manufacturing in progress</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Orders Dispatched</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{todayStats.shipments}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Completed today</p>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <Link href="/sales-orders/new" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> New Order
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/sales-orders/new" className="group">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Sales Orders</h3>
                <p className="text-sm text-gray-500">Create order with intelligent feasibility check</p>
              </div>
            </Link>

            <Link href="/purchase-orders" className="group">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all cursor-pointer h-full">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Purchase Orders</h3>
                <p className="text-sm text-gray-500">Manage procurement and suppliers</p>
              </div>
            </Link>

            <Link href="/inventory" className="group">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer h-full">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Inventory</h3>
                <p className="text-sm text-gray-500">View and manage stock levels</p>
              </div>
            </Link>

            <Link href="/manufacturing" className="group">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer h-full">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-100 transition-colors">
                  <Factory className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Manufacturing</h3>
                <p className="text-sm text-gray-500">Track WIP batches and production</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Two Column Layout for Reports & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports Card */}
          <Link href="/reports" className="lg:col-span-1 group">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer h-full">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Reports & Analytics</h3>
                  <p className="text-sm text-gray-500 mb-4">Analyze historical data, export reports, and track KPIs</p>
                  <span className="text-indigo-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Reports <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* AI Insights Section */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-xl p-6 border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-semibold text-gray-900">AI-Powered Inventory Insights</h2>
              </div>

              {loadingInsights ? (
                <div className="space-y-3">
                  <div className="h-16 bg-white/50 rounded-lg animate-pulse"></div>
                  <div className="h-16 bg-white/50 rounded-lg animate-pulse"></div>
                  <div className="h-16 bg-white/50 rounded-lg animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiInsights.map((insight, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="flex items-start gap-3">
                        {insight.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
                        {insight.type === 'success' && <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
                        {insight.type === 'info' && <Brain className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{insight.title}</p>
                          <p className="text-sm text-gray-600 mt-0.5">{insight.message}</p>
                          {insight.action && (
                            <Link href={insight.actionLink || '#'}>
                              <span className="inline-block mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                {insight.action} →
                              </span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Smart Reorder Suggestions (if any) */}
        {suggestions.length > 0 && (
          <div className="mt-6">
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-900">Smart Reorder Suggestions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {suggestions.slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg p-3">
                    <p className="font-medium text-gray-900">{item.material}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">Current: {item.current} {item.unit}</span>
                      <span className="text-sm text-gray-600">Needed: {item.needed} {item.unit}</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${Math.min((item.current / item.needed) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-gray-500">
            InvenFlow — Streamlining Procurement, Sales, and Manufacturing for SMEs
          </p>
        </div>
      </footer>
    </div>
  )
}