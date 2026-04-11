-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `weight` DOUBLE NOT NULL,
    `price` DOUBLE NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `lastUpdated` DATETIME(3) NOT NULL,
    `isRawMaterial` BOOLEAN NOT NULL DEFAULT false,
    `isFinishedGood` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Product_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BOMItem` (
    `id` VARCHAR(191) NOT NULL,
    `finishedGoodId` VARCHAR(191) NOT NULL,
    `rawMaterialId` VARCHAR(191) NOT NULL,
    `quantityRequired` DOUBLE NOT NULL,

    INDEX `BOMItem_finishedGoodId_idx`(`finishedGoodId`),
    INDEX `BOMItem_rawMaterialId_idx`(`rawMaterialId`),
    UNIQUE INDEX `BOMItem_finishedGoodId_rawMaterialId_key`(`finishedGoodId`, `rawMaterialId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Customer_code_key`(`code`),
    UNIQUE INDEX `Customer_email_key`(`email`),
    INDEX `Customer_code_idx`(`code`),
    INDEX `Customer_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesOrder` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `status` ENUM('QUOTATION', 'PACKING', 'DISPATCHED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'QUOTATION',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SalesOrder_orderNumber_key`(`orderNumber`),
    INDEX `SalesOrder_customerId_idx`(`customerId`),
    INDEX `SalesOrder_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesOrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DOUBLE NOT NULL,

    INDEX `SalesOrderItem_orderId_idx`(`orderId`),
    INDEX `SalesOrderItem_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseOrder` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PurchaseOrder_orderNumber_key`(`orderNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseOrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DOUBLE NOT NULL,

    INDEX `PurchaseOrderItem_orderId_idx`(`orderId`),
    INDEX `PurchaseOrderItem_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ManufacturingBatch` (
    `id` VARCHAR(191) NOT NULL,
    `batchNumber` VARCHAR(191) NOT NULL,
    `outputProductId` VARCHAR(191) NOT NULL,
    `outputQuantity` INTEGER NOT NULL,
    `status` ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,

    UNIQUE INDEX `ManufacturingBatch_batchNumber_key`(`batchNumber`),
    INDEX `ManufacturingBatch_outputProductId_idx`(`outputProductId`),
    INDEX `ManufacturingBatch_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ManufacturingConsumption` (
    `id` VARCHAR(191) NOT NULL,
    `batchId` VARCHAR(191) NOT NULL,
    `materialId` VARCHAR(191) NOT NULL,
    `quantityUsed` DOUBLE NOT NULL,

    INDEX `ManufacturingConsumption_batchId_idx`(`batchId`),
    INDEX `ManufacturingConsumption_materialId_idx`(`materialId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockMovementLog` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `changeAmount` INTEGER NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `referenceId` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `StockMovementLog_productId_idx`(`productId`),
    INDEX `StockMovementLog_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BOMItem` ADD CONSTRAINT `BOMItem_finishedGoodId_fkey` FOREIGN KEY (`finishedGoodId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BOMItem` ADD CONSTRAINT `BOMItem_rawMaterialId_fkey` FOREIGN KEY (`rawMaterialId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrder` ADD CONSTRAINT `SalesOrder_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrderItem` ADD CONSTRAINT `SalesOrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `SalesOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesOrderItem` ADD CONSTRAINT `SalesOrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrderItem` ADD CONSTRAINT `PurchaseOrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrderItem` ADD CONSTRAINT `PurchaseOrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ManufacturingBatch` ADD CONSTRAINT `ManufacturingBatch_outputProductId_fkey` FOREIGN KEY (`outputProductId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ManufacturingConsumption` ADD CONSTRAINT `ManufacturingConsumption_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `ManufacturingBatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ManufacturingConsumption` ADD CONSTRAINT `ManufacturingConsumption_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockMovementLog` ADD CONSTRAINT `StockMovementLog_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
