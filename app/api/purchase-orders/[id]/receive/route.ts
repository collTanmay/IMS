import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get the purchase order with items
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true }
        }
      }
    })
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Update inventory for each item
    for (const item of order.items) {
      // Increase product quantity
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            increment: item.quantity
          }
        }
      })
      
      // Log stock movement
      await prisma.stockMovementLog.create({
        data: {
          productId: item.productId,
          changeAmount: item.quantity,
          reason: 'PURCHASE_RECEIVED',
          referenceId: order.id
        }
      })
    }
    
    // Update order status to RECEIVED
    await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: 'RECEIVED',
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({ success: true, message: 'Inventory updated successfully' })
  } catch (error) {
    console.error('Failed to receive order:', error)
    return NextResponse.json({ error: 'Failed to process receipt' }, { status: 500 })
  }
}
