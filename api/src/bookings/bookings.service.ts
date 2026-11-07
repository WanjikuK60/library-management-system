import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpaceBookingDto } from './dto/create-space-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateSpaceBookingDto) {
    if (data.endTime <= data.startTime) {
      throw new BadRequestException('endTime must be later than startTime');
    }

    const date = new Date(`${data.date}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== data.date) {
      throw new BadRequestException('date must be a valid calendar date');
    }
    if (data.date < new Date().toISOString().slice(0, 10)) {
      throw new BadRequestException('date cannot be in the past');
    }

    return this.prisma.$transaction(async (transaction) => {
      await transaction.$queryRaw`
        SELECT pg_advisory_xact_lock(hashtext(${data.space}), hashtext(${data.date}))
      `;

      const conflictingBooking = await transaction.spaceBooking.findFirst({
        where: {
          space: data.space,
          date,
          startTime: { lt: data.endTime },
          endTime: { gt: data.startTime },
        },
        select: { id: true },
      });

      if (conflictingBooking) {
        throw new ConflictException('This space is already booked for part of that time.');
      }

      return transaction.spaceBooking.create({
        data: {
          userId,
          space: data.space,
          date,
          startTime: data.startTime,
          endTime: data.endTime,
        },
        select: {
          id: true,
          space: true,
          date: true,
          startTime: true,
          endTime: true,
          createdAt: true,
        },
      });
    });
  }
}
