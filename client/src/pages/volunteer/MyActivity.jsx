import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/common/DashboardLayout';
import Spinner from '@/components/common/Spinner';
import Badge from '@/components/common/Badge';
import { useAuth } from '@/hooks/useAuth';
import { volunteerService } from '@/services/volunteer.service';

const VOL_NAV = [
  { to: "/volunteer/dashboard", label: "Dashboard" },
  { to: "/volunteer/profile", label: "My Profile" },
  { to: "/volunteer/activity", label: "My Activity" },
];

const STATUS_COLOR = { attended: 'green', registered: 'orange', absent: 'red', excused: 'gray' };

export default function MyActivity() {
  const { volunteer } = useAuth();
  const [records, setRecords] = useState(null);

  useEffect(() => {
    if (volunteer?._id) {
      volunteerService.activity(volunteer._id).then(setRecords).catch(() => setRecords([]));
    }
  }, [volunteer]);

  return (
    <DashboardLayout nav={VOL_NAV}>
      <h1 className="mb-2 text-2xl font-extrabold text-ink">My Activity</h1>
      <p className="mb-6 text-ink-soft">Your event history and logged hours.</p>
      {records === null ? <Spinner /> : records.length === 0 ? (
        <div className="card text-center text-ink-soft">No activity yet. Register for an event from your dashboard!</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-ink-soft">
              <tr>
                <th className="px-4 py-3">Event</th><th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Hours</th><th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium text-ink">{r.event?.title || '—'}</td>
                  <td className="px-4 py-3 text-ink-soft">{r.event?.startDate ? new Date(r.event.startDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-3">{r.hoursLogged || 0}</td>
                  <td className="px-4 py-3"><Badge color={STATUS_COLOR[r.status] || 'gray'}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
