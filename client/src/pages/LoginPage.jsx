import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiUrl } from '../api.js';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from?.pathname || '/';

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Sign in failed (${response.status}).`);
      }
      if (!data.accessToken) {
        throw new Error('The server did not return an access token.');
      }
      localStorage.setItem('token', data.accessToken);
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Could not sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <p className="eyebrow">Welcome back</p>
      <h1>Good to see you.</h1>
      <p className="auth-intro">Sign in to continue to your library account.</p>
      <form className="account-form" onSubmit={handleSubmit}>
        <label>Email address
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} required />
        </label>
        <label>Password
          <input name="password" type="password" autoComplete="current-password" value={form.password} onChange={updateField} required />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="auth-switch">New to Open Shelf? <Link to="/register">Create an account</Link></p>
    </section>
  );
}
