import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BorrowRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBorrowRequestDto } from './dto/create-borrow-request.dto';
import { calculateFine } from './fine-calculator';

const LOAN_PERIOD_DAYS = 14;

function addUtcDays(date: Date, days: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

@Injectable()
export class BorrowingService {
  constructor(private readonly prisma: PrismaService) {}

  findForPatron(userId: string) {
    return this.prisma.borrowRequest.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { requestedAt: 'desc' },
    });
  }

  findAll() {
    return this.prisma.borrowRequest.findMany({
      include: { book: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async create(userId: string, data: CreateBorrowRequestDto) {
    return this.prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw`
        SELECT pg_advisory_xact_lock(hashtext('borrow-request'), hashtext(${data.bookId}))
      `;

      const book = await transaction.book.findUnique({
        where: { id: data.bookId },
        select: { id: true },
      });
      if (!book) {
        throw new NotFoundException(`Book ${data.bookId} not found.`);
      }

      const savedBook = await transaction.readingListEntry.findUnique({
        where: { userId_bookId: { userId, bookId: data.bookId } },
        select: { bookId: true },
      });
      if (!savedBook) {
        throw new BadRequestException('Add this book to your reading list before requesting it.');
      }

      const existingRequest = await transaction.borrowRequest.findFirst({
        where: {
          userId,
          bookId: data.bookId,
          status: { in: [BorrowRequestStatus.PENDING, BorrowRequestStatus.APPROVED] },
        },
        select: { id: true },
      });
      if (existingRequest) {
        throw new ConflictException('You already have an active request for this book.');
      }

      return transaction.borrowRequest.create({
        data: { userId, bookId: data.bookId },
        include: { book: true },
      });
    });
  }

  async approve(id: string) {
    return this.prisma.$transaction(async (transaction) => {
      const request = await transaction.borrowRequest.findUnique({
        where: { id },
        include: { book: true },
      });
      if (!request) {
        throw new NotFoundException(`Borrow request ${id} not found.`);
      }

      await transaction.$queryRaw`
        SELECT pg_advisory_xact_lock(hashtext('borrow-request'), hashtext(${request.bookId}))
      `;

      const currentRequest = await transaction.borrowRequest.findUnique({ where: { id } });
      if (!currentRequest || currentRequest.status !== BorrowRequestStatus.PENDING) {
        throw new ConflictException('Only pending borrow requests can be approved.');
      }

      const activeBorrows = await transaction.borrowRequest.count({
        where: { bookId: request.bookId, status: BorrowRequestStatus.APPROVED },
      });
      if (activeBorrows >= request.book.totalCopies) {
        throw new ConflictException('No copies of this book are currently available.');
      }

      const today = new Date();
      const updated = await transaction.borrowRequest.updateMany({
        where: { id, status: BorrowRequestStatus.PENDING },
        data: {
          status: BorrowRequestStatus.APPROVED,
          processedAt: today,
          dueDate: addUtcDays(today, LOAN_PERIOD_DAYS),
        },
      });
      if (updated.count !== 1) {
        throw new ConflictException('Only pending borrow requests can be approved.');
      }
      return transaction.borrowRequest.findUniqueOrThrow({
        where: { id },
        include: { book: true },
      });
    });
  }

  async reject(id: string) {
    const request = await this.prisma.borrowRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException(`Borrow request ${id} not found.`);
    }
    const updated = await this.prisma.borrowRequest.updateMany({
      where: { id, status: BorrowRequestStatus.PENDING },
      data: { status: BorrowRequestStatus.REJECTED, processedAt: new Date() },
    });
    if (updated.count !== 1) {
      throw new ConflictException('Only pending borrow requests can be rejected.');
    }
    return this.prisma.borrowRequest.findUniqueOrThrow({
      where: { id },
      include: { book: true },
    });
  }

  async returnBook(id: string) {
    return this.prisma.$transaction(async (transaction) => {
      const request = await transaction.borrowRequest.findUnique({ where: { id } });
      if (!request) {
        throw new NotFoundException(`Borrow request ${id} not found.`);
      }
      if (request.status !== BorrowRequestStatus.APPROVED || !request.dueDate) {
        throw new ConflictException('Only approved borrow requests can be returned.');
      }

      const returnedAt = new Date();
      const fineAmount = calculateFine(request.dueDate, returnedAt);
      const updated = await transaction.borrowRequest.updateMany({
        where: { id, status: BorrowRequestStatus.APPROVED },
        data: { status: BorrowRequestStatus.RETURNED, returnedAt, fineAmount },
      });
      if (updated.count !== 1) {
        throw new ConflictException('Only approved borrow requests can be returned.');
      }
      return transaction.borrowRequest.findUniqueOrThrow({
        where: { id },
        include: { book: true },
      });
    });
  }
}
