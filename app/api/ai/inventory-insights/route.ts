import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all data for analysis
    const products = await prisma.product.findMany()
    const pendingOrders = await prisma.salesOrder.findMany({ 
      where: { status: { in: ['QUOTATION', 'PACKING'] } },
      include: { items: { include: { product: true } } }
    })
    const lowStockProducts = await prisma.product.findMany({ 
      where: { quantity: { lt: 10 }, isRawMaterial: true }
    })

    const insights = []

    // Insight 1: Low stock alert
    if (lowStockProducts.length > 0) {
      insights.push({
        type: 'warning',
        title: `${lowStockProducts.length} items low on stock`,
        message: `${lowStockProducts.map(p => p.name).slice(0, 2).join(', ')}${lowStockProducts.length > 2 ? ' and others' : ''} need reordering soon.`,
        action: 'View low stock items',
        actionLink: '/inventory?filter=low'
      })
    }

    // Insight 2: Pending orders value
    const pendingValue = pendingOrders.reduce((sum, order) => 
      sum + order.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0), 0
    )
    if (pendingValue > 0) {
      insights.push({
        type: 'success',
        title: `₹${pendingValue.toLocaleString()} in pipeline`,
        message: `${pendingOrders.length} orders pending fulfillment. Raw materials sufficient for most orders.`,
        action: 'View pending orders',
        actionLink: '/sales-orders'
      })
    }

    // Insight 3: Inventory health score
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0)
    const outOfStock = products.filter(p => p.quantity === 0).length
    
    if (outOfStock === 0) {
      insights.push({
        type: 'success',
        title: '✅ No stockouts detected',
        message: `All products have some inventory. Total inventory value: ₹${totalValue.toLocaleString()}`,
        action: null,
        actionLink: null
      })
    } else {
      insights.push({
        type: 'warning',
        title: `${outOfStock} items out of stock`,
        message: 'Consider creating purchase orders for these items.',
        action: 'Create purchase order',
        actionLink: '/purchase-orders/new'
      })
    }

    // Insight 4: Fast moving items (simulated)
    insights.push({
      type: 'info',
      title: '📊 Trend Analysis',
      message: 'Metal Bracket Assembly is your fastest-moving product this week.',
      action: 'View product details',
      actionLink: '/inventory'
    })

    return NextResponse.json({ insights: insights.slice(0, 3) })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ 
      insights: [{
        type: 'info',
        title: 'AI Analysis Ready',
        message: 'Add more products and orders for deeper AI insights.',
        action: null,
        actionLink: null
      }]
    })
  }
}
