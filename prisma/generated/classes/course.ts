import { Student } from './student'
import { ApiProperty } from '@nestjs/swagger'

export class Course {
  @ApiProperty({ type: String })
  id: string

  @ApiProperty({ type: String })
  name: string

  @ApiProperty({ type: String })
  icon: string

  @ApiProperty({ type: Date })
  createdAt: Date

  @ApiProperty({ type: Date })
  updatedAt: Date

  @ApiProperty({ isArray: true, type: () => Student })
  students: Student[]
}
