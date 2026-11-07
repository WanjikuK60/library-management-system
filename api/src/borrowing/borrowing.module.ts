import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BorrowingController } from './borrowing.controller';
import { BorrowingService } from './borrowing.service';

@Module({
  imports: [AuthModule],
  controllers: [BorrowingController],
  providers: [BorrowingService],
})
export class BorrowingModule {}
