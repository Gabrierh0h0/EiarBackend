import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { UiConfigModule } from './ui-config/ui-config.module';
import { MisionesModule } from './misiones/misiones.module';
import { LogrosModule } from './logros/logros.module';
import { QrModule } from './qr/qr.module';
import { UserProgressModule } from './user-progress/user-progress.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    FirebaseModule,
    AuthModule,
    UiConfigModule,
    MisionesModule,
    LogrosModule,
    QrModule,
    UserProgressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
