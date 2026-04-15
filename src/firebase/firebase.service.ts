import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App;

  constructor() {
    if (!admin.apps.length) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert('./firebase-service-account.json'),
      });
    } else {
      this.app = admin.app();
    }
  }

  onModuleInit(){
    console.log('Firebase Admin inicializado ✅');
  }

  get auth() {
    return this.app.auth();
  }
  get db() {
    return this.app.firestore();
  }

}
