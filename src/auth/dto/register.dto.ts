import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { Match } from '../match.decorator';

export class RegisterDto {
  @IsString({ message: 'El primer nombre debe ser texto' })
  @IsNotEmpty({ message: 'El primer nombre es requerido' })
  firstName: string;

  @IsOptional()
  @IsString({ message: 'El segundo nombre debe ser texto' })
  middleName?: string;

  @IsString({ message: 'Los apellidos deben ser texto' })
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  lastName: string;

  @IsEmail({}, { message: 'Correo inválido' })
  @IsNotEmpty({ message: 'El correo es requerido' })
  @Matches(/@eia\.edu\.co$/i, { message: 'Debes usar tu correo institucional (@eia.edu.co)' })
  email: string;

  @IsString({ message: 'La carrera debe ser texto' })
  @IsNotEmpty({ message: 'La carrera es requerida' })
  career: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password: string;

  @IsString({ message: 'La confirmación debe ser texto' })
  @IsNotEmpty({ message: 'Debes confirmar la contraseña' })
  @Match('password', { message: 'Las contraseñas no coinciden' })
  confirmPassword: string;
}
