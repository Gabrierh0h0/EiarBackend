import { Injectable } from '@nestjs/common';

@Injectable()
export class QrService {
    async validateQr(data: string) {
        if (!data) {
            return { success: false, error: 'Código vacío o ilegible.' };
        }

        if (data.includes('EIA')) {
            return { success: true, data };
        }

        return { success: false, error: 'Código no reconocido.' };
    }
}
