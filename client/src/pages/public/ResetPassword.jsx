import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '@/components/common/Logo';
import { authService } from '@/services/auth.service';
import { passwordStrength } from '@/utils/validators';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authService.resetPassword(token, form.password);
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  const pw = passwordStrength(form.password);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo withTagline /></div>
        <form onSubmit={submit} className="card space-y-4">
          <h1 className="text-2xl font-extrabold text-ink">Set a new password</h1>
          <div>
            <label className="label">New password</label>
            <input className="input" type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min 8 chars, 1 number, 1 special character" />
            {form.password && (
              <div className="mt-1.5">
                <div className="h-1.5 w-full rounded bg-line">
                  <div className={`h-full rounded ${pw.color}`} style={{ width: pw.width }} />
                </div>
                <span className="text-xs text-ink-soft">{pw.label}</span>
              </div>
            )}
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input className="input" type="password" required value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
          <p className="text-center text-sm text-ink-soft">
            <Link to="/login" className="font-semibold text-brand">Back to login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
