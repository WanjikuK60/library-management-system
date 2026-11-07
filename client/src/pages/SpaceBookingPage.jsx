import { useState } from 'react';
import { apiUrl } from '../api.js';

export default function SpaceBookingPage() {
  const [form, setForm] = useState({ space: '', date: '', startTime: '', endTime: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setMessage('');
    setMessageType('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.endTime <= form.startTime) {
      setMessage('Choose an end time later than the start time.');
      setMessageType('error');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      const response = await fetch(apiUrl('/bookings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(Array.isArray(data.message) ? data.message.join(' ') : data.message || `Booking failed (${response.status}).`);
      }
      setMessage(`Your ${form.space.replaceAll('-', ' ')} is booked for ${form.date}, ${form.startTime}–${form.endTime}.`);
      setMessageType('success');
    } catch (requestError) {
      setMessage(requestError.message || 'Could not submit your booking. Please try again.');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="booking-page">
      <p className="eyebrow">A place to focus</p>
      <h1>Book a library space</h1>
      <p className="auth-intro">Choose a space and a time that works for you.</p>
      <form className="account-form" onSubmit={handleSubmit}>
        <label>Space
          <select name="space" value={form.space} onChange={updateField} required>
            <option value="">Choose a space</option>
            <option value="quiet-study">Quiet study room</option>
            <option value="group-study">Group study room</option>
            <option value="reading-room">Reading room</option>
          </select>
        </label>
        <label>Date
          <input name="date" type="date" value={form.date} onChange={updateField} min={minDate} required />
        </label>
        <div className="time-fields">
          <label>Start time
            <input name="startTime" type="time" value={form.startTime} onChange={updateField} required />
          </label>
          <label>End time
            <input name="endTime" type="time" value={form.endTime} onChange={updateField} required />
          </label>
        </div>
        {message && <p className={messageType === 'error' ? 'form-error' : 'form-notice'} role={messageType === 'error' ? 'alert' : 'status'}>{message}</p>}
        <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Book this space'}</button>
      </form>
    </section>
  );
}
