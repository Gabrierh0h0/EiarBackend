import { Module } from '@nestjs/common';
import { MisionesController } from './misiones.controller';
import { MisionesService } from './misiones.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
    imports: [FirebaseModule],
    controllers: [MisionesController],
    providers: [MisionesService],
})
export class MisionesModule { }
