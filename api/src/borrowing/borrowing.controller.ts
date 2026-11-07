import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateBorrowRequestDto } from './dto/create-borrow-request.dto';
import { BorrowingService } from './borrowing.service';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('borrow-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BorrowingController {
  constructor(private readonly borrowingService: BorrowingService) {}

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() data: CreateBorrowRequestDto) {
    return this.borrowingService.create(request.user.id, data);
  }

  @Get()
  findForPatron(@Req() request: AuthenticatedRequest) {
    return this.borrowingService.findForPatron(request.user.id);
  }

  @Get('admin')
  @Roles('LIBRARIAN')
  findAll() {
    return this.borrowingService.findAll();
  }

  @Patch(':id/approve')
  @Roles('LIBRARIAN')
  approve(@Param('id') id: string) {
    return this.borrowingService.approve(id);
  }

  @Patch(':id/reject')
  @Roles('LIBRARIAN')
  reject(@Param('id') id: string) {
    return this.borrowingService.reject(id);
  }

  @Patch(':id/return')
  @Roles('LIBRARIAN')
  returnBook(@Param('id') id: string) {
    return this.borrowingService.returnBook(id);
  }
}
