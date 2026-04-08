import { Module } from '@nestjs/common';
import { LogrosController } from './logros.controller';
import { LogrosService } from './logros.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
    imports: [FirebaseModule],
    controllers: [LogrosController],
    providers: [LogrosService],
})
export class LogrosModule { }
