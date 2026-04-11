import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    const lowerQuery = query.toLowerCase()
    
    let products = await prisma.product.findMany()
    
    // AI-like smart filtering based on natural language
    if (lowerQuery.includes('low stock') || lowerQuery.includes('running low')) {
      products = products.filter(p => p.quantity < 10 && p.quantity > 0)
    } else if (lowerQuery.includes('out of stock') || lowerQuery.includes('no stock')) {
      products = products.filter(p => p.quantity === 0)
    } else if (lowerQuery.includes('raw material')) {
      products = products.filter(p => p.isRawMaterial)
    } else if (lowerQuery.includes('finished good') || lowerQuery.includes('finished product')) {
      products = products.filter(p => p.isFinishedGood)
    } else if (lowerQuery.includes('under') || lowerQuery.includes('less than')) {
      const numberMatch = lowerQuery.match(/\d+/)
      if (numberMatch) {
        const threshold = parseInt(numberMatch[0])
        products = products.filter(p => p.quantity < threshold)
      }
    } else if (lowerQuery.includes('over') || lowerQuery.includes('more than')) {
      const numberMatch = lowerQuery.match(/\d+/)
      if (numberMatch) {
        const threshold = parseInt(numberMatch[0])
        products = products.filter(p => p.quantity > threshold)
      }
    } else if (lowerQuery.includes('expensive') || lowerQuery.includes('high price')) {
      products = products.filter(p => p.price > 100)
    } else if (lowerQuery.includes('cheap') || lowerQuery.includes('low price')) {
      products = products.filter(p => p.price < 50)
    } else {
      // Default search
      products = products.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.code.toLowerCase().includes(lowerQuery)
      )
    }
    
    return NextResponse.json({ products })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ products: [] })
  }
}
