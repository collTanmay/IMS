'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [generatingDesc, setGeneratingDesc] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    weight: '',
    price: '',
    quantity: '',
    isRawMaterial: false,
    isFinishedGood: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          weight: parseFloat(formData.weight),
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity)
        })
      })
      
      if (res.ok) {
        router.push('/inventory')
      } else {
        alert('Failed to create product')
      }
    } catch (error) {
      console.error(error)
      alert('Error creating product')
    } finally {
      setLoading(false)
    }
  }

  const generateDescription = async () => {
    if (!formData.name) {
      alert('Please enter product name first')
      return
    }
    
    setGeneratingDesc(true)
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productName: formData.name,
          type: formData.isRawMaterial ? 'raw material' : 'finished good'
        })
      })
      
      const data = await res.json()
      setFormData({...formData, description: data.description})
    } catch (error) {
      console.error(error)
      alert('Failed to generate description')
    } finally {
      setGeneratingDesc(false)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <Link href="/inventory" style={{ textDecoration: 'none', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={20} /> Back to Inventory
        </Link>
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px' }}>➕ Add New Product</h1>

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Product Code *</label>
          <input
            type="text"
            required
            placeholder="e.g., FG-BRACKET-001"
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Product Name *</label>
          <input
            type="text"
            required
            placeholder="e.g., Metal Bracket Assembly"
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
          <div style={{ position: 'relative' }}>
            <textarea
              placeholder="Product description..."
              style={{ width: '100%', padding: '12px', paddingRight: '120px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', minHeight: '80px' }}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            <button
              type="button"
              onClick={generateDescription}
              disabled={generatingDesc}
              style={{
                position: 'absolute',
                right: '8px',
                top: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {generatingDesc ? (
                <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
              ) : (
                <><Sparkles size={14} /> AI Generate</>
              )}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Weight (kg) *</label>
            <input
              type="number"
              required
              step="0.01"
              placeholder="0.00"
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Price (₹) *</label>
            <input
              type="number"
              required
              step="0.01"
              placeholder="0.00"
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Initial Quantity *</label>
          <input
            type="number"
            required
            placeholder="0"
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px' }}
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
          />
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={formData.isRawMaterial}
              onChange={(e) => setFormData({...formData, isRawMaterial: e.target.checked})}
            />
            <span>Raw Material (can be consumed in manufacturing)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={formData.isFinishedGood}
              onChange={(e) => setFormData({...formData, isFinishedGood: e.target.checked})}
            />
            <span>Finished Good (can be sold)</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{ 
              background: '#2563eb', 
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
            {loading ? 'Creating...' : 'Create Product'}
          </button>
          <Link href="/inventory">
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
