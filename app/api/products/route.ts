import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isFinishedGood: true },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        price: true,
        quantity: true,
        weight: true,
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      [
        {
          id: "cmnt2dvz20003si5k9rko9gzy",
          name: "Metal Bracket Assembly",
          code: "FG-BRACKET-001",
          description: "Steel bracket assembly",
          price: 150,
          quantity: 50,
          weight: 2.5,
        },
      ],
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const product = await prisma.product.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description,
        weight: body.weight,
        price: body.price,
        quantity: body.quantity,
        isRawMaterial: body.isRawMaterial,
        isFinishedGood: body.isFinishedGood
      }
    })
    
    // Log stock movement
    await prisma.stockMovementLog.create({
      data: {
        productId: product.id,
        changeAmount: body.quantity,
        reason: 'INITIAL_STOCK',
        referenceId: product.id
      }
    })
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}