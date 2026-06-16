import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from './Logo';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout({ children, nav = [] }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link key={item.to} to={item.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition
                  ${location.pathname === item.to ? 'bg-orange-50 text-brand' : 'text-ink hover:bg-surface'}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-soft sm:inline">{user?.name}</span>
            <button onClick={handleLogout} className="btn-ghost px-3 py-1.5 text-sm">Log out</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
