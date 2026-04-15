import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UiConfigService } from './ui-config.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('ui')
export class UiConfigController {
  constructor(private readonly uiConfigService: UiConfigService) {}

  @Get('menu')
  @UseGuards(FirebaseAuthGuard)
  getMenu(@Req() req: any) {
    return this.uiConfigService.getMenu(req.user); // req.user.role ya existe
  }
}