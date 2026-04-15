import { Controller, Post, Body, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { QrService } from './qr.service';
import { ValidateQrDto } from './dto/validate-qr.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';

@Controller('qr')
export class QrController {
    constructor(private readonly qrService: QrService) { }

    @Post('validate')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    //@UseGuards(FirebaseAuthGuard)
    async validateQr(@Body() validateQrDto: ValidateQrDto) {
        return this.qrService.validateQr(validateQrDto.data);
    }
}
