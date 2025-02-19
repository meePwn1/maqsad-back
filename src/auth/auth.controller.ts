import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { AuthService } from 'src/auth/auth.service'
import { LoginDto } from 'src/auth/dto/login.dto'
import { Public } from 'src/common/decorators/public.decorator'

@Public()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }
}
