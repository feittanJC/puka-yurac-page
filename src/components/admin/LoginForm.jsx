import { useEffect, useState } from 'react';
import { authService } from '../../services/auth.service';
import { cls } from './ui';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Si ya hay sesión de admin, ir directo al dashboard
  useEffect(() => {
    authService.getSession().then(async (session) => {
      if (session && (await authService.isAdmin())) {
        window.location.href = '/admin/dashboard';
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(email, password);
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'El correo o la contraseña no son correctos. Inténtalo de nuevo.'
          : err.message
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" aria-describedby={error ? 'login-error' : undefined}>
      {error && (
        <p
          id="login-error"
          role="alert"
          className="rounded-xl px-4 py-3 text-[15px] font-semibold bg-[#fdecec] text-[#7f1d1d] dark:bg-red-500/15 dark:text-red-200"
        >
          {error}
        </p>
      )}

      <div>
        <label htmlFor="email" className={cls.label}>
          Correo
        </label>
        <input
          type="email"
          id="email"
          required
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(error) || undefined}
          className={`${cls.input} h-[52px] px-4`}
        />
      </div>

      <div>
        <label htmlFor="password" className={cls.label}>
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(error) || undefined}
          className={`${cls.input} h-[52px] px-4`}
        />
      </div>

      <button type="submit" disabled={loading} aria-busy={loading} className={`${cls.primary} w-full h-14 px-6 text-base`}>
        {loading ? 'Verificando…' : 'Entrar al panel'}
      </button>
    </form>
  );
}
