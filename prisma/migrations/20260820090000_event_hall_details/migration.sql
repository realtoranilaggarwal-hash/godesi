-- Hall capacity and the venue's own page, shown on the event page.
ALTER TABLE "Event" ADD COLUMN     "hallCapacity" INTEGER,
ADD COLUMN     "venueUrl" TEXT;
