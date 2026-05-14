import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '../app/session';
import { api } from '../lib/api';
import { formatPhoneInput, isStrongPassword, toBackendPhone } from '../lib/forms';
import { usePageMeta } from '../lib/dom';

function normalizeReturnTarget(raw: string | null): string {
  const fallback = '/doctors';
  if (!raw) return fallback;
  if (/^(https?:)?\/\//i.test(raw)) return fallback;

  const trimmed = raw.replace(/^\/+/, '');
  const [withPathOnly, queryString = ''] = trimmed.split('?');
  const [pathname] = withPathOnly.split('#');

  const routeMap: Record<string, string> = {
    'index.html': '/',
    'clinic.html': '/clinic',
    'doctors.html': '/doctors',
    'doctor.html': '/doctor',
    'academy.html': '/academy',
    'videos.html': '/videos',
    'about.html': '/about',
    'faq.html': '/faq',
    'auth.html': '/auth',
    'admin.html': '/admin',
    'laboratory.html': '/laboratory',
    'store.html': '/store'
  };

  const normalizedPath = routeMap[pathname] || (pathname.startsWith('/') ? pathname : `/${pathname}`);
  return `${normalizedPath}${queryString ? `?${queryString}` : ''}`;
}

export function AuthPage() {
  usePageMeta('Integrat — Login & Registration');
  const { applyAuthResponse } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTarget = useMemo(() => normalizeReturnTarget(searchParams.get('returnTo')), [searchParams]);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loginState, setLoginState] = useState({ email: '', password: '' });
  const [registerState, setRegisterState] = useState({
    name: '',
    phone: '+7',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({ login: '', register: '' });

  function redirectAfterAuth() {
    navigate(returnTarget);
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors((current) => ({ ...current, login: '' }));
    setSubmitting(true);

    try {
      const response = await api.clinicLogin(loginState.email.trim(), loginState.password);
      applyAuthResponse(response);
      redirectAfterAuth();
    } catch (error) {
      setErrors((current) => ({
        ...current,
        login: error instanceof Error ? error.message : 'Login failed.'
      }));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors((current) => ({ ...current, register: '' }));

    if (registerState.password !== registerState.confirmPassword) {
      setErrors((current) => ({ ...current, register: 'Passwords do not match.' }));
      return;
    }

    if (!isStrongPassword(registerState.password)) {
      setErrors((current) => ({
        ...current,
        register: 'Use at least 8 characters with uppercase, lowercase, number, and symbol.'
      }));
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.clinicRegister({
        name: registerState.name.trim(),
        phone: toBackendPhone(registerState.phone),
        email: registerState.email.trim(),
        password: registerState.password
      });
      applyAuthResponse(response);
      redirectAfterAuth();
    } catch (error) {
      setErrors((current) => ({
        ...current,
        register: error instanceof Error ? error.message : 'Registration failed.'
      }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">INTEGRAT</div>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')} type="button">
            Login
          </button>
          <button
            className={`auth-tab${tab === 'register' ? ' active' : ''}`}
            onClick={() => setTab('register')}
            type="button"
          >
            Register
          </button>
        </div>

        <form className={`auth-form${tab === 'login' ? ' active' : ''}`} id="loginForm" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              className="form-input"
              name="email"
              onChange={(event) => setLoginState((state) => ({ ...state, email: event.target.value }))}
              placeholder="name@example.com"
              required
              type="email"
              value={loginState.email}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              className="form-input"
              name="password"
              onChange={(event) => setLoginState((state) => ({ ...state, password: event.target.value }))}
              placeholder="••••••••"
              required
              type="password"
              value={loginState.password}
            />
          </div>
          <div className="error-message">{errors.login}</div>
          <button className="auth-btn" disabled={submitting} type="submit">
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <form className={`auth-form${tab === 'register' ? ' active' : ''}`} id="registerForm" onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              className="form-input"
              name="name"
              onChange={(event) => setRegisterState((state) => ({ ...state, name: event.target.value }))}
              placeholder="Your full name"
              required
              type="text"
              value={registerState.name}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              className="form-input"
              name="phone"
              onChange={(event) =>
                setRegisterState((state) => ({
                  ...state,
                  phone: formatPhoneInput(event.target.value)
                }))
              }
              placeholder="+7 (___) ___ __ - __"
              required
              type="tel"
              value={registerState.phone}
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              className="form-input"
              name="email"
              onChange={(event) => setRegisterState((state) => ({ ...state, email: event.target.value }))}
              placeholder="name@example.com"
              required
              type="email"
              value={registerState.email}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              className="form-input"
              name="password"
              onChange={(event) => setRegisterState((state) => ({ ...state, password: event.target.value }))}
              placeholder="Min. 8 characters"
              required
              type="password"
              value={registerState.password}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              className="form-input"
              name="confirmPassword"
              onChange={(event) => setRegisterState((state) => ({ ...state, confirmPassword: event.target.value }))}
              placeholder="••••••••"
              required
              type="password"
              value={registerState.confirmPassword}
            />
          </div>
          <div className="error-message">{errors.register}</div>
          <button className="auth-btn" disabled={submitting} type="submit">
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Back to <Link to="/">Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
