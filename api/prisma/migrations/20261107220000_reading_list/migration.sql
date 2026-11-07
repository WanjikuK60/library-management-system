CREATE TABLE "ReadingListEntry" (
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingListEntry_pkey" PRIMARY KEY ("userId", "bookId")
);

CREATE INDEX "ReadingListEntry_bookId_idx" ON "ReadingListEntry"("bookId");

ALTER TABLE "ReadingListEntry"
ADD CONSTRAINT "ReadingListEntry_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReadingListEntry"
ADD CONSTRAINT "ReadingListEntry_bookId_fkey"
FOREIGN KEY ("bookId") REFERENCES "Book"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
