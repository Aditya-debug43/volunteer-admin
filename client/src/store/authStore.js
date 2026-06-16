import { create } from 'zustand';

// Access token is held in memory only (never localStorage) per the security spec.
// The refresh token lives in an HTTP-only cookie managed by the server.
export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  volunteer: null,
  isReady: false, // becomes true after the initial /me bootstrap

  setAccessToken: (accessToken) => set({ accessToken }),
  setAuth: ({ accessToken, user, volunteer }) =>
    set((s) => ({
      accessToken: accessToken ?? s.accessToken,
      user: user ?? s.user,
      volunteer: volunteer !== undefined ? volunteer : s.volunteer,
    })),
  setReady: (isReady) => set({ isReady }),
  logout: () => set({ accessToken: null, user: null, volunteer: null }),
}));
