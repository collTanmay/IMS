import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')
  
  // Clear existing data (in correct order due to foreign keys)
  console.log('Clearing existing data...')
  await prisma.stockMovementLog.deleteMany({})
  await prisma.manufacturingConsumption.deleteMany({})
  await prisma.manufacturingBatch.deleteMany({})
  await prisma.salesOrderItem.deleteMany({})
  await prisma.salesOrder.deleteMany({})
  await prisma.purchaseOrderItem.deleteMany({})
  await prisma.purchaseOrder.deleteMany({})
  await prisma.customer.deleteMany({})
  await prisma.bOMItem.deleteMany({})
  await prisma.product.deleteMany({})
  
  console.log('✅ Cleared existing data')

  // Create Sample Customers
  const customer1 = await prisma.customer.create({
    data: {
      code: 'CUST-001',
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      phone: '+1-800-123-4567',
      address: '123 Industrial Blvd, New York, NY 10001'
    }
  })
  console.log(`👤 Created: ${customer1.name} (ID: ${customer1.id}, Code: ${customer1.code})`)

  const customer2 = await prisma.customer.create({
    data: {
      code: 'CUST-002',
      name: 'Global Industries Ltd',
      email: 'sales@global.com',
      phone: '+44-20-7946-0958',
      address: '456 Trade Center, London, UK'
    }
  })
  console.log(`👤 Created: ${customer2.name} (ID: ${customer2.id}, Code: ${customer2.code})`)

  const customer3 = await prisma.customer.create({
    data: {
      code: 'CUST-003',
      name: 'Premium Manufacturing Co',
      email: 'orders@premium-mfg.com',
      phone: '+91-22-1234-5678',
      address: '789 Factory Lane, Mumbai, India'
    }
  })
  console.log(`👤 Created: ${customer3.name} (ID: ${customer3.id}, Code: ${customer3.code})`)

  console.log('✅ Created sample customers')

  // Create Raw Materials
  const aluminumSheet = await prisma.product.create({
    data: {
      code: 'RAW-ALUM-001',
      name: 'Aluminum Sheet',
      description: '2mm thick aluminum sheet for bracket manufacturing',
      weight: 2.5,
      price: 50.0,
      quantity: 100,
      isRawMaterial: true,
      isFinishedGood: false,
    }
  })
  console.log(`📦 Created: ${aluminumSheet.name} (ID: ${aluminumSheet.id})`)
  
  const steelRod = await prisma.product.create({
    data: {
      code: 'RAW-STEEL-001',
      name: 'Steel Rod',
      description: '10mm diameter steel rod',
      weight: 1.8,
      price: 30.0,
      quantity: 200,
      isRawMaterial: true,
      isFinishedGood: false,
    }
  })
  console.log(`📦 Created: ${steelRod.name} (ID: ${steelRod.id})`)
  
  const screws = await prisma.product.create({
    data: {
      code: 'RAW-SCREW-001',
      name: 'Steel Screws (Box of 100)',
      description: 'M4 x 10mm steel screws',
      weight: 0.1,
      price: 5.0,
      quantity: 50,
      isRawMaterial: true,
      isFinishedGood: false,
    }
  })
  console.log(`📦 Created: ${screws.name} (ID: ${screws.id})`)
  
  // Create Finished Goods
  const metalBracket = await prisma.product.create({
    data: {
      code: 'FG-BRACKET-001',
      name: 'Metal Bracket Assembly',
      description: 'Heavy-duty mounting bracket for industrial use',
      weight: 0.5,
      price: 150.0,
      quantity: 10,
      isRawMaterial: false,
      isFinishedGood: true,
    }
  })
  console.log(`📦 Created: ${metalBracket.name} (ID: ${metalBracket.id})`)
  
  const wallMount = await prisma.product.create({
    data: {
      code: 'FG-MOUNT-001',
      name: 'Wall Mount Plate',
      description: 'Standard wall mount plate for TV/monitor',
      weight: 0.8,
      price: 200.0,
      quantity: 5,
      isRawMaterial: false,
      isFinishedGood: true,
    }
  })
  console.log(`📦 Created: ${wallMount.name} (ID: ${wallMount.id})`)
  
  // Create BOM for Metal Bracket
  await prisma.bOMItem.createMany({
    data: [
      {
        finishedGoodId: metalBracket.id,
        rawMaterialId: aluminumSheet.id,
        quantityRequired: 0.2,
      },
      {
        finishedGoodId: metalBracket.id,
        rawMaterialId: steelRod.id,
        quantityRequired: 0.1,
      },
      {
        finishedGoodId: metalBracket.id,
        rawMaterialId: screws.id,
        quantityRequired: 0.04,
      }
    ]
  })
  console.log('🔗 Created BOM for Metal Bracket')
  
  // Create BOM for Wall Mount
  await prisma.bOMItem.createMany({
    data: [
      {
        finishedGoodId: wallMount.id,
        rawMaterialId: aluminumSheet.id,
        quantityRequired: 0.5,
      },
      {
        finishedGoodId: wallMount.id,
        rawMaterialId: screws.id,
        quantityRequired: 0.06,
      }
    ]
  })
  console.log('🔗 Created BOM for Wall Mount')
  
  // Create Sample Sales Order
  const salesOrder = await prisma.salesOrder.create({
    data: {
      orderNumber: 'SO-2024-001',
      status: 'QUOTATION',
      items: {
        create: {
          productId: metalBracket.id,
          quantity: 2,
          unitPrice: metalBracket.price,
        }
      }
    }
  })
  console.log(`📋 Created Sample Sales Order: ${salesOrder.orderNumber}`)
  
  // Create Sample Purchase Order
  const purchaseOrder = await prisma.purchaseOrder.create({
    data: {
      orderNumber: 'PO-2024-001',
      status: 'ORDERED',
      items: {
        create: {
          productId: aluminumSheet.id,
          quantity: 50,
          unitPrice: aluminumSheet.price,
        }
      }
    }
  })
  console.log(`📋 Created Sample Purchase Order: ${purchaseOrder.orderNumber}`)
  
  // Create Sample Manufacturing Batch
  const batch = await prisma.manufacturingBatch.create({
    data: {
      batchNumber: 'MFG-2024-001',
      outputProductId: metalBracket.id,
      outputQuantity: 5,
      status: 'IN_PROGRESS',
    }
  })
  
  await prisma.manufacturingConsumption.createMany({
    data: [
      {
        batchId: batch.id,
        materialId: aluminumSheet.id,
        quantityUsed: 1.0,
      },
      {
        batchId: batch.id,
        materialId: steelRod.id,
        quantityUsed: 0.5,
      },
      {
        batchId: batch.id,
        materialId: screws.id,
        quantityUsed: 0.2,
      }
    ]
  })
  console.log(`🏭 Created Sample Manufacturing Batch: ${batch.batchNumber}`)
  
  // Log stock movements
  await prisma.stockMovementLog.createMany({
    data: [
      {
        productId: metalBracket.id,
        changeAmount: 10,
        reason: 'INITIAL_STOCK',
        referenceId: 'SEED',
      },
      {
        productId: aluminumSheet.id,
        changeAmount: 100,
        reason: 'INITIAL_STOCK',
        referenceId: 'SEED',
      },
      {
        productId: steelRod.id,
        changeAmount: 200,
        reason: 'INITIAL_STOCK',
        referenceId: 'SEED',
      }
    ]
  })
  
  console.log('✅ Seed completed successfully!')
  console.log('📊 Summary:')
  console.log(`   - Products: ${await prisma.product.count()}`)
  console.log(`   - BOM Items: ${await prisma.bOMItem.count()}`)
  console.log(`   - Sales Orders: ${await prisma.salesOrder.count()}`)
  console.log(`   - Purchase Orders: ${await prisma.purchaseOrder.count()}`)
  console.log(`   - Manufacturing Batches: ${await prisma.manufacturingBatch.count()}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })