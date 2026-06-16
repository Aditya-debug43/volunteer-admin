import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import {
  Users, Clock, CalendarDays, HeartHandshake, UserCheck, UserPlus, Hourglass, Award, RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import Spinner from '@/components/common/Spinner';
import Badge from '@/components/common/Badge';
import { adminService, volunteerService } from '@/services/volunteer.service';
import { STATUS_MAP } from '@/constants';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PALETTE = ['#F97316', '#16A34A', '#0EA5E9', '#FBBF24', '#A855F7', '#EF4444', '#14B8A6', '#EC4899', '#84CC16', '#6366F1', '#78716C'];
const STATUS_COLOR = { pending: '#FBBF24', approved: '#16A34A', rejected: '#EF4444', suspended: '#78716C', inactive: '#A8A29E' };

function StatCard({ icon: Icon, label, value, tone = 'text-brand', bg = 'bg-orange-50' }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}>
        <Icon className={`h-6 w-6 ${tone}`} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold leading-tight text-ink">{value}</p>
        <p className="truncate text-sm text-ink-soft">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [pending, setPending] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    Promise.all([adminService.stats(), adminService.trend(), adminService.pending()])
      .then(([s, t, p]) => {
        setStats(s);
        setTrend((t || []).map((d) => ({ label: `${MONTHS[d._id.m - 1]} '${String(d._id.y).slice(2)}`, count: d.count })));
        setPending(p || []);
      })
      .catch(() => { setStats({}); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (id, status) => {
    const reason = status === 'rejected' ? prompt('Reason for rejection?') : undefined;
    if (status === 'rejected' && reason === null) return;
    setBusyId(id);
    try {
      await volunteerService.changeStatus(id, status, reason);
      toast.success(`Volunteer ${status}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  if (!stats) return <AdminLayout title="Dashboard"><Spinner /></AdminLayout>;

  const cityData = (stats.byCity || []).map((c) => ({ city: c._id || 'Unknown', volunteers: c.count }));
  const causeData = (stats.byCause || []).map((c) => ({ name: c._id, volunteers: c.count })).sort((a, b) => b.volunteers - a.volunteers);
  const statusData = (stats.byStatus || []).map((s) => ({ name: STATUS_MAP[s._id]?.label || s._id, key: s._id, value: s.count }));

  const refreshBtn = (
    <button onClick={load} className="btn-ghost px-3 py-1.5 text-sm"><RefreshCw className="h-4 w-4" /> Refresh</button>
  );

  return (
    <AdminLayout title="Dashboard" actions={refreshBtn}>
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Volunteers" value={stats.totalVolunteers ?? 0} />
        <StatCard icon={Hourglass} label="Pending Review" value={stats.pending ?? 0} tone="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={UserCheck} label="Active (30 days)" value={stats.activeVolunteers ?? 0} tone="text-brand-green" bg="bg-green-50" />
        <StatCard icon={UserPlus} label="New This Month" value={stats.newThisMonth ?? 0} tone="text-sky-600" bg="bg-sky-50" />
        <StatCard icon={Clock} label="Total Hours Logged" value={stats.totalHours ?? 0} tone="text-brand-dark" />
        <StatCard icon={CalendarDays} label="Events Hosted" value={stats.totalEvents ?? 0} tone="text-purple-600" bg="bg-purple-50" />
        <StatCard icon={HeartHandshake} label="Beneficiaries Served" value={stats.beneficiariesServed ?? 0} tone="text-pink-600" bg="bg-pink-50" />
        <StatCard icon={Award} label="Approved Volunteers"
          value={(stats.byStatus || []).find((s) => s._id === 'approved')?.count ?? 0} tone="text-brand-green" bg="bg-green-50" />
      </div>

      {/* Registrations trend */}
      <div className="card mt-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-bold text-ink">Registrations Over Time</h2>
          <span className="text-xs text-ink-soft">Last 12 months</span>
        </div>
        {trend.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-soft">No registration data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trend} margin={{ top: 10, right: 16, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
              <XAxis dataKey="label" fontSize={12} tickMargin={8} stroke="#78716C" />
              <YAxis allowDecimals={false} fontSize={12} stroke="#78716C" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="count" name="New volunteers" stroke="#F97316" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* City + Status */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-4 font-bold text-ink">Volunteers by City</h2>
          {cityData.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink-soft">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={cityData} margin={{ top: 10, right: 16, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
                <XAxis dataKey="city" fontSize={12} tickMargin={8} stroke="#78716C" />
                <YAxis allowDecimals={false} fontSize={12} stroke="#78716C" />
                <Tooltip cursor={{ fill: '#FFF7ED' }} />
                <Legend />
                <Bar dataKey="volunteers" name="Volunteers" fill="#F97316" radius={[6, 6, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 font-bold text-ink">By Status</h2>
          {statusData.length === 0 ? (
            <p className="py-12 text-center text-sm text-ink-soft">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="45%"
                  innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {statusData.map((s) => <Cell key={s.key} fill={STATUS_COLOR[s.key] || '#78716C'} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Cause area distribution (horizontal so long labels fit) */}
      <div className="card mt-6">
        <h2 className="mb-4 font-bold text-ink">Interest by Cause Area</h2>
        {causeData.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-soft">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, causeData.length * 38)}>
            <BarChart data={causeData} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" horizontal={false} />
              <XAxis type="number" allowDecimals={false} fontSize={12} stroke="#78716C" />
              <YAxis type="category" dataKey="name" width={210} fontSize={11} stroke="#78716C" />
              <Tooltip cursor={{ fill: '#FFF7ED' }} />
              <Legend />
              <Bar dataKey="volunteers" name="Interested volunteers" radius={[0, 6, 6, 0]} maxBarSize={26}>
                {causeData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pending approvals — actionable */}
      <div className="card mt-6 p-0">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-bold text-ink">Pending Approvals {pending.length > 0 && <Badge color="amber">{pending.length}</Badge>}</h2>
          <Link to="/admin/volunteers" className="text-sm font-medium text-brand hover:underline">Manage all →</Link>
        </div>
        {pending.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-soft">🎉 No pending applications. You're all caught up!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-ink-soft">
                <tr>
                  <th className="px-5 py-3">Name</th><th className="px-5 py-3">City</th>
                  <th className="px-5 py-3">Cause Areas</th><th className="px-5 py-3">Applied</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.slice(0, 8).map((v) => (
                  <tr key={v._id} className="border-t border-line">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">{v.fullName}</p>
                      <p className="text-xs text-ink-soft">{v.email}</p>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{v.city}</td>
                    <td className="px-5 py-3 text-xs text-ink-soft">{(v.causeAreas || []).slice(0, 2).join(', ')}{(v.causeAreas || []).length > 2 ? '…' : ''}</td>
                    <td className="px-5 py-3 text-ink-soft">{new Date(v.registeredAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button disabled={busyId === v._id} className="btn-primary px-3 py-1 text-xs"
                          onClick={() => act(v._id, 'approved')}>Approve</button>
                        <button disabled={busyId === v._id} className="btn-ghost px-3 py-1 text-xs"
                          onClick={() => act(v._id, 'rejected')}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
