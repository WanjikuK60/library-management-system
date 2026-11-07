import { IsString, MinLength } from 'class-validator';

export class CreateBorrowRequestDto {
  @IsString()
  @MinLength(1)
  bookId!: string;
}
