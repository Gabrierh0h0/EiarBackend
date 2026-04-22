import { BadRequestException, Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private get usersCollection() {
    return this.firebaseService.db.collection('users');
  }

  private normalizeProfile(uid: string, data?: FirebaseFirestore.DocumentData) {
    const permissions = data?.settings?.permissions ?? {};

    return {
      uid,
      firstName: data?.firstName ?? '',
      middleName: data?.middleName ?? '',
      lastName: data?.lastName ?? '',
      email: data?.email ?? '',
      career: data?.career ?? '',
      role: data?.role ?? 'student',
      photoUrl: data?.photoUrl ?? '',
      displayNamePreference: data?.displayNamePreference ?? 'firstName',
      language: data?.language ?? 'es',
      settings: {
        permissions: {
          notifications: {
            enabled: Boolean(permissions?.notifications?.enabled),
            granted: Boolean(permissions?.notifications?.granted),
          },
          camera: {
            enabled: Boolean(permissions?.camera?.enabled),
            granted: Boolean(permissions?.camera?.granted),
          },
          gallery: {
            enabled: Boolean(permissions?.gallery?.enabled),
            granted: Boolean(permissions?.gallery?.granted),
          },
        },
      },
      createdAt: data?.createdAt ?? null,
    };
  }

  async getMe(uid: string) {
    const doc = await this.usersCollection.doc(uid).get();
    return this.normalizeProfile(uid, doc.exists ? doc.data() : {});
  }

  async updateProfile(uid: string, dto: UpdateProfileDto) {
    const current = await this.getMe(uid);

    if (
      dto.displayNamePreference === 'middleName' &&
      !String(current.middleName ?? '').trim()
    ) {
      throw new BadRequestException(
        'No puedes mostrar el segundo nombre porque el usuario no tiene uno registrado',
      );
    }

    const updatePayload: Record<string, any> = {};

    if (typeof dto.career !== 'undefined') {
      updatePayload.career = dto.career;
    }

    if (typeof dto.displayNamePreference !== 'undefined') {
      updatePayload.displayNamePreference = dto.displayNamePreference;
    }

    if (typeof dto.language !== 'undefined') {
      updatePayload.language = dto.language;
    }

    await this.usersCollection.doc(uid).set(updatePayload, { merge: true });

    return this.getMe(uid);
  }

  async updatePhoto(uid: string, dto: UpdatePhotoDto) {
    if (dto.photoUrl.length > 900000) {
      throw new BadRequestException(
        'La imagen es demasiado pesada. Usa una foto más liviana.',
      );
    }

    await this.usersCollection.doc(uid).set(
      {
        photoUrl: dto.photoUrl,
      },
      { merge: true },
    );

    return this.getMe(uid);
  }

  async getPermissions(uid: string) {
    const profile = await this.getMe(uid);
    return profile.settings.permissions;
  }

  async updatePermissions(uid: string, dto: UpdatePermissionsDto) {
    const current = await this.getPermissions(uid);

    const nextPermissions = {
      notifications: {
        granted:
          typeof dto.notificationsGranted === 'boolean'
            ? dto.notificationsGranted
            : current.notifications.granted,
        enabled:
          typeof dto.notificationsEnabled === 'boolean'
            ? dto.notificationsEnabled
            : current.notifications.enabled,
      },
      camera: {
        granted:
          typeof dto.cameraGranted === 'boolean'
            ? dto.cameraGranted
            : current.camera.granted,
        enabled:
          typeof dto.cameraEnabled === 'boolean'
            ? dto.cameraEnabled
            : current.camera.enabled,
      },
      gallery: {
        granted:
          typeof dto.galleryGranted === 'boolean'
            ? dto.galleryGranted
            : current.gallery.granted,
        enabled:
          typeof dto.galleryEnabled === 'boolean'
            ? dto.galleryEnabled
            : current.gallery.enabled,
      },
    };

    if (!nextPermissions.notifications.granted) {
      nextPermissions.notifications.enabled = false;
    }

    if (!nextPermissions.camera.granted) {
      nextPermissions.camera.enabled = false;
    }

    if (!nextPermissions.gallery.granted) {
      nextPermissions.gallery.enabled = false;
    }

    await this.usersCollection.doc(uid).set(
      {
        settings: {
          permissions: nextPermissions,
        },
      },
      { merge: true },
    );

    return nextPermissions;
  }
}