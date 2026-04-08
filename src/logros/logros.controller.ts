import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { LogrosService } from './logros.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('logros')
export class LogrosController {
    constructor(private readonly logrosService: LogrosService) { }

    @Get()
    @UseGuards(FirebaseAuthGuard)
    async getLogros(@Req() req: any) {
        return this.logrosService.getLogros(req.user.uid);
    }
}
