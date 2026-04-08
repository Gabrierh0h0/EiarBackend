import { Controller, Post, Get, Body, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserProgressService } from './user-progress.service';
import { CompleteMissionDto } from './dto/complete-mission.dto';
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
