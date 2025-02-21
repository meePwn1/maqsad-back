import { Body, Controller, HttpCode, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common'
import { AuthService } from 'src/auth/auth.service'
import { LoginDto } from 'src/auth/dto/login.dto'
import { RefreshTokenDto } from 'src/auth/dto/refresh-token.dto'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { Public } from 'src/auth/decorators/public.decorator'
import { JwtPayload } from 'src/auth/types/jwt-payload.type'

@Public()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @HttpCode(200)
  @Post('refresh-token')
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken)
  }

  @Public(false)
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: Request & { user: JwtPayload }) {
    console.log(req.user)
    if (!req.user) {
      throw new UnauthorizedException('Не авторизован')
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
    return this.authService.logout(req.user)
  }
}
