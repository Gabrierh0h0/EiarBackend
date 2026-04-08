import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteMissionDto {
    @IsString()
    @IsNotEmpty()
    missionId: string;
}
