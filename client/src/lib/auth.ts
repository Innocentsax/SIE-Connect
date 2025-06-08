import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
  profileCompleted: boolean | null;
  onboardingCompleted: boolean | null;
  company: string | null;
  sector: string | null;
  location: string | null;
  description: string | null;
  website: string | null;
  socialImpactFocus: string | null;
  fundingStage: string | null;
  investmentFocus: string | null;
  investmentRange: string | null;
}

interface AuthStore {
  user: User | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set, get) => ({
  user: null,
  sessionId: localStorage.getItem('sessionId'),
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('sessionId', data.sessionId);
        set({
          user: data.user,
          sessionId: data.sessionId,
          isAuthenticated: true,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },

  register: async (email: string, password: string, name: string, role: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('sessionId', data.sessionId);
        set({
          user: data.user,
          sessionId: data.sessionId,
          isAuthenticated: true,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  },

  logout: async () => {
    const { sessionId } = get();
    if (sessionId) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${sessionId}` },
        });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
    
    localStorage.removeItem('sessionId');
    set({
      user: null,
      sessionId: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) return;

    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${sessionId}` },
      });

      if (response.ok) {
        const data = await response.json();
        set({
          user: data.user,
          sessionId,
          isAuthenticated: true,
        });
      } else {
        localStorage.removeItem('sessionId');
        set({
          user: null,
          sessionId: null,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  },
}));
