import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import Badge from '@/components/common/Badge';
import Spinner from '@/components/common/Spinner';
import { eventService } from '@/services/volunteer.service';
import { CAUSE_AREAS, CITIES } from '@/constants';

const blankEvent = {
  title: '', description: '', causeArea: '', eventType: 'Food Drive', mode: 'On-ground',
  city: '', venue: '', startDate: '', endDate: '', maxVolunteers: 20,
};

export default function EventManagement() {
  const [events, setEvents] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankEvent);
  const [saving, setSaving] = useState(false);

  const load = () => eventService.list({ limit: 50 }).then((r) => setEvents(r.data)).catch(() => setEvents([]));
  useEffect(() => { load(); }, []);

  const create = async () => {
    setSaving(true);
    try {
      await eventService.create(form);
      toast.success('Event created');
      setShowForm(false); setForm(blankEvent); load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not create event');
    } finally {
      setSaving(false);
    }
  };

  const STATUS_COLOR = { upcoming: 'orange', ongoing: 'green', completed: 'gray', cancelled: 'red' };

  return (
    <AdminLayout title="Events">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Events</h1>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>{showForm ? 'Close' : '+ New Event'}</button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="mb-4 font-bold text-ink">Create Event</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label">Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Description</label>
              <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><label className="label">Cause Area</label>
              <select className="input" value={form.causeArea} onChange={(e) => setForm({ ...form, causeArea: e.target.value })}>
                <option value="">Select…</option>
                {CAUSE_AREAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select></div>
            <div><label className="label">City</label>
              <select className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                <option value="">Select…</option>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select></div>
            <div><label className="label">Venue</label>
              <input className="input" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></div>
            <div><label className="label">Max Volunteers</label>
              <input type="number" className="input" value={form.maxVolunteers} onChange={(e) => setForm({ ...form, maxVolunteers: Number(e.target.value) })} /></div>
            <div><label className="label">Start</label>
              <input type="datetime-local" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div><label className="label">End</label>
              <input type="datetime-local" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
          </div>
          <button className="btn-primary mt-4" onClick={create} disabled={saving}>{saving ? 'Creating…' : 'Create Event'}</button>
        </div>
      )}

      {events === null ? <Spinner /> : events.length === 0 ? (
        <div className="card text-center text-ink-soft">No events yet. Create your first drive above.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <div key={ev._id} className="card p-5">
              <div className="flex items-center justify-between">
                <Badge color="orange">{ev.causeArea}</Badge>
                <Badge color={STATUS_COLOR[ev.status] || 'gray'}>{ev.status}</Badge>
              </div>
              <h3 className="mt-2 font-bold text-ink">{ev.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">📍 {ev.city} · {new Date(ev.startDate).toLocaleDateString('en-IN')}</p>
              <p className="mt-1 text-xs text-ink-soft">{ev.registeredVolunteers?.length || 0} / {ev.maxVolunteers || '∞'} registered</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
