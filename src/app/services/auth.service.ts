import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {
    this.checkStoredSession();
  }

  private checkStoredSession() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .eq('active', true)
        .single();

      if (error || !data) {
        return { data: null, error: { message: 'Email ou senha inválidos' } };
      }

      // Store user session
      localStorage.setItem('currentUser', JSON.stringify(data));
      localStorage.setItem('company_id', data.company_id);
      console.log('✅ Company ID salvo no localStorage:', data.company_id);
      this.currentUserSubject.next(data as User);

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: 'Email ou senha inválidos' } };
    }
  }

  async signUp(email: string, password: string, userData: Partial<User>) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert({
          email: email,
          password: password,
          ...userData
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async signOut() {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('company_id');
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  isAdmin(): boolean {
    return this.hasRole(['admin']);
  }

  isGestor(): boolean {
    return this.hasRole(['admin', 'gestor']);
  }

  async resetPassword(email: string) {
    // Implementar lógica customizada de reset
    return { error: null };
  }

  async updatePassword(userId: string, newPassword: string) {
    try {
      const { error } = await this.supabase
        .from('users')
        .update({ password: newPassword })
        .eq('id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }
}
