import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

const ADMIN_ROLES = ['admin', 'super_admin', 'city_coordinator'];

export default function AdminLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login(form.email, form.password);
      // Guard: this entrance is for staff only.
      if (!ADMIN_ROLES.includes(data.user.role)) {
        logout();
        try { await authService.logout(); } catch { /* ignore */ }
        toast.error('This is the staff login. Please use the volunteer login.');
        return;
      }
      setAuth({ accessToken: data.accessToken, user: data.user });
      toast.success(`Welcome, ${data.user.name.split(' ')[0]}`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-white">NayePankh Admin Console</h1>
          <p className="mt-1 text-sm text-white/50">Staff &amp; coordinator access only</p>
        </div>

        <form onSubmit={submit} className="rounded-card border border-white/10 bg-white p-8 shadow-xl">
          <div className="space-y-4">
            <div>
              <label className="label">Work email</label>
              <input className="input" type="email" required autoComplete="username"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-sm font-medium text-brand hover:underline">Forgot?</Link>
              </div>
              <input className="input mt-1.5" type="password" required autoComplete="current-password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to console'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Volunteer login
          </Link>
        </div>
      </div>
    </div>
  );
}
