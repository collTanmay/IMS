import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const batches = await prisma.manufacturingBatch.findMany({
      include: {
        outputProduct: { select: { name: true, code: true } },
        consumptions: {
          include: {
            material: { select: { name: true, code: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(batches)
  } catch (error) {
    console.error('Failed to fetch batches:', error)
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 })
  }
}