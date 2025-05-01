import { Student } from './student'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class Refund {
  @ApiProperty({ type: String })
  id: string

  @ApiProperty({ type: Number })
  amount: number

  @ApiPropertyOptional({ type: String })
  comment?: string

  @ApiProperty({ type: Date })
  createdAt: Date

  @ApiProperty({ type: Date })
  updatedAt: Date

  @ApiProperty({ type: String })
  studentId: string

  @ApiProperty({ type: () => Student })
  student: Student
}
