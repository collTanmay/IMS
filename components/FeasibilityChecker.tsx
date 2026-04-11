'use client'

import { useState } from 'react'
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

interface FeasibilityCheckerProps {
  productId: string
  productName: string
  requestedQuantity: number
  onConfirm?: () => void
}

export function FeasibilityChecker({ 
  productId, 
  productName, 
  requestedQuantity,
  onConfirm 
}: FeasibilityCheckerProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showResult, setShowResult] = useState(false)

  const checkFeasibility = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/inventory/check-feasibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, requestedQuantity })
      })
      
      const data = await response.json()
      setResult(data)
      setShowResult(true)
    } catch (error) {
      console.error('Check failed:', error)
      alert('Failed to check feasibility')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = () => {
    if (!result) return 'bg-gray-50 border-gray-200'
    switch (result.status) {
      case 'GREEN': return 'bg-green-50 border-green-500'
      case 'YELLOW': return 'bg-yellow-50 border-yellow-500'
      case 'RED': return 'bg-red-50 border-red-500'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = () => {
    if (!result) return null
    switch (result.status) {
      case 'GREEN': return <CheckCircle2 className="w-8 h-8 text-green-600" />
      case 'YELLOW': return <AlertTriangle className="w-8 h-8 text-yellow-600" />
      case 'RED': return <XCircle className="w-8 h-8 text-red-600" />
      default: return null
    }
  }

  return (
    <div>
      <button
        onClick={checkFeasibility}
        disabled={loading || !requestedQuantity}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        Check Impact
      </button>

      {showResult && result && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowResult(false)}>
          <div className={`max-w-lg w-full mx-4 p-6 rounded-lg border-l-4 bg-white ${getStatusColor()}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              {getStatusIcon()}
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  {productName} × {requestedQuantity} units
                </h3>
                <p className="text-gray-700 mb-4">{result.message}</p>
                
                {result.rawMaterialsNeeded?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Materials Required:</h4>
                    {result.rawMaterialsNeeded.map((m: any, i: number) => (
                      <div key={i} className="text-sm flex justify-between py-1">
                        <span>{m.materialName}</span>
                        <span className={m.available < m.totalRequired ? 'text-red-600' : 'text-green-600'}>
                          {m.totalRequired.toFixed(2)} / {m.available} kg
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResult(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {result.canFulfill && (
                    <button
                      onClick={() => {
                        onConfirm?.()
                        setShowResult(false)
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Confirm Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}