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
    this.initAuthListener();
  }

  private initAuthListener() {
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async loadUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      this.currentUserSubject.next(data as User);
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.currentUserSubject.next(null);
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      if (data.user) {
        await this.loadUserProfile(data.user.id);
      }

      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async signUp(email: string, password: string, userData: Partial<User>) {
    try {
      // First create auth user
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password
      });

      if (authError) throw authError;

      // Then create user profile
      if (authData.user) {
        const { error: profileError } = await this.supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: email,
            ...userData
          });

        if (profileError) throw profileError;
      }

      return { data: authData, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      
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
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }

  async updatePassword(newPassword: string) {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }
}
