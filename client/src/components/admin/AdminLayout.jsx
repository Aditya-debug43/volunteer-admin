import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, CalendarDays, FileBarChart, LogOut, Menu, X, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { SITE_IMAGES } from '@/constants/images';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/volunteers', label: 'Volunteers', icon: Users },
  { to: '/admin/events', label: 'Events', icon: CalendarDays },
  { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
];

const ROLE_LABEL = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  city_coordinator: 'City Coordinator',
};

export default function AdminLayout({ title, actions, children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    logout();
    toast.success('Logged out');
    navigate('/admin/login');
  };

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-5">
        <img src={SITE_IMAGES.logo} alt="" className="h-9 w-9 rounded-full bg-white object-contain p-0.5"
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <div>
          <p className="font-extrabold leading-none text-white">NayePankh</p>
          <p className="text-[11px] text-white/50">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition
                ${active ? 'bg-brand text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.name || 'Admin'}</p>
            <p className="flex items-center gap-1 text-[11px] text-white/50">
              <ShieldCheck className="h-3 w-3" />{ROLE_LABEL[user?.role] || 'Admin'}
              {user?.assignedCity ? ` · ${user.assignedCity}` : ''}
            </p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white">
          <LogOut className="h-[18px] w-[18px]" /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 bg-ink md:block">{SidebarInner}</aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-60 bg-ink md:hidden">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-4 text-white/60">
              <X className="h-5 w-5" />
            </button>
            {SidebarInner}
          </aside>
        </>
      )}

      {/* Main */}
      <div className="md:pl-60">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white/90 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setOpen(true)}><Menu className="h-6 w-6 text-ink" /></button>
            <h1 className="text-lg font-extrabold text-ink sm:text-xl">{title}</h1>
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
        <main className="p-5 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
