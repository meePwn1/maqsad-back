import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateCourseDto {
  @ApiProperty({ description: 'Название курса', example: 'SMM' })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({ type: 'string', format: 'binary', required: true, description: 'Иконка курса' })
  @IsNotEmpty()
  icon: any
}
