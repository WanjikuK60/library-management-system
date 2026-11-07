import { IsIn, IsString, Matches } from 'class-validator';

export class CreateSpaceBookingDto {
  @IsIn(['quiet-study', 'group-study', 'reading-room'])
  space!: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must use YYYY-MM-DD format' })
  date!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'startTime must use HH:mm format' })
  startTime!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'endTime must use HH:mm format' })
  endTime!: string;
}
