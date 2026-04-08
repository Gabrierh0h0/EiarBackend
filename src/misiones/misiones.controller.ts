import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { MisionesService } from './misiones.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('misiones')
export class MisionesController {
    constructor(private readonly misionesService: MisionesService) { }

    @Get()
    @UseGuards(FirebaseAuthGuard)
    async getMisiones(@Req() req: any) {
        return this.misionesService.getMisiones(req.user.uid);
    }
}
