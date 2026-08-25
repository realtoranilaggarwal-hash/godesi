-- Daily site traffic totals behind the footer counter. One row a day, so the
-- all-time total is a single cheap sum.
CREATE TABLE "VisitDay" (
    "day" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "visitors" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VisitDay_pkey" PRIMARY KEY ("day")
);
