import { Controller, Post, Get, Body, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { CompleteMissionDto } from './dto/complete-mission.dto';
import { CompleteMissionWithScoreDto } from './dto/complete-mission-with-score.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('progress')
@UseGuards(FirebaseAuthGuard)
export class UserProgressController {
    constructor(private readonly userProgressService: UserProgressService) { }

    @Post('complete-mission')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async completeMission(@Req() req: any, @Body() completeMissionDto: CompleteMissionDto) {
        return this.userProgressService.completeMission(req.user.uid, completeMissionDto.missionId);
    }

    /**
     * Endpoint específico para misiones cuyo puntaje no es fijo
     * (ej. minijuegos como Food Drop). Recibe `missionId` + `score`
     * y suma `score` al `totalPoints` del usuario, manteniendo la
     * misma idempotencia que `complete-mission`.
     */
    @Post('complete-mission-with-score')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async completeMissionWithScore(
        @Req() req: any,
        @Body() dto: CompleteMissionWithScoreDto,
    ) {
        return this.userProgressService.completeMissionWithScore(
            req.user.uid,
            dto.missionId,
            dto.score,
        );
    }

    @Get('me')
    async getMyProgress(@Req() req: any) {
        return this.userProgressService.getUserProgress(req.user.uid);
    }

    @Get('ranking')
    async getRanking() {
        return this.userProgressService.getRanking();
    }

    @Get('my-ranking')
    async getMyRanking(@Req() req: any) {
        return this.userProgressService.getMyRanking(req.user.uid);
    }
}
