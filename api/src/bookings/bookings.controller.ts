import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSpaceBookingDto } from './dto/create-space-booking.dto';
import { BookingsService } from './bookings.service';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() data: CreateSpaceBookingDto) {
    return this.bookingsService.create(request.user.id, data);
  }
}
