import { Module } from '@nestjs/common';
import { UiConfigController } from './ui-config.controller';
import { UiConfigService } from './ui-config.service';
import { AuthModule } from '../auth/auth.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [AuthModule, FirebaseModule],
  controllers: [UiConfigController],
  providers: [UiConfigService],
})
export class UiConfigModule { }