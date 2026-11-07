import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReadingListController } from './reading-list.controller';
import { ReadingListService } from './reading-list.service';

@Module({
  imports: [AuthModule],
  controllers: [ReadingListController],
  providers: [ReadingListService],
})
export class ReadingListModule {}
