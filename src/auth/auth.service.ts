import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import * as bcrypt from 'bcrypt'
import { User } from '@prisma/client'
import { LoginDto } from 'src/auth/dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password)
    if (!user) {
      throw new UnauthorizedException('Неправильный логин или пароль')
    }
    return {
      access_token: this.jwtService.sign(user),
      refresh_token: this.jwtService.sign(user, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_IN,
      }),
    }
  }
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      })

      const user = await this.usersService.getByEmail(payload.email)
      if (!user) throw new UnauthorizedException('Пользователь не найден')

      return {
        access_token: this.jwtService.sign(user),
        refresh_token: this.jwtService.sign(user, {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env.JWT_REFRESH_IN,
        }),
      }
    } catch (error) {
      throw new UnauthorizedException('Невалидный рефреш токен')
    }
  }
  async validateUser(email: string, password: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.getByEmail(email)

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Неверные данные для входа')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user
    return result
  }
}
