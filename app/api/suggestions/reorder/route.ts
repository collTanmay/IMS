import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all raw materials
    const rawMaterials = await prisma.product.findMany({
      where: { isRawMaterial: true },
      select: { id: true, name: true, quantity: true, code: true }
    })

    // Get pending sales orders with BOM requirements
    const pendingOrders = await prisma.salesOrder.findMany({
      where: { status: { in: ['QUOTATION', 'PACKING'] } },
      include: {
        items: {
          include: {
            product: {
              include: {
                billOfMaterials: {
                  include: { rawMaterial: true }
                }
              }
            }
          }
        }
      }
    })

    // Calculate material needs
    const materialNeeds: any = {}
    
    pendingOrders.forEach(order => {
      order.items.forEach(item => {
        const shortage = item.quantity - item.product.quantity
        if (shortage > 0) {
          item.product.billOfMaterials.forEach(bom => {
            const materialId = bom.rawMaterialId
            const needed = bom.quantityRequired * shortage
            materialNeeds[materialId] = (materialNeeds[materialId] || 0) + needed
          })
        }
      })
    })

    // Format suggestions
    const suggestions = rawMaterials
      .map(material => ({
        material: material.name,
        current: material.quantity,
        needed: materialNeeds[material.id] || 0,
        unit: 'units'
      }))
      .filter(s => s.needed > 0)
      .slice(0, 3)

    return NextResponse.json(suggestions)
  } catch (error) {
    return NextResponse.json([])
  }
}
