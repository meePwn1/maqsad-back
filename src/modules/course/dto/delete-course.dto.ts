import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class DeleteCourseDto {
  @ApiProperty({ description: 'ID курса', required: true, type: 'string' })
  @IsString()
  @IsNotEmpty()
  courseId: string
}
