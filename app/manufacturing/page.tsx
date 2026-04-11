'use client'

import { useState, useEffect } from 'react'
import { Factory, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function ManufacturingPage() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/manufacturing/batches')
      .then(res => res.json())
      .then(data => {
        setBatches(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'PLANNED': return { bg: '#e3f2fd', color: '#1565c0', icon: <Clock size={16} />, text: 'Planned' }
      case 'IN_PROGRESS': return { bg: '#fff3e0', color: '#e65100', icon: <AlertCircle size={16} />, text: 'In Progress' }
      case 'COMPLETED': return { bg: '#e8f5e9', color: '#2e7d32', icon: <CheckCircle size={16} />, text: 'Completed' }
      default: return { bg: '#f5f5f5', color: '#666', icon: null, text: status }
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Factory size={32} /> Manufacturing (WIP) Tracking
      </h1>

      {loading ? (
        <p>Loading batches...</p>
      ) : batches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '8px' }}>
          <Factory size={48} color="#ccc" />
          <p style={{ marginTop: '20px', color: '#666' }}>No manufacturing batches yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {batches.map((batch: any) => {
            const statusStyle = getStatusStyle(batch.status)
            return (
              <div key={batch.id} style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
                      Batch #{batch.batchNumber}
                    </h3>
                    <p style={{ color: '#666' }}>
                      Output: {batch.outputProduct?.name} × {batch.outputQuantity} units
                    </p>
                  </div>
                  <span style={{ 
                    background: statusStyle.bg, 
                    color: statusStyle.color, 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {statusStyle.icon} {statusStyle.text}
                  </span>
                </div>

                {batch.consumptions?.length > 0 && (
                  <div style={{ marginTop: '15px', padding: '15px', background: '#f9f9f9', borderRadius: '6px' }}>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Raw Materials Consumed:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {batch.consumptions.map((c: any, i: number) => (
                        <span key={i} style={{ background: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', border: '1px solid #ddd' }}>
                          {c.material?.name}: {c.quantityUsed} kg
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '15px', fontSize: '13px', color: '#999' }}>
                  Created: {new Date(batch.createdAt).toLocaleDateString()}
                  {batch.completedAt && ` • Completed: ${new Date(batch.completedAt).toLocaleDateString()}`}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}