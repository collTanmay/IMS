'use client'

import { useState } from 'react'
import { Plus, ShoppingCart, Package, Factory, X } from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50 }}>
      {isOpen && (
        <div style={{ position: 'absolute', bottom: '64px', right: '0', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href="/sales-orders/new">
            <button style={{ background: '#2563eb', color: 'white', padding: '12px', borderRadius: '9999px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
              <ShoppingCart size={20} />
              <span style={{ paddingRight: '8px' }}>New Sales Order</span>
            </button>
          </Link>
          <Link href="/purchase-orders/new">
            <button style={{ background: '#16a34a', color: 'white', padding: '12px', borderRadius: '9999px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
              <Package size={20} />
              <span style={{ paddingRight: '8px' }}>New Purchase Order</span>
            </button>
          </Link>
          <Link href="/manufacturing/new">
            <button style={{ background: '#ea580c', color: 'white', padding: '12px', borderRadius: '9999px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
              <Factory size={20} />
              <span style={{ paddingRight: '8px' }}>New Batch</span>
            </button>
          </Link>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: '#1f2937', color: 'white', padding: '16px', borderRadius: '9999px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: 'none', cursor: 'pointer' }}
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  )
}
