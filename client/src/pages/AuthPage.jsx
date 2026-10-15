import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { api, messageFromError } from '../services/api';
import { setCredentials } from '../store/authSlice';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

// Replace these with your verified production demo account.
const DEMO_EMAIL = 'testuser@example.com';
const DEMO_PASSWORD = 'Test@1234';

export default function AuthPage({ mode = 'login' }) {
  const register = mode === 'register';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast, showToast, dismiss } = useToast();

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (register && password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setBusy(true);

    try {
      const { data } = await api.post(
        `/auth/${register ? 'register' : 'login'}`,
        register ? { name, email, password } : { email, password }
      );

      dispatch(setCredentials({ ...data, remember }));

      showToast(
        register ? 'Account created successfully.' : 'Welcome back!'
      );

      navigate(params.get('next') || '/dashboard', { replace: true });
    } catch (err) {
      setError(messageFromError(err));
    } finally {
      setBusy(false);
    }
  }

  function fillDemoCredentials() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
    setShowPassword(false);
  }

  const input =
    'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10';

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2 dark:bg-slate-950">
      {/* Left branding panel */}
      <div className="hidden flex-col justify-between bg-slate-950 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500">
            <CheckSquare size={23} />
          </div>
          <span className="text-xl font-extrabold">TaskFlow</span>
        </div>

        <div className="max-w-lg">
          <p className="mb-5 inline-flex rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-indigo-200">
            YOUR WORK, IN FOCUS
          </p>

          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
            Make room for work that matters.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            One calm workspace to organize tasks, track progress, and move
            projects forward.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              ['01', 'Capture'],
              ['02', 'Prioritize'],
              ['03', 'Complete'],
            ].map((item) => (
              <div
                key={item[0]}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-sm font-bold text-indigo-300">{item[0]}</p>
                <p className="mt-2 text-sm text-slate-300">{item[1]}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          TaskFlow · Task &amp; Team Management
        </p>
      </div>

      {/* Authentication panel */}
      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white">
              <CheckSquare />
            </div>
            <span className="text-xl font-extrabold dark:text-white">
              TaskFlow
            </span>
          </div>

          <p className="text-sm font-bold uppercase tracking-[.18em] text-indigo-600">
            {register ? 'GET STARTED' : 'WELCOME BACK'}
          </p>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight dark:text-white">
            {register
              ? 'Create your account'
              : 'Sign in to your workspace'}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {register
              ? 'A few details and you are ready to go.'
              : 'Enter your details to continue to TaskFlow.'}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            {register && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold dark:text-slate-200">
                  Full name
                </label>

                <div className="relative">
                  <UserRound
                    className="absolute left-3.5 top-3.5 text-slate-400"
                    size={18}
                  />
                  <input
                    className={input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold dark:text-slate-200">
                Email address
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  className={input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold dark:text-slate-200">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  className="absolute left-3.5 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  className={`${input} pr-12`}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={register ? 8 : 1}
                  placeholder={
                    register ? 'At least 8 characters' : 'Your password'
                  }
                  autoComplete={
                    register ? 'new-password' : 'current-password'
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-3.5 text-slate-400"
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!register && (
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
                Remember me on this device
              </label>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy
                ? 'Please wait...'
                : register
                  ? 'Create account'
                  : 'Sign in'}
            </button>
          </form>

          {/* Evaluator demo credentials: login page only */}
          {!register && (
            <section
              aria-labelledby="demo-credentials-heading"
              className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900 dark:bg-indigo-950/40"
            >
              <div className="flex items-center justify-between gap-2">
                <h3
                  id="demo-credentials-heading"
                  className="text-sm font-bold text-slate-900 dark:text-white"
                >
                  Demo Credentials for Evaluator
                </h3>

                <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                  Demo
                </span>
              </div>

              <p className="mt-3 break-all text-sm text-slate-600 dark:text-slate-300">
                Email: {DEMO_EMAIL}
              </p>

              <p className="mt-1 break-all text-sm text-slate-600 dark:text-slate-300">
                Password: {DEMO_PASSWORD}
              </p>

              <button
                type="button"
                onClick={fillDemoCredentials}
                className="mt-4 w-full rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-slate-800"
              >
                Fill Demo Credentials
              </button>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Use these credentials to explore the application.
              </p>
            </section>
          )}

          <p className="mt-7 text-center text-sm text-slate-500">
            {register ? 'Already have an account?' : 'New to TaskFlow?'}{' '}
            <Link
              className="font-bold text-indigo-600 hover:text-indigo-700"
              to={register ? '/login' : '/register'}
            >
              {register ? 'Sign in' : 'Create an account'}
            </Link>
          </p>

          <Toast toast={toast} onClose={dismiss} />
        </div>
      </div>
    </div>
  );
}