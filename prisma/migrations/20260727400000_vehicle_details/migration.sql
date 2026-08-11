-- Cars & Bikes listing details.
CREATE TABLE "VehicleDetails" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "mileage" INTEGER,
    "mileageUnit" TEXT NOT NULL DEFAULT 'mi',
    "fuelType" TEXT,
    "transmission" TEXT,
    "ownership" TEXT,
    "condition" TEXT,
    "price" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "negotiable" BOOLEAN NOT NULL DEFAULT false,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleDetails_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VehicleDetails_businessId_key" ON "VehicleDetails"("businessId");
CREATE INDEX "VehicleDetails_make_model_idx" ON "VehicleDetails"("make", "model");
CREATE INDEX "VehicleDetails_vehicleType_year_idx" ON "VehicleDetails"("vehicleType", "year");

ALTER TABLE "VehicleDetails" ADD CONSTRAINT "VehicleDetails_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
