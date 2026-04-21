import { Injectable } from '@nestjs/common';

@Injectable()
export class UiConfigService {
  getMenu(user: { role?: string }) {
    const role = user?.role ?? 'student';

    const tabs = [
      { key: 'Home', label: 'Inicio', icon: 'home-outline', visible: true },
      { key: 'ScanQR', label: 'QR', icon: 'qr-code-outline', visible: true },
      { key: 'Mision', label: 'Misiones', icon: 'map-outline', visible: true },
      { key: 'Logros', label: 'Logros', icon: 'trophy-outline', visible: true },
      { key: 'Ranking', label: 'Ranking', icon: 'bar-chart-outline', visible: true },
      { key: 'Progreso', label: 'Progreso', icon: 'stats-chart-outline', visible: true },
      { key: 'Mapa', label: 'Mapa', icon: 'map', visible: true },
    ];

    return { tabs };
  }
}