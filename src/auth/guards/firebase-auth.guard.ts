import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no encontrado');
    }

    const token = authHeader.substring('Bearer '.length).trim();

    try {
      // 1) Verificar idToken (Firebase)
      const decoded = await this.firebaseService.auth.verifyIdToken(token);

      // 2) Buscar el rol en Firestore
      const userDoc = await this.firebaseService.db.collection('users').doc(decoded.uid).get();
      const userData = userDoc.exists ? userDoc.data() : null;

      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: userData?.role ?? 'student', // default si falta
      };

      return true;
    } catch (e) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}