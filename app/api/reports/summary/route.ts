import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany()
    const salesOrders = await prisma.salesOrder.count()
    const batches = await prisma.manufacturingBatch.count()
    const movements = await prisma.stockMovementLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: { product: true }
    })

    return NextResponse.json({
      totalProducts: products.length,
      totalSalesOrders: salesOrders,
      totalManufacturingBatches: batches,
      lowStockCount: products.filter(p => p.quantity < 10 && p.quantity > 0).length,
      totalInventoryValue: products.reduce((sum, p) => sum + (p.quantity * p.price), 0),
      recentTransactions: movements.map(m => ({
        id: m.id,
        type: m.reason,
        product: m.product.name,
        quantity: m.changeAmount,
        date: m.timestamp
      }))
    })
  } catch (error) {
    return NextResponse.json({
      totalProducts: 0,
      totalSalesOrders: 0,
      totalManufacturingBatches: 0,
      lowStockCount: 0,
      totalInventoryValue: 0,
      recentTransactions: []
    })
  }
}
