import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import api from '@/services/api';

// Bootstraps auth on app load: tries to refresh the session, then loads the user.
export function useAuthBootstrap() {
  const { setAccessToken, setAuth, setReady } = useAuthStore();
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.accessToken);
        const me = await authService.me();
        setAuth({ user: me.user, volunteer: me.volunteer });
      } catch {
        // not logged in — that's fine
      } finally {
        setReady(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function useAuth() {
  return useAuthStore();
}
