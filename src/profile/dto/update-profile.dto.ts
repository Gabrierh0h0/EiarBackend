import { IsIn, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'La carrera debe ser texto' })
  @IsNotEmpty({ message: 'La carrera no puede estar vacía' })
  career?: string;

  @IsOptional()
  @IsIn(['firstName', 'middleName'], {
    message: 'displayNamePreference debe ser firstName o middleName',
  })
  displayNamePreference?: 'firstName' | 'middleName';

  @IsOptional()
  @IsIn(['es', 'en'], {
    message: 'El idioma debe ser es o en',
  })
  language?: 'es' | 'en';
}