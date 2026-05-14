import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/api';

interface User {
  id: number;
  email: string;
  name: string;
  lastname: string;
  phone?: string;
  image?: string;
  isActive: boolean;
  roles: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  validateToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      setAuth: (user, token) => {
        localStorage.setItem('admin_token', token);
        set({ user, token, isAuthenticated: true, isLoading: false });
      },
      logout: () => {
        localStorage.removeItem('admin_token');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },
      validateToken: async () => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return false;
        }
        try {
          const response = await authService.getMe();
          if (response.success && response.data) {
            set({
              user: {
                id: response.data.id,
                email: response.data.email,
                name: response.data.name,
                lastname: response.data.lastname,
                isActive: response.data.isActive ?? true,
                roles: response.data.roles,
              },
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          set({ isLoading: false, isAuthenticated: false });
          return false;
        } catch {
          localStorage.removeItem('admin_token');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          return false;
        }
      },
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const storedToken = localStorage.getItem('admin_token');
          if (storedToken) {
            state.isAuthenticated = true;
          } else {
            state.isLoading = false;
          }
        }
      },
    }
  )
);