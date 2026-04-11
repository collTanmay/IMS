import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const batches = await prisma.manufacturingBatch.findMany({
      include: {
        outputProduct: true,
        consumptions: { include: { material: true } }
      }
    })
    return NextResponse.json(batches)
  } catch (error) {
    return NextResponse.json([], { status: 500 })
  }
}
