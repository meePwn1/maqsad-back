import { DeleteReason } from './delete_reason'
import { Refund } from './refund'
import { User } from './user'
import { Group } from './group'
import { Course } from './course'
import { Payment } from './payment'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class Student {
  @ApiProperty({ type: String })
  id: string

  @ApiProperty({ type: String })
  firstName: string

  @ApiProperty({ type: String })
  lastName: string

  @ApiProperty({ type: String })
  phone: string

  @ApiProperty({ type: Date })
  addedAt: Date

  @ApiProperty({ type: Date })
  updatedAt: Date

  @ApiProperty({ type: Boolean })
  isDeleted: boolean

  @ApiPropertyOptional({ type: Date })
  deletedAt?: Date

  @ApiProperty({ type: Number })
  coursePrice: number

  @ApiPropertyOptional({ type: Number })
  deleteReasonId?: number

  @ApiPropertyOptional({ type: () => DeleteReason })
  deleteReason?: DeleteReason

  @ApiProperty({ type: Boolean })
  isRefund: boolean

  @ApiPropertyOptional({ type: () => Refund })
  refund?: Refund

  @ApiPropertyOptional({ type: String })
  managerId?: string

  @ApiPropertyOptional({ type: () => User })
  manager?: User

  @ApiPropertyOptional({ type: String })
  curatorId?: string

  @ApiPropertyOptional({ type: () => User })
  curator?: User

  @ApiPropertyOptional({ type: String })
  groupId?: string

  @ApiPropertyOptional({ type: () => Group })
  group?: Group

  @ApiPropertyOptional({ type: String })
  courseId?: string

  @ApiPropertyOptional({ type: () => Course })
  course?: Course

  @ApiProperty({ isArray: true, type: () => Payment })
  payment: Payment[]
}
