import { Module } from '@nestjs/common';
import { UserProgressController } from './user-progress.controller';
import { UserProgressService } from './user-progress.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule, FirebaseModule],
    controllers: [UserProgressController],
    providers: [UserProgressService],
    exports: [UserProgressService],
})
export class UserProgressModule { }
