import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReplaceReadingListDto } from './dto/replace-reading-list.dto';
import { ReadingListService } from './reading-list.service';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('reading-list')
@UseGuards(JwtAuthGuard)
export class ReadingListController {
  constructor(private readonly readingListService: ReadingListService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.readingListService.findAll(request.user.id);
  }

  @Put()
  replace(
    @Req() request: AuthenticatedRequest,
    @Body() data: ReplaceReadingListDto,
  ) {
    return this.readingListService.replace(request.user.id, data);
  }
}
