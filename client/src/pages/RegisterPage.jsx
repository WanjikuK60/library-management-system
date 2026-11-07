import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiUrl } from '../api.js';
import { useReadingList } from '../context/ReadingListContext.jsx';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { mergeGuestList } = useReadingList();

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await fetch(apiUrl('/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Registration failed (${response.status}).`);
      }
      if (!data.accessToken) {
        throw new Error('The server did not return an access token.');
      }
      if (!data.user?.id) {
        throw new Error('The server did not return an account ID.');
      }
      await mergeGuestList(data.user.id, data.accessToken);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <p className="eyebrow">Join the library</p>
      <h1>Make yourself at home.</h1>
      <p className="auth-intro">Create an account to keep your reading list close.</p>
      <form className="account-form" onSubmit={handleSubmit}>
        <label>Your name
          <input name="name" type="text" autoComplete="name" value={form.name} onChange={updateField} required />
        </label>
        <label>Email address
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} required />
        </label>
        <label>Password
          <input name="password" type="password" autoComplete="new-password" minLength="8" value={form.password} onChange={updateField} required />
          <span className="field-hint">Use at least 8 characters.</span>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </section>
  );
}
