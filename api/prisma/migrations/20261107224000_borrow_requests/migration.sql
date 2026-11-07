CREATE TYPE "BorrowRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RETURNED');

CREATE TABLE "BorrowRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "status" "BorrowRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "dueDate" DATE,
    "returnedAt" TIMESTAMP(3),
    "fineAmount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BorrowRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BorrowRequest_userId_status_idx" ON "BorrowRequest"("userId", "status");
CREATE INDEX "BorrowRequest_bookId_status_idx" ON "BorrowRequest"("bookId", "status");

ALTER TABLE "BorrowRequest"
ADD CONSTRAINT "BorrowRequest_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BorrowRequest"
ADD CONSTRAINT "BorrowRequest_bookId_fkey"
FOREIGN KEY ("bookId") REFERENCES "Book"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
