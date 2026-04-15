import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateQrDto {
    @IsString()
    @IsNotEmpty()
    data: string;
}
