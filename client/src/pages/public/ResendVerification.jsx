import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '@/components/common/Logo';
import { authService } from '@/services/auth.service';

export default function ResendVerification() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resendVerification(email);
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
              <h1 className="mt-4 text-xl font-bold text-ink">Verification email sent</h1>
              <p className="mt-2 text-ink-soft">
                If <strong>{email}</strong> is registered and unverified, a fresh link is on its way.
                The link is valid for 24 hours.
              </p>
              <Link to="/login" className="btn-primary mt-6 inline-block">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h1 className="text-2xl font-extrabold text-ink">Resend verification email</h1>
              <p className="text-sm text-ink-soft">Enter your email and we'll send a new verification link.</p>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <button className="btn-primary w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Resend link'}
              </button>
              <p className="text-center text-sm text-ink-soft">
                <Link to="/login" className="font-semibold text-brand">Back to login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
