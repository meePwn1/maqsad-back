import { Student } from './student'
import { Role } from '@prisma/client'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class User {
  @ApiProperty({ type: String })
  id: string

  @ApiProperty({ type: String })
  firstName: string

  @ApiProperty({ type: String })
  lastName: string

  @ApiProperty({ type: String })
  email: string

  @ApiProperty({ type: String })
  password: string

  @ApiProperty({ enum: Role, enumName: 'Role' })
  role: Role

  @ApiPropertyOptional({ type: String })
  avatar?: string

  @ApiProperty({ type: Date })
  createdAt: Date

  @ApiProperty({ type: Date })
  updatedAt: Date

  @ApiPropertyOptional({ type: String })
  refreshToken?: string

  @ApiProperty({ isArray: true, type: () => Student })
  managedStudents: Student[]

  @ApiProperty({ isArray: true, type: () => Student })
  curatedStudents: Student[]
}
