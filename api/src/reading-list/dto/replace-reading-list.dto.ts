import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class ReplaceReadingListDto {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  bookIds!: string[];
}
