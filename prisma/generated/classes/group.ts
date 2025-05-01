import { Student } from './student'
import { LearningFormat } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'

export class Group {
  @ApiProperty({ type: String })
  id: string

  @ApiProperty({ type: String })
  name: string

  @ApiProperty({ enum: LearningFormat, enumName: 'LearningFormat' })
  learningFormat: LearningFormat

  @ApiProperty({ type: String })
  groupColor: string

  @ApiProperty({ type: Date })
  createdAt: Date

  @ApiProperty({ type: Date })
  updatedAt: Date

  @ApiProperty({ isArray: true, type: () => Student })
  students: Student[]
}
