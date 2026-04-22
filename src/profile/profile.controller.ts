import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';

@Controller('profile')
@UseGuards(FirebaseAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  async me(@Req() req: any) {
    return this.profileService.getMe(req.user.uid);
  }

  @Patch()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.uid, dto);
  }

  @Patch('photo')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updatePhoto(@Req() req: any, @Body() dto: UpdatePhotoDto) {
    return this.profileService.updatePhoto(req.user.uid, dto);
  }

  @Get('permissions')
  async getPermissions(@Req() req: any) {
    return this.profileService.getPermissions(req.user.uid);
  }

  @Patch('permissions')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updatePermissions(@Req() req: any, @Body() dto: UpdatePermissionsDto) {
    return this.profileService.updatePermissions(req.user.uid, dto);
  }
}