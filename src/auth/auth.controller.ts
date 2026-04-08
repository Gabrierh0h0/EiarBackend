import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Get, Req, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';

@Controller('auth')          
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')             
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
    @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@Body() registerDto: RegisterDto) {
    console.log('REGISTER BODY:', registerDto);
    return this.authService.register(registerDto);
  }
  @Get('me')
@UseGuards(FirebaseAuthGuard)
me(@Req() req: any) {
  return this.authService.me(req.user.uid);
}
}