import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const customer = await prisma.customer.findUnique({
      where: { id }
    })

    if (!customer) {
      // Try searching by code as fallback
      const customerByCode = await prisma.customer.findUnique({
        where: { code: id }
      })
      
      if (!customerByCode) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
      
      return NextResponse.json(customerByCode)
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Failed to fetch customer:', error)
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const customer = await prisma.customer.update({
      where: { id },
      data: body
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Failed to update customer:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.customer.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete customer:', error)
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}
