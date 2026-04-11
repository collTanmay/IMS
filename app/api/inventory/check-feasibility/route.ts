import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, requestedQuantity } = body;

    if (!productId || !requestedQuantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        billOfMaterials: {
          include: {
            rawMaterial: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const currentStock = product.quantity;
    const shortage = requestedQuantity - currentStock;

    if (shortage <= 0) {
      return NextResponse.json({
        status: "GREEN",
        message: `Ready to ship. ${currentStock} units available in warehouse.`,
        canFulfill: true,
        requiresManufacturing: false,
        rawMaterialsNeeded: [],
      });
    }

    const rawMaterialsNeeded = product.billOfMaterials.map(
      (bom: any) => ({
        materialId: bom.rawMaterialId,
        materialName: bom.rawMaterial.name,
        requiredPerUnit: bom.quantityRequired,
        totalRequired: bom.quantityRequired * shortage,
        available: bom.rawMaterial.quantity,
      })
    );

    const bottlenecks = rawMaterialsNeeded.filter(
      (item: any) => item.available < item.totalRequired
    );

    if (bottlenecks.length > 0) {
      const bottleneckList = bottlenecks
        .map(
          (b: any) =>
            `${b.materialName} (Need: ${b.totalRequired.toFixed(2)}, Have: ${b.available})`
        )
        .join(", ");

      return NextResponse.json({
        status: "RED",
        message: `Cannot fulfill order. Raw material shortfall: ${bottleneckList}`,
        canFulfill: false,
        requiresManufacturing: true,
        rawMaterialsNeeded,
        bottlenecks,
      });
    }

    const totalWeightConsumption = rawMaterialsNeeded.reduce(
      (sum: number, item: any) => sum + item.totalRequired,
      0
    );

    return NextResponse.json({
      status: "YELLOW",
      message: `Can fulfill via manufacturing. Will consume ${totalWeightConsumption.toFixed(2)} kg of raw materials.`,
      canFulfill: true,
      requiresManufacturing: true,
      rawMaterialsNeeded,
      shortage,
    });
  } catch (error) {
    console.error("Feasibility check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}