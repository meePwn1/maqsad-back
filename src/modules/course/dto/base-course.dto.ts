import { ApiProperty } from '@nestjs/swagger'
import { Course } from '@prisma/client'
import { Expose } from 'class-transformer'

export class BaseCourseDto implements Course {
  @Expose()
  @ApiProperty({ type: Date })
  createdAt: Date

  @Expose()
  @ApiProperty({ type: Date })
  updatedAt: Date

  @Expose()
  @ApiProperty({ type: String })
  name: string

  @Expose()
  @ApiProperty({ type: String })
  icon: string

  @Expose()
  @ApiProperty({ type: String })
  id: string
}
