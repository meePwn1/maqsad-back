import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateStudentDto {
  @IsString()
  firstName: string

  @IsString()
  lastName: string

  @IsString()
  phone: string

  @IsString()
  courseId: string

  @IsString()
  groupId: string

  @IsString()
  managerId: string

  @IsString()
  curatorId: string

  @IsNumber()
  coursePrice: number

  @IsDate()
  @IsOptional()
  addedAt?: Date
}
