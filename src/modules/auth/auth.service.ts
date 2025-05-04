import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import * as bcrypt from 'bcrypt'
import { LoginDto } from 'src/modules/auth/dto/login.dto'
import { JwtPayload } from 'src/modules/auth/types/jwt-payload.type'
import { TranslationService } from 'src/common/services/translation/translation.service'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly i18n: TranslationService,
  ) {}

  async login(dto: LoginDto) {
    const payload = await this.validateUser(dto.email, dto.password)
    if (!payload) {
      this.logger.warn(`Неудачная попытка входа для ${dto.email}`)
    }

    const tokens = this.getTokens(payload)
    const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 10)
    await this.usersService.updateUserToken(payload.id, hashedRefreshToken)

    return tokens
  }

  async logout(userPayload: JwtPayload) {
    const user = await this.usersService.getByEmail(userPayload.email)

    if (!user?.refreshToken) {
      throw new UnauthorizedException('Пользователь не авторизован')
    }

    await this.usersService.updateUserToken(userPayload.id, null)
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      })

      const user = await this.usersService.getByEmail(payload.email)
      if (!user || !user.refreshToken) {
        this.logger.warn(`Пользователь ${payload.email ?? 'неизвестный'} не найден или не имеет refreshToken`)
        throw new UnauthorizedException('По данному токену не найден пользователь')
      }

      const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken)
      if (!isRefreshTokenValid) {
        this.logger.warn(`Ошибка валидации refreshToken для пользователя ${user.email}`)
        throw new UnauthorizedException('Токены не совпадают')
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, refreshToken: __, ...userPayload } = user
      const tokens = this.getTokens(userPayload)

      const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 10)
      await this.usersService.updateUserToken(user.id, hashedRefreshToken)

      return tokens
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Ошибка при обновлении refreshToken: ${error.message}`)
      throw new UnauthorizedException('Неверный токен')
    }
  }

  getTokens(payload: JwtPayload) {
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_IN,
      }),
    }
  }

  async validateUser(email: string, password: string): Promise<JwtPayload> {
    const user = await this.usersService.getByEmail(email)
    if (!user || !(await bcrypt.compare(password, user.password))) {
      this.logger.warn(`Ошибка аутентификации пользователя ${email}`)
      throw new UnauthorizedException(this.i18n.t('errors.AUTH.INVALID_CREDENTIALS'))
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, refreshToken, ...payload } = user
    return payload
  }
}
