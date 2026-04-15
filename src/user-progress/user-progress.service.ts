import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UserProgressService {
    constructor(private readonly firebaseService: FirebaseService) { }

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
            totalPoints: newTotalPoints,
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
        return {
            totalPoints: data.totalPoints || 0,
            completedMissions: data.completedMissions || [],
            unlockedLogros: data.unlockedLogros || [],
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
