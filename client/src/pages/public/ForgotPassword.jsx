import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '@/components/common/Logo';
import { authService } from '@/services/auth.service';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo withTagline /></div>
        <div className="card">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl">📧</div>
              <h1 className="mt-4 text-xl font-bold text-ink">Check your inbox</h1>
              <p className="mt-2 text-ink-soft">
                If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                It expires in 1 hour.
              </p>
              <Link to="/login" className="btn-primary mt-6 inline-block">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h1 className="text-2xl font-extrabold text-ink">Forgot your password?</h1>
              <p className="text-sm text-ink-soft">
                Enter the email you registered with and we'll send you a reset link.
              </p>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <button className="btn-primary w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
              <p className="text-center text-sm text-ink-soft">
                Remembered it? <Link to="/login" className="font-semibold text-brand">Back to login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
