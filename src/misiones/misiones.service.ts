import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class MisionesService {
    constructor(private readonly firebaseService: FirebaseService) { }

    async getMisiones(uid?: string) {
        try {
            const snapshot = await this.firebaseService.db.collection('mision').get();
            const allMisiones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

            if (!uid) return allMisiones;

            const userDoc = await this.firebaseService.db.collection('users').doc(uid).get();
            const completedMissions: string[] = userDoc.exists ? userDoc.data()?.completedMissions || [] : [];

            return allMisiones.map(m => ({
                ...m,
                completed: completedMissions.includes(m.id)
            }));
        } catch (error) {
            throw new InternalServerErrorException('Error al obtener misiones');
        }
    }
}
