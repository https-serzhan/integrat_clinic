import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatPhoneInput, isStrongPassword, toBackendPhone } from '../lib/forms';
import { useSession } from '../app/session';

export function AcademyAuthModal({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { applyAuthResponse } = useSession();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [feedback, setFeedback] = useState<{ message: string; error?: boolean }>({ message: '' });
  const [loginState, setLoginState] = useState({ email: '', password: '' });
  const [signupState, setSignupState] = useState({
    name: '',
    phone: '+7',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add('auth-modal-open');
    setFeedback({ message: '' });
    return () => {
      document.body.classList.remove('auth-modal-open');
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback({ message: '' });

    try {
      const response = await api.academyLogin(loginState.email.trim(), loginState.password);
      applyAuthResponse(response);
      onClose();
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : 'Login failed.',
        error: true
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback({ message: '' });

    if (signupState.password !== signupState.confirmPassword) {
      setFeedback({ message: 'Passwords do not match.', error: true });
      return;
    }

    if (!isStrongPassword(signupState.password)) {
      setFeedback({
        message: 'Use at least 8 characters with uppercase, lowercase, number, and symbol.',
        error: true
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.academySignup({
        name: signupState.name.trim(),
        phone: toBackendPhone(signupState.phone),
        email: signupState.email.trim(),
        password: signupState.password
      });
      applyAuthResponse(response);
      onClose();
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : 'Sign up failed.',
        error: true
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="academy-auth-modal"
      id="academyAuthModal"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="academy-auth-modal__dialog">
        <button className="academy-auth-modal__close" onClick={onClose} type="button">
          ×
        </button>

        <div className="academy-auth-modal__tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">
            Login
          </button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')} type="button">
            Sign Up
          </button>
        </div>

        {feedback.message ? (
          <p className={`academy-auth-modal__feedback${feedback.error ? ' is-error' : ''}`}>{feedback.message}</p>
        ) : (
          <p className="academy-auth-modal__feedback" />
        )}

        <form hidden={mode !== 'login'} onSubmit={handleLogin}>
          <label>
            Email
            <input
              name="email"
              onChange={(event) => setLoginState((state) => ({ ...state, email: event.target.value }))}
              required
              type="email"
              value={loginState.email}
            />
          </label>
          <label>
            Password
            <input
              name="password"
              onChange={(event) => setLoginState((state) => ({ ...state, password: event.target.value }))}
              required
              type="password"
              value={loginState.password}
            />
          </label>
          <button className="btn-black" disabled={submitting} type="submit">
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <form hidden={mode !== 'signup'} onSubmit={handleSignup}>
          <label>
            Full Name
            <input
              name="name"
              onChange={(event) => setSignupState((state) => ({ ...state, name: event.target.value }))}
              required
              type="text"
              value={signupState.name}
            />
          </label>
          <label>
            Phone
            <input
              name="phone"
              onChange={(event) =>
                setSignupState((state) => ({
                  ...state,
                  phone: formatPhoneInput(event.target.value)
                }))
              }
              required
              type="tel"
              value={signupState.phone}
            />
          </label>
          <label>
            Email
            <input
              name="email"
              onChange={(event) => setSignupState((state) => ({ ...state, email: event.target.value }))}
              required
              type="email"
              value={signupState.email}
            />
          </label>
          <label>
            Password
            <input
              name="password"
              onChange={(event) => setSignupState((state) => ({ ...state, password: event.target.value }))}
              required
              type="password"
              value={signupState.password}
            />
          </label>
          <label>
            Confirm Password
            <input
              name="confirmPassword"
              onChange={(event) => setSignupState((state) => ({ ...state, confirmPassword: event.target.value }))}
              required
              type="password"
              value={signupState.confirmPassword}
            />
          </label>
          <button className="btn-black" disabled={submitting} type="submit">
            {submitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
