import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Visit } from '../../models/visit.model';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isHoliday: boolean;
  holidayName?: string;
  visits: Visit[];
}

@Component({
  selector: 'app-visit-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar-container">
      <!-- Filter Buttons -->
      <div class="filter-buttons">
        <button 
          [class.active]="currentView === 'day'" 
          (click)="setView('day')" 
          class="filter-btn">
          Dia
        </button>
        <button 
          [class.active]="currentView === 'week'" 
          (click)="setView('week')" 
          class="filter-btn">
          Semana
        </button>
        <button 
          [class.active]="currentView === 'month'" 
          (click)="setView('month')" 
          class="filter-btn">
          Mês
        </button>
      </div>

      <!-- Calendar Header -->
      <div class="calendar-header">
        <button (click)="previousPeriod()" class="nav-btn">‹</button>
        <h2>{{ getHeaderText() }}</h2>
        <button (click)="nextPeriod()" class="nav-btn">›</button>
      </div>

      <!-- Month View -->
      <div *ngIf="currentView === 'month'" class="calendar-grid">
        <div class="calendar-weekdays">
          <div *ngFor="let day of weekDays" class="weekday">{{ day }}</div>
        </div>
        <div class="calendar-days">
          <div 
            *ngFor="let day of calendarDays" 
            [class.other-month]="!day.isCurrentMonth"
            [class.today]="day.isToday"
            [class.has-visits]="day.visits.length > 0"
            class="calendar-day">
            <div class="day-number">{{ day.day }}</div>
            <div *ngIf="day.isHoliday" class="holiday-badge" [title]="day.holidayName">
              🎉 {{ day.holidayName }}
            </div>
            <div class="visit-indicators">
              <span 
                *ngFor="let visit of day.visits.slice(0, 3)" 
                [class]="'visit-dot visit-' + (visit.status || 'agendada')"
                [title]="visit.visit_time">
              </span>
              <span *ngIf="day.visits.length > 3" class="more-indicator">
                +{{ day.visits.length - 3 }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Week View -->
      <div *ngIf="currentView === 'week'" class="week-view">
        <div *ngFor="let day of getWeekDays()" class="week-day-card">
          <div class="week-day-header">
            <span class="week-day-name">{{ getDayName(day.date) }}</span>
            <span class="week-day-number" [class.today]="day.isToday">{{ day.day }}</span>
            <div *ngIf="day.isHoliday" class="holiday-label">{{ day.holidayName }}</div>
          </div>
          <div class="week-day-visits">
            <div *ngFor="let visit of day.visits" class="visit-item">
              <span class="visit-time">{{ visit.visit_time }}</span>
              <span [class]="'visit-badge visit-' + (visit.status || 'agendada')">
                {{ visit.status || 'agendada' }}
              </span>
            </div>
            <div *ngIf="day.visits.length === 0" class="no-visits">
              Sem visitas
            </div>
          </div>
        </div>
      </div>

      <!-- Day View -->
      <div *ngIf="currentView === 'day'" class="day-view">
        <div class="day-view-header">
          <h3>{{ getDayViewDate() }}</h3>
          <div *ngIf="getTodayInfo().isHoliday" class="holiday-alert">
            🎉 {{ getTodayInfo().holidayName }}
          </div>
        </div>
        <div class="day-view-visits">
          <div *ngFor="let visit of getTodayVisits()" class="day-visit-card">
            <div class="visit-time-large">{{ visit.visit_time }}</div>
            <div class="visit-details">
              <span [class]="'visit-badge visit-' + (visit.status || 'agendada')">
                {{ visit.status || 'agendada' }}
              </span>
              <p *ngIf="visit.notes" class="visit-notes">{{ visit.notes }}</p>
            </div>
          </div>
          <div *ngIf="getTodayVisits().length === 0" class="no-visits-large">
            Nenhuma visita agendada para este dia
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      background: var(--color-bg-secondary);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid var(--color-border-light);
    }

    .filter-buttons {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--color-border-light);
    }

    .filter-btn {
      padding: 0.5rem 1.5rem;
      border: 2px solid var(--color-border-light);
      background: var(--color-bg-secondary);
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      color: var(--color-text-primary);
      transition: all 0.2s ease;
    }

    .filter-btn:hover {
      border-color: var(--color-primary);
      background: var(--color-bg-tertiary);
    }

    .filter-btn.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: transparent;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .calendar-header h2 {
      margin: 0;
      color: var(--color-text-primary);
      font-size: 1.5rem;
      font-weight: 700;
    }

    .nav-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: var(--color-bg-tertiary);
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.5rem;
      color: var(--color-text-secondary);
      transition: all 0.2s ease;
    }

    .nav-btn:hover {
      background: var(--color-bg-secondary);
      color: var(--color-text-primary);
    }

    .calendar-grid {
      display: flex;
      flex-direction: column;
    }

    .calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .weekday {
      text-align: center;
      font-weight: 600;
      color: var(--color-text-secondary);
      font-size: 0.85rem;
      padding: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.5rem;
    }

    .calendar-day {
      min-height: 70px;
      padding: 0.5rem;
      border: 1px solid var(--color-border-light);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      font-size: 0.875rem;
    }

    .calendar-day:hover {
      border-color: var(--color-primary);
      box-shadow: 0 2px 8px rgba(29, 78, 216, 0.2);
    }

    .calendar-day.other-month {
      opacity: 0.3;
    }

    .calendar-day.today {
      background: var(--color-bg-tertiary);
      border-color: var(--color-primary);
    }

    .calendar-day.has-visits {
      background: var(--color-bg-tertiary);
    }

    .day-number {
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 0.25rem;
      font-size: 0.875rem;
    }

    .holiday-badge {
      font-size: 0.7rem;
      color: var(--color-danger);
      background: var(--color-danger-light);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .visit-indicators {
      display: flex;
      gap: 0.2rem;
      flex-wrap: wrap;
      margin-top: 0.25rem;
    }

    .visit-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
    }

    .visit-agendada { background: #06b6d4; }
    .visit-confirmada { background: #10b981; }
    .visit-realizada { background: #64748b; }
    .visit-cancelada { background: #ef4444; }

    .more-indicator {
      font-size: 0.7rem;
      color: var(--color-text-secondary);
      font-weight: 600;
    }

    /* Week View */
    .week-view {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1rem;
    }

    .week-day-card {
      border: 2px solid var(--color-border-light);
      border-radius: 8px;
      overflow: hidden;
    }

    .week-day-header {
      background: var(--color-bg-tertiary);
      padding: 1rem;
      text-align: center;
      border-bottom: 2px solid var(--color-border-light);
    }

    .week-day-name {
      display: block;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    }

    .week-day-number {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .week-day-number.today {
      color: var(--color-primary);
    }

    .holiday-label {
      font-size: 0.7rem;
      color: var(--color-danger);
      margin-top: 0.25rem;
    }

    .week-day-visits {
      padding: 0.5rem;
      min-height: 80px;
    }

    .visit-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: var(--color-bg-tertiary);
      border-radius: 6px;
      margin-bottom: 0.5rem;
    }

    .visit-time {
      font-weight: 600;
      color: var(--color-text-secondary);
      font-size: 0.85rem;
    }

    .visit-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      color: white;
      text-transform: uppercase;
    }

    .no-visits {
      text-align: center;
      color: var(--color-text-tertiary);
      font-size: 0.85rem;
      padding: 2rem 0.5rem;
      font-style: italic;
    }

    /* Day View */
    .day-view {
      padding: 1rem 0;
    }

    .day-view-header {
      margin-bottom: 1.5rem;
    }

    .day-view-header h3 {
      margin: 0 0 0.5rem 0;
      color: var(--color-text-primary);
      font-size: 1.25rem;
      font-weight: 700;
    }

    .holiday-alert {
      padding: 0.75rem 1rem;
      background: var(--color-danger-light);
      border: 1px solid var(--color-danger-light);
      border-radius: 8px;
      color: var(--color-danger);
      font-weight: 600;
    }

    .day-view-visits {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .day-visit-card {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      border: 2px solid var(--color-border-light);
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .day-visit-card:hover {
      border-color: var(--color-primary);
      box-shadow: 0 2px 8px rgba(29, 78, 216, 0.2);
    }

    .visit-time-large {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-primary);
      min-width: 80px;
    }

    .visit-details {
      flex: 1;
    }

    .visit-notes {
      margin: 0.5rem 0 0 0;
      color: var(--color-text-secondary);
      font-size: 0.9rem;
    }

    .no-visits-large {
      text-align: center;
      color: var(--color-text-tertiary);
      font-size: 1rem;
      padding: 3rem;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .calendar-days {
        grid-template-columns: repeat(7, 1fr);
        gap: 0.25rem;
      }

      .calendar-day {
        min-height: 60px;
        padding: 0.5rem;
        font-size: 0.8rem;
      }

      .week-view {
        grid-template-columns: 1fr;
      }

      .filter-buttons {
        flex-wrap: wrap;
      }
    }
  `]
})
export class VisitCalendarComponent implements OnInit, OnChanges {
  @Input() visits: Visit[] = [];
  @Output() viewChange = new EventEmitter<'day' | 'week' | 'month'>();
  @Output() dateChange = new EventEmitter<Date>();

  currentDate: Date = new Date();
  currentView: 'day' | 'week' | 'month' = 'month';
  calendarDays: CalendarDay[] = [];
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Brazilian Holidays 2024-2025
  // TODO: Consider implementing a more dynamic system or external configuration
  // to avoid manual updates each year. For now, update this object annually.
  holidays: { [key: string]: string } = {
    '2024-01-01': 'Ano Novo',
    '2024-02-13': 'Carnaval',
    '2024-03-29': 'Sexta-feira Santa',
    '2024-04-21': 'Tiradentes',
    '2024-05-01': 'Dia do Trabalho',
    '2024-05-30': 'Corpus Christi',
    '2024-09-07': 'Independência do Brasil',
    '2024-10-12': 'Nossa Senhora Aparecida',
    '2024-11-02': 'Finados',
    '2024-11-15': 'Proclamação da República',
    '2024-12-25': 'Natal',
    '2025-01-01': 'Ano Novo',
    '2025-03-04': 'Carnaval',
    '2025-04-18': 'Sexta-feira Santa',
    '2025-04-21': 'Tiradentes',
    '2025-05-01': 'Dia do Trabalho',
    '2025-06-19': 'Corpus Christi',
    '2025-09-07': 'Independência do Brasil',
    '2025-10-12': 'Nossa Senhora Aparecida',
    '2025-11-02': 'Finados',
    '2025-11-15': 'Proclamação da República',
    '2025-12-25': 'Natal'
  };

  ngOnInit() {
    this.generateCalendar();
  }

  ngOnChanges() {
    this.generateCalendar();
  }

  setView(view: 'day' | 'week' | 'month') {
    this.currentView = view;
    this.viewChange.emit(view);
    this.generateCalendar();
  }

  previousPeriod() {
    switch (this.currentView) {
      case 'day':
        this.currentDate.setDate(this.currentDate.getDate() - 1);
        break;
      case 'week':
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        break;
      case 'month':
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        break;
    }
    this.currentDate = new Date(this.currentDate);
    this.dateChange.emit(this.currentDate);
    this.generateCalendar();
  }

  nextPeriod() {
    switch (this.currentView) {
      case 'day':
        this.currentDate.setDate(this.currentDate.getDate() + 1);
        break;
      case 'week':
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        break;
      case 'month':
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        break;
    }
    this.currentDate = new Date(this.currentDate);
    this.dateChange.emit(this.currentDate);
    this.generateCalendar();
  }

  getHeaderText(): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    switch (this.currentView) {
      case 'day':
        return `${this.currentDate.getDate()} de ${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
      case 'week':
        const weekStart = this.getWeekStart();
        const weekEnd = this.getWeekEnd();
        return `${weekStart.getDate()} - ${weekEnd.getDate()} de ${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
      case 'month':
        return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }
  }

  generateCalendar() {
    this.calendarDays = [];
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();
    
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      this.calendarDays.push(this.createCalendarDay(date, true));
    }
    
    // Next month days
    const remainingDays = 42 - this.calendarDays.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }
  }

  createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const dateStr = this.formatDate(date);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isHoliday = this.holidays.hasOwnProperty(dateStr);
    const holidayName = this.holidays[dateStr];
    
    const dayVisits = this.visits.filter(visit => {
      const visitDate = new Date(visit.visit_date);
      return visitDate.toDateString() === date.toDateString();
    });
    
    return {
      date,
      day: date.getDate(),
      isCurrentMonth,
      isToday,
      isHoliday,
      holidayName,
      visits: dayVisits
    };
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getWeekStart(): Date {
    const date = new Date(this.currentDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  }

  getWeekEnd(): Date {
    const start = this.getWeekStart();
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  }

  getWeekDays(): CalendarDay[] {
    const weekStart = this.getWeekStart();
    const days: CalendarDay[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(this.createCalendarDay(date, true));
    }
    
    return days;
  }

  getDayName(date: Date): string {
    return this.weekDays[date.getDay()];
  }

  getTodayInfo(): CalendarDay {
    return this.createCalendarDay(this.currentDate, true);
  }

  getTodayVisits(): Visit[] {
    return this.visits.filter(visit => {
      const visitDate = new Date(visit.visit_date);
      return visitDate.toDateString() === this.currentDate.toDateString();
    });
  }

  getDayViewDate(): string {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return `${days[this.currentDate.getDay()]}, ${this.currentDate.getDate()} de ${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }
}
