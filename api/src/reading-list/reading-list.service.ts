import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReplaceReadingListDto } from './dto/replace-reading-list.dto';

@Injectable()
export class ReadingListService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const entries = await this.prisma.readingListEntry.findMany({
      where: { userId },
      include: { book: { include: { genre: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return entries.map(({ book }) => book);
  }

  async replace(userId: string, data: ReplaceReadingListDto) {
    if (data.bookIds.length > 0) {
      const books = await this.prisma.book.findMany({
        where: { id: { in: data.bookIds } },
        select: { id: true },
      });
      if (books.length !== data.bookIds.length) {
        throw new BadRequestException('One or more books do not exist.');
      }
    }

    await this.prisma.$transaction(async (transaction) => {
      await transaction.readingListEntry.deleteMany({ where: { userId } });
      if (data.bookIds.length > 0) {
        await transaction.readingListEntry.createMany({
          data: data.bookIds.map((bookId) => ({ userId, bookId })),
        });
      }
    });

    return this.findAll(userId);
  }
}
