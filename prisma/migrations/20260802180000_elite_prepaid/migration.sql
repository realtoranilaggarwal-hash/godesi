-- An Elite interview bought inside a package is credited when they apply.
ALTER TABLE "User" ADD COLUMN "elitePrepaid" BOOLEAN NOT NULL DEFAULT false;
