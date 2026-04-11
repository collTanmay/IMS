import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.purchaseOrder.count()
    ])
    
    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    })
  } catch (error) {
    console.error('Error fetching purchase orders:', error)
    return NextResponse.json({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 }
    }, { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const order = await prisma.purchaseOrder.create({
      data: {
        orderNumber: `PO-${Date.now()}`,
        status: 'DRAFT',
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }))
        }
      },
      include: { items: true }
    })
    
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating purchase order:', error)
    return NextResponse.json({ error: 'Failed to create PO' }, { status: 500 })
  }
}
