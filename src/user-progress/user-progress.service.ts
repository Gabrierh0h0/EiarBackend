import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UserProgressService {
    constructor(private readonly firebaseService: FirebaseService) { }

    /**
     * Completa una misión cuyo puntaje viene del cliente (ej. minijuegos
     * como Food Drop). Misma idempotencia y lógica de logros que
     * `completeMission`, pero suma `score` en lugar de `mission.puntos`.
     *
     * El cap defensivo de score (0..1000) ya está validado en el DTO; aquí
     * solo se aplica un `Math.max(0, ...)` por seguridad en runtime.
     */
    async completeMissionWithScore(uid: string, missionId: string, score: number) {
        const safeScore = Math.max(0, Math.floor(score || 0));

        const userRef = this.firebaseService.db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const userData = userDoc.data()!;
        const completedMissions: string[] = userData.completedMissions || [];

        // Idempotencia: si la misión ya fue completada, no se vuelve a sumar.
        if (completedMissions.includes(missionId)) {
            return {
                message: 'Misión ya completada anteriormente',
                alreadyCompleted: true,
                totalPoints: userData.totalPoints || 0,
            };
        }

        // Verificar que la misión exista en el catálogo.
        const missionDoc = await this.firebaseService.db.collection('mision').doc(missionId).get();
        if (!missionDoc.exists) {
            throw new NotFoundException('Misión no encontrada en el sistema');
        }

        const newCompletedMissions = [...completedMissions, missionId];
        let newTotalPoints = (userData.totalPoints || 0) + safeScore;
        const unlockedLogros: string[] = userData.unlockedLogros || [];

        // Persistimos el score del juego en un mapa `gameScores` por missionId.
        // Esto es CRÍTICO para que `getUserProgress` no sobrescriba el totalPoints:
        // ese método recalcula los puntos sumando `mision.puntos`, y como las
        // misiones de juegos tienen puntos fijos = 0, sin este registro
        // los puntos de juegos se "perderían" al primer recalculado.
        const existingGameScores: Record<string, number> = userData.gameScores || {};
        const updatedGameScores: Record<string, number> = {
            ...existingGameScores,
            [missionId]: safeScore,
        };

        // Verificar logros desbloqueables tras completar esta misión.
        const allLogrosSnapshot = await this.firebaseService.db.collection('logros').get();
        const newUnlockedLogros: string[] = [];

        for (const achievement of allLogrosSnapshot.docs) {
            const achievementId = achievement.id;
            const achievementData = achievement.data();
            const requiredMissions: string[] = achievementData.requiredMissions || [];

            if (!unlockedLogros.includes(achievementId) && requiredMissions.length > 0) {
                const isNowUnlocked = requiredMissions.every(reqId => newCompletedMissions.includes(reqId));

                if (isNowUnlocked) {
                    newUnlockedLogros.push(achievementId);
                    newTotalPoints += (achievementData.puntos || 0);
                }
            }
        }

        const updatedUnlockedLogros = [...unlockedLogros, ...newUnlockedLogros];

        await userRef.update({
            completedMissions: newCompletedMissions,
            missionsCompleted: newCompletedMissions,
            totalPoints: newTotalPoints,
            score: newTotalPoints,
            unlockedLogros: updatedUnlockedLogros,
            gameScores: updatedGameScores,
        });

        return {
            success: true,
            scoreEarned: safeScore,
            newTotalPoints,
            newAchievements: newUnlockedLogros,
            alreadyCompleted: false,
        };
    }

    async completeMission(uid: string, missionId: string) {
        const userRef = this.firebaseService.db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const userData = userDoc.data()!;
        const completedMissions: string[] = userData.completedMissions || [];

        // Check if already completed
        if (completedMissions.includes(missionId)) {
            return { message: 'Misión ya completada anteriormente', alreadyCompleted: true };
        }

        // Get mission points
        const missionDoc = await this.firebaseService.db.collection('mision').doc(missionId).get();
        if (!missionDoc.exists) {
            throw new NotFoundException('Misión no encontrada en el sistema');
        }
        const missionData = missionDoc.data()!;
        const missionPoints = missionData.puntos || 0;

        // Update user: missions and points
        const newCompletedMissions = [...completedMissions, missionId];
        let newTotalPoints = (userData.totalPoints || 0) + missionPoints;
        const unlockedLogros: string[] = userData.unlockedLogros || [];

        // Check for new achievements (logros)
        const allLogrosSnapshot = await this.firebaseService.db.collection('logros').get();
        const newUnlockedLogros: string[] = [];

        for (const achievement of allLogrosSnapshot.docs) {
            const achievementId = achievement.id;
            const achievementData = achievement.data();
            const requiredMissions: string[] = achievementData.requiredMissions || [];

            // If achievement not yet unlocked and all required missions are now done
            if (!unlockedLogros.includes(achievementId) && requiredMissions.length > 0) {
                const isNowUnlocked = requiredMissions.every(reqId => newCompletedMissions.includes(reqId));

                if (isNowUnlocked) {
                    newUnlockedLogros.push(achievementId);
                    newTotalPoints += (achievementData.puntos || 0);
                }
            }
        }

        const updatedUnlockedLogros = [...unlockedLogros, ...newUnlockedLogros];

        await userRef.update({
            completedMissions: newCompletedMissions,
            missionsCompleted: newCompletedMissions,
            totalPoints: newTotalPoints,
            score: newTotalPoints,
            unlockedLogros: updatedUnlockedLogros,
        });

        return {
            success: true,
            pointsEarned: missionPoints,
            newTotalPoints,
            newAchievements: newUnlockedLogros,
        };
    }

    async getUserProgress(uid: string) {
        const userDoc = await this.firebaseService.db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            throw new NotFoundException('Usuario no encontrado');
        }
        const data = userDoc.data()!;

        const completedMissions: string[] = Array.from(new Set([
            ...(data.completedMissions || []),
            ...(data.missionsCompleted || [])
        ]));
        const unlockedLogros: string[] = data.unlockedLogros || [];
        let totalPoints: number = data.totalPoints || data.score || 0;

        // Get total counts from Firestore collections
        const [misionesSnap, logrosSnap] = await Promise.all([
            this.firebaseService.db.collection('mision').get(),
            this.firebaseService.db.collection('logros').get(),
        ]);

        // Calculate accurate real points and auto-unlock achievements
        let calculatedPoints = 0;
        let unlockedNewLogros = false;

        misionesSnap.forEach(doc => {
            if (completedMissions.includes(doc.id)) {
                calculatedPoints += (doc.data().puntos || 0);
            }
        });

        logrosSnap.forEach(doc => {
            const achievementId = doc.id;
            const achievementData = doc.data();

            if (unlockedLogros.includes(achievementId)) {
                calculatedPoints += (achievementData.puntos || 0);
            } else {
                // Auto-unlock logic for backward compatibility
                const requiredMissions: string[] = achievementData.requiredMissions || [];
                if (requiredMissions.length > 0) {
                    const isNowUnlocked = requiredMissions.every(reqId => completedMissions.includes(reqId));
                    if (isNowUnlocked) {
                        unlockedLogros.push(achievementId);
                        unlockedNewLogros = true;
                        calculatedPoints += (achievementData.puntos || 0);
                    }
                }
            }
        });

        // Sumar los scores de minijuegos guardados aparte. Sin esto, los puntos
        // ganados en juegos como Food Drop se perderían al recalcularse, porque
        // la misión asociada tiene `puntos: 0` (el puntaje real lo da el juego).
        const gameScores: Record<string, number> = data.gameScores || {};
        for (const missionId of completedMissions) {
            const gs = gameScores[missionId];
            if (typeof gs === 'number' && gs > 0) {
                calculatedPoints += gs;
            }
        }

        // Sync to DB if there's an inconsistency with old data or new unlocked achievements
        if (calculatedPoints !== (data.totalPoints || 0) || unlockedNewLogros) {
            totalPoints = calculatedPoints;
            await this.firebaseService.db.collection('users').doc(uid).update({
                totalPoints: calculatedPoints,
                score: calculatedPoints,
                completedMissions: completedMissions,
                missionsCompleted: completedMissions,
                unlockedLogros: unlockedLogros
            });
        }

        const totalMissions = misionesSnap.size;
        const totalLogros = logrosSnap.size;
        const completedMissionsCount = completedMissions.length;
        const unlockedLogrosCount = unlockedLogros.length;
        const pendingMissionsCount = totalMissions - completedMissionsCount;
        const completedItems = completedMissionsCount + unlockedLogrosCount;
        const totalItems = totalMissions + totalLogros;
        const progressPercentage = totalItems > 0
            ? Math.round((completedItems / totalItems) * 100)
            : 0;

        const myRanking = await this.getMyRanking(uid);

        return {
            totalPoints,
            completedMissions,
            unlockedLogros,
            completedMissionsCount,
            unlockedLogrosCount,
            pendingMissionsCount,
            totalMissions,
            totalLogros,
            completedItems,
            totalItems,
            progressPercentage,
            rankingPosition: myRanking.position,
        };
    }

    async getRanking() {
        const snapshot = await this.firebaseService.db
            .collection('users')
            .orderBy('totalPoints', 'desc')
            .limit(50)
            .get();

        return snapshot.docs.map((doc, index) => {
            const data = doc.data();
            return {
                uid: doc.id,
                rank: index + 1,
                firstName: data.firstName,
                lastName: data.lastName,
                totalPoints: data.totalPoints || 0,
            };
        });
    }

    async getMyRanking(uid: string) {
        const ranking = await this.getRanking();
        const myPos = ranking.findIndex(u => u.uid === uid);

        // If user is in top 50, we have their position. 
        // Otherwise we'd need a more complex count query, but for now this is fine.
        return {
            position: myPos !== -1 ? myPos + 1 : '50+',
            ranking: ranking,
        };
    }
}
