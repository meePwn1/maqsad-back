import { Body, Controller, HttpCode, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'

import { RequestWithUser } from 'src/common/types/request-with-user.type'
import { AuthService } from 'src/modules/auth/auth.service'
import { Public } from 'src/modules/auth/decorators/public.decorator'
import { LoginResponseDto } from 'src/modules/auth/dto/login-response.dto'
import { LoginDto } from 'src/modules/auth/dto/login.dto'
import { RefreshTokenDto } from 'src/modules/auth/dto/refresh-token.dto'
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard'

@ApiTags('Auth')
@Public()
@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Аутентификация пользователя' })
  @ApiResponse({ status: 200, description: 'Успешный вход', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @ApiOperation({ summary: 'Обновление access-токена' })
  @ApiResponse({ status: 200, description: 'Новый access-токен', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Неверный refresh-токен' })
  @HttpCode(200)
  @Post('refresh-token')
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken)
  }

  @ApiOperation({ summary: 'Выход из системы' })
  @ApiResponse({ status: 204, description: 'Успешный выход' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiBearerAuth()
  @Public(false)
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: RequestWithUser) {
    if (!req.user) {
      throw new UnauthorizedException('Не авторизован')
    }
    return this.authService.logout(req.user)
  }
}
