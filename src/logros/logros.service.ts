import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class LogrosService {
    constructor(private readonly firebaseService: FirebaseService) { }

    async getLogros(uid?: string) {
        try {
            const snapshot = await this.firebaseService.db.collection('logros').get();
            const allLogros = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

            if (!uid) return allLogros;

            const userDoc = await this.firebaseService.db.collection('users').doc(uid).get();
            const unlockedLogros: string[] = userDoc.exists ? userDoc.data()?.unlockedLogros || [] : [];

            return allLogros.map(l => ({
                ...l,
                unlocked: unlockedLogros.includes(l.id)
            }));
        } catch (error) {
            throw new InternalServerErrorException('Error al obtener logros');
        }
    }
}
