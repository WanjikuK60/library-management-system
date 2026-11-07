CREATE TABLE "SpaceBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "space" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpaceBooking_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SpaceBooking_space_date_idx" ON "SpaceBooking"("space", "date");
CREATE INDEX "SpaceBooking_userId_idx" ON "SpaceBooking"("userId");

ALTER TABLE "SpaceBooking"
ADD CONSTRAINT "SpaceBooking_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
