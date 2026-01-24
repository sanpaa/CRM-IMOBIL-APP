import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Visit } from '../models/visit.model';
import { AuthService } from 'src/app/services/auth.service';

export interface GoogleCalendarStatus {
  connected: boolean;
  email?: string;
  calendarId?: string;
  lastSyncAt?: string;
}

export interface GoogleCalendarConnectResponse {
  authUrl?: string;
  url?: string;
  authorizationUrl?: string;
  message?: string;
}

export interface GoogleCalendarSyncPayload {
  title?: string;
  details?: string;
  start?: string;
  end?: string;
  timezone?: string;
  durationMinutes?: number;
  calendarId?: string;
}

export interface GoogleCalendarSyncResponse {
  success?: boolean;
  eventId?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private readonly apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  async getStatus(): Promise<GoogleCalendarStatus> {
    return firstValueFrom(this.http.get<GoogleCalendarStatus>(`${this.apiUrl}/google/status`));
  }

  async connect(): Promise<GoogleCalendarConnectResponse> {
    return firstValueFrom(this.http.post<GoogleCalendarConnectResponse>(`${this.apiUrl}/google/connect`, {}));
  }

  async disconnect(): Promise<void> {
    await firstValueFrom(this.http.post(`${this.apiUrl}/google/disconnect`, {}));
  }

  async syncVisit(visitId: string, payload: GoogleCalendarSyncPayload): Promise<GoogleCalendarSyncResponse> {
    return firstValueFrom(this.http.post<GoogleCalendarSyncResponse>(`${this.apiUrl}/visits/${visitId}/sync`, payload));
  }

  async syncVisitFromVisit(
    visit: Visit,
    overrides: Partial<GoogleCalendarSyncPayload> = {}
  ): Promise<GoogleCalendarSyncResponse> {
    const payload = {
      ...this.buildDefaultPayload(visit),
      ...overrides
    };
    return this.syncVisit(visit.id, payload);
  }

  getCalendarIdOverride(): string | null {
    const key = this.getCalendarStorageKey();
    if (!key) return null;
    return localStorage.getItem(key);
  }

  setCalendarIdOverride(value: string | null) {
    const key = this.getCalendarStorageKey();
    if (!key) return;
    const cleaned = (value || '').trim();
    if (!cleaned) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, cleaned);
  }

  private buildDefaultPayload(visit: Visit): GoogleCalendarSyncPayload {
    const start = this.parseVisitDateTime(visit);
    if (!start) {
      throw new Error('Invalid visit date/time');
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const calendarId = this.getCalendarIdOverride() || undefined;

    return {
      title: visit.notes ? `Visita: ${visit.notes}` : 'Visita agendada',
      details: this.buildCalendarDetails(visit),
      start: this.formatLocalIso(start),
      end: this.formatLocalIso(end),
      timezone,
      durationMinutes: 60,
      calendarId
    };
  }

  private parseVisitDateTime(visit: Visit): Date | null {
    if (!visit.visit_date || !visit.visit_time) return null;
    const [year, month, day] = visit.visit_date.split('-').map(Number);
    if (!year || !month || !day) return null;

    const timeParts = visit.visit_time.split(':').map(part => Number(part));
    const hour = timeParts[0];
    const minute = timeParts[1] ?? 0;
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;

    const date = new Date(year, month - 1, day, hour, minute, 0, 0);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  }

  private buildCalendarDetails(visit: Visit): string {
    const lines: string[] = [];
    if (visit.status) lines.push(`Status: ${visit.status}`);
    if (visit.property_id) lines.push(`Imovel: ${visit.property_id}`);
    if (visit.client_id) lines.push(`Cliente: ${visit.client_id}`);
    lines.push(`Visita ID: ${visit.id}`);
    return lines.join('\n');
  }

  private formatLocalIso(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join('-') + 'T' + [
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds())
    ].join(':');
  }

  private getCalendarStorageKey(): string | null {
    const user = this.authService.getCurrentUser();
    if (!user?.id) return null;
    return `google_calendar_calendar_id:${user.id}`;
  }
}
