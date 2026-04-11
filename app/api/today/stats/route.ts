import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const [orders, batches, shipments] = await Promise.all([
      prisma.salesOrder.count({
        where: { createdAt: { gte: today } }
      }),
      prisma.manufacturingBatch.count({
        where: { createdAt: { gte: today } }
      }),
      prisma.salesOrder.count({
        where: { 
          status: 'DISPATCHED',
          updatedAt: { gte: today }
        }
      })
    ])
    
    return NextResponse.json({ orders, batches, shipments })
  } catch (error) {
    return NextResponse.json({ orders: 0, batches: 0, shipments: 0 })
  }
}
