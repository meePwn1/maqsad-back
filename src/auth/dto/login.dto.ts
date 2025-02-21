import { IsEmail, IsString, Matches, MinLength } from 'class-validator'

export class LoginDto {
  @IsEmail({}, { message: 'Невалидная почта' })
  email: string

  @IsString()
  @MinLength(8, { message: 'Пароль должен быть не менее 8 символов' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'Пароль должен содержать хотя бы одну цифру и одну букву',
  })
  password: string
}
