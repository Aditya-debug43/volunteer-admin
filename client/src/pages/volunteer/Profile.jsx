import { useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/common/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { volunteerService } from '@/services/volunteer.service';
import { useAuthStore } from '@/store/authStore';

const VOL_NAV = [
  { to: "/volunteer/dashboard", label: "Dashboard" },
  { to: "/volunteer/profile", label: "My Profile" },
  { to: "/volunteer/activity", label: "My Activity" },
];

export default function Profile() {
  const { volunteer } = useAuth();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({
    phone: volunteer?.phone || '',
    addressLine1: volunteer?.addressLine1 || '',
    city: volunteer?.city || '',
    hoursPerWeek: volunteer?.hoursPerWeek || 5,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await volunteerService.update(volunteer._id, form);
      setAuth({ volunteer: updated });
      toast.success('Profile updated');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!volunteer) return <DashboardLayout nav={VOL_NAV}><p>Loading…</p></DashboardLayout>;

  return (
    <DashboardLayout nav={VOL_NAV}>
      <h1 className="mb-6 text-2xl font-extrabold text-ink">My Profile</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white">
            {volunteer.fullName?.[0]}
          </div>
          <p className="mt-3 text-center text-lg font-bold text-ink">{volunteer.fullName}</p>
          <p className="text-center text-sm text-ink-soft">{volunteer.email}</p>
          {volunteer.volunteerIdNumber && (
            <p className="mt-2 text-center text-sm font-semibold text-brand">{volunteer.volunteerIdNumber}</p>
          )}
        </div>
        <div className="card lg:col-span-2">
          <h2 className="mb-4 font-bold text-ink">Editable details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="label">City</label>
              <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label">Address</label>
              <input className="input" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} /></div>
          </div>
          <button className="btn-primary mt-5" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          <p className="mt-3 text-xs text-ink-soft">Some fields (name, DOB, ID proof) are locked after approval. Contact your coordinator to change them.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
