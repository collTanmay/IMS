import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single purchase order
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: { product: true }
        }
      }
    })
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    return NextResponse.json(order)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

// PATCH update order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    
    const order = await prisma.purchaseOrder.update({
      where: { id: params.id },
      data: {
        status: body.status,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json(order)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

// DELETE purchase order
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.purchaseOrder.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
