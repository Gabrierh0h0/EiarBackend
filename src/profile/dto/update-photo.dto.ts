import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePhotoDto {
  @IsString({ message: 'La foto debe ser texto' })
  @IsNotEmpty({ message: 'La foto es requerida' })
  photoUrl!: string;
}