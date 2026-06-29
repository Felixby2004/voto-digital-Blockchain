import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    // 1. Validar credenciales
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    
    // 2. Generar tokens
    return this.authService.login(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
  return {
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  };
}
}