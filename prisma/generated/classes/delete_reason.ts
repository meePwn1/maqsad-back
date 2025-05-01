import { Student } from './student'
import { ApiProperty } from '@nestjs/swagger'

export class DeleteReason {
  @ApiProperty({ type: Number })
  id: number

  @ApiProperty({ type: String })
  nameUz: string

  @ApiProperty({ type: String })
  nameRu: string

  @ApiProperty({ isArray: true, type: () => Student })
  Student: Student[]
}
