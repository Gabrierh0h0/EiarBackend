import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { LoginDto } from './dto/login.dto';
import { FirebaseSignInResponse } from './dto/firebase-login-response.dto';
import { RegisterDto } from './dto/register.dto';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly firebaseService: FirebaseService,
  ) { }
  async me(uid: string) {
    const doc = await this.firebaseService.db.collection('users').doc(uid).get();
    if (!doc.exists) return { uid, role: 'student' }; // fallback
    return doc.data();
  }
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const apiKey = this.configService.get<string>('FIREBASE_WEB_API_KEY');

    if (!apiKey) {
      throw new BadRequestException('Configuración de Firebase incompleta');
    }

    try {
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          email,
          password,
          returnSecureToken: true,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const data = response.data as FirebaseSignInResponse;

      const { idToken, localId, email: returnedEmail, expiresIn } = data;

      return {
        token: idToken,
        user: {
          uid: localId,
          email: returnedEmail,
        },
        expiresIn: Number(expiresIn),
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errCode = error.response.data.error.message;

        if (errCode === 'INVALID_LOGIN_CREDENTIALS') {
          throw new UnauthorizedException('Credenciales inválidas');
        }

        throw new UnauthorizedException('Error al iniciar sesión');
      }

      throw new UnauthorizedException('Error inesperado');
    }

  }
  async register(registerDto: RegisterDto) {
    const { email, password, confirmPassword, firstName, middleName, lastName, career } = registerDto;

    if (confirmPassword && confirmPassword !== password) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // 1) Crear usuario en Firebase Auth (Admin SDK)
    try {
      const userRecord = await this.firebaseService.auth.createUser({
        email,
        password,
      });
      await this.firebaseService.db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        firstName,
        middleName: middleName ?? '',
        lastName,
        career,
        email,
        role: 'student', //Gabi cualquier cosa si es teacher o admin lo cambiamos desde el firebase 
        createdAt: new Date(), // Firestore acepta Date
      });

    } catch (e: any) {
      // errores típicos: auth/email-already-exists, auth/invalid-password, auth/invalid-email
      const code = e?.code ?? '';
      if (code === 'auth/email-already-exists') {
        throw new BadRequestException('Ese correo ya está registrado');
      }
      if (code === 'auth/invalid-password') {
        throw new BadRequestException('Contraseña inválida (mínimo 6 caracteres)');
      }
      if (code === 'auth/invalid-email') {
        throw new BadRequestException('Correo inválido');
      }
      throw new BadRequestException('No se pudo crear el usuario');
    }
    return this.login({ email, password });
  }
}
