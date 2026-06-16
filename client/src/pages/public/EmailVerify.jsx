import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import Logo from '@/components/common/Logo';
import Spinner from '@/components/common/Spinner';

export default function EmailVerify() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, ok: false, message: '' });
  // Guards against React StrictMode running the effect twice in development,
  // which would otherwise fire a second request against an already-used token.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    authService
      .verifyEmail(token)
      .then((res) => setState({ loading: false, ok: true, message: res.message }))
      .catch((err) =>
        setState({ loading: false, ok: false, message: err.response?.data?.message || 'Verification failed' })
      );
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center"><Logo withTagline /></div>
        <div className="card">
          {state.loading ? (
            <>
              <Spinner />
              <p className="text-ink-soft">Verifying your email…</p>
            </>
          ) : (
            <>
              <div className="text-5xl">{state.ok ? '🎉' : '⚠️'}</div>
              <h1 className="mt-4 text-xl font-bold text-ink">
                {state.ok ? 'Email verified!' : 'Something went wrong'}
              </h1>
              <p className="mt-2 text-ink-soft">{state.message}</p>
              <div className="mt-6 flex flex-col gap-2">
                <Link to="/login" className="btn-primary inline-block">Go to login</Link>
                {!state.ok && (
                  <Link to="/resend-verification" className="text-sm font-medium text-brand">
                    Resend verification email
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
