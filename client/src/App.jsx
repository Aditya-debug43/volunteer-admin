import { Routes, Route } from 'react-router-dom';
import { useAuthBootstrap } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/common/ProtectedRoute';

// Public pages
import Home from '@/pages/public/Home';
import Register from '@/pages/public/Register';
import Login from '@/pages/public/Login';
import EmailVerify from '@/pages/public/EmailVerify';
import ForgotPassword from '@/pages/public/ForgotPassword';
import ResetPassword from '@/pages/public/ResetPassword';
import ResendVerification from '@/pages/public/ResendVerification';

// Volunteer pages
import VolunteerDashboard from '@/pages/volunteer/VolunteerDashboard';
import Profile from '@/pages/volunteer/Profile';
import MyActivity from '@/pages/volunteer/MyActivity';

// Admin pages
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import VolunteerManagement from '@/pages/admin/VolunteerManagement';
import EventManagement from '@/pages/admin/EventManagement';
import Reports from '@/pages/admin/Reports';

export default function App() {
  useAuthBootstrap();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email/:token" element={<EmailVerify />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/resend-verification" element={<ResendVerification />} />

      {/* Admin login (public) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Volunteer */}
      <Route
        path="/volunteer/dashboard"
        element={
          <ProtectedRoute roles={['volunteer']}>
            <VolunteerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/profile"
        element={
          <ProtectedRoute roles={['volunteer']}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/activity"
        element={
          <ProtectedRoute roles={['volunteer']}>
            <MyActivity />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={['admin', 'super_admin', 'city_coordinator']} loginPath="/admin/login">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/volunteers"
        element={
          <ProtectedRoute roles={['admin', 'super_admin', 'city_coordinator']} loginPath="/admin/login">
            <VolunteerManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute roles={['admin', 'super_admin', 'city_coordinator']} loginPath="/admin/login">
            <EventManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute roles={['admin', 'super_admin', 'city_coordinator']} loginPath="/admin/login">
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
