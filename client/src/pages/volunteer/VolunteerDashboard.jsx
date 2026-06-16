import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/common/DashboardLayout';
import StatCard from '@/components/admin/StatCard';
import Badge from '@/components/common/Badge';
import Spinner from '@/components/common/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { eventService } from '@/services/volunteer.service';
import { STATUS_MAP } from '@/constants';

const VOL_NAV = [
  { to: "/volunteer/dashboard", label: "Dashboard" },
  { to: "/volunteer/profile", label: "My Profile" },
  { to: "/volunteer/activity", label: "My Activity" },
];

export default function VolunteerDashboard() {
  const { user, volunteer } = useAuth();
  const [events, setEvents] = useState(null);

  useEffect(() => {
    eventService.list({ status: 'upcoming', limit: 6 })
      .then((res) => setEvents(res.data || []))
      .catch(() => setEvents([]));
  }, []);

  const status = STATUS_MAP[volunteer?.status] || STATUS_MAP.pending;
  const eligible = volunteer?.isCertificateEligible;

  return (
    <DashboardLayout nav={VOL_NAV}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Hi, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-ink-soft">
            {volunteer?.volunteerIdNumber
              ? <>Your Volunteer ID: <strong className="text-brand">{volunteer.volunteerIdNumber}</strong></>
              : 'Welcome to your volunteer dashboard'}
          </p>
        </div>
        <Badge color={status.color}>{status.label}</Badge>
      </div>

      {volunteer?.status === 'pending' && (
        <div className="card mb-6 border-amber-200 bg-amber-50">
          <p className="font-semibold text-amber-800">⏳ Your application is under review</p>
          <p className="mt-1 text-sm text-amber-700">
            Our team is reviewing your registration. You'll get an email once it's approved — usually within 2–3 working days.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="⏱️" label="Hours Logged" value={volunteer?.totalHoursLogged ?? 0} />
        <StatCard icon="📅" label="Events Attended" value={volunteer?.totalEventsAttended ?? 0} accent="text-brand-green" />
        <StatCard icon="🎓" label="Certificate" value={eligible ? 'Eligible' : 'In Progress'} accent="text-amber-600" />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-bold text-ink">Upcoming Drives</h2>
      {events === null ? <Spinner /> : events.length === 0 ? (
        <div className="card text-center text-ink-soft">No upcoming events right now. Check back soon!</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <div key={ev._id} className="card p-5">
              <Badge color="orange">{ev.causeArea}</Badge>
              <h3 className="mt-2 font-bold text-ink">{ev.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">📍 {ev.city} · {new Date(ev.startDate).toLocaleDateString('en-IN')}</p>
              <button className="btn-primary mt-3 w-full py-2 text-sm"
                onClick={() => eventService.register(ev._id).then(() => alert('Registered!')).catch((e) => alert(e.response?.data?.message))}>
                Register
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
