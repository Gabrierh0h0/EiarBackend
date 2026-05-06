import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

/**
 * DTO para completar una misión cuyo puntaje no es fijo
 * (por ejemplo, minijuegos como Food Drop) sino que se calcula
 * en el cliente y se envía como `score`.
 *
 * - `missionId`: id del documento en la colección `mision` de Firestore.
 * - `score`: puntos obtenidos en la partida. Cap defensivo de 0..1000
 *   para mitigar abusos desde el cliente.
 */
export class CompleteMissionWithScoreDto {
    @IsString()
    @IsNotEmpty()
    missionId: string;

    @IsInt()
    @Min(0)
    @Max(1000)
    score: number;
}
