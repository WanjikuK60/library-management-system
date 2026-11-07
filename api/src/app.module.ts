import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { BookingsModule } from './bookings/bookings.module';
import { BorrowingModule } from './borrowing/borrowing.module';
import { GenresModule } from './genres/genres.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReadingListModule } from './reading-list/reading-list.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, GenresModule, BooksModule, BookingsModule, BorrowingModule, ReadingListModule, AuthModule],
})
export class AppModule {}
