import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
    required: true,
  })
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'StrongPass123!',
    required: true,
  })
  @IsString()
  @MinLength(8)
  password: string
}
