import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePermissionsDto {
  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  notificationsGranted?: boolean;

  @IsOptional()
  @IsBoolean()
  cameraEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  cameraGranted?: boolean;

  @IsOptional()
  @IsBoolean()
  galleryEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  galleryGranted?: boolean;
}