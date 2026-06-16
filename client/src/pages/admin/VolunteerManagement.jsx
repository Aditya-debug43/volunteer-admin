import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import Badge from '@/components/common/Badge';
import Spinner from '@/components/common/Spinner';
import { volunteerService } from '@/services/volunteer.service';
import { CITIES, STATUS_MAP } from '@/constants';

export default function VolunteerManagement() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ status: '', city: '', search: '', page: 1 });
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const load = useCallback(() => {
    setData(null);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    volunteerService.list(params)
      .then((res) => { setData(res.data); setMeta({ total: res.total, totalPages: res.totalPages }); })
      .catch(() => setData([]));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const act = async (id, status) => {
    const reason = status === 'rejected' ? prompt('Reason for rejection?') : undefined;
    if (status === 'rejected' && reason === null) return;
    try {
      await volunteerService.changeStatus(id, status, reason);
      toast.success(`Volunteer ${status}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed');
    }
  };

  return (
    <AdminLayout title="Volunteers">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Volunteers</h1>
        <span className="text-sm text-ink-soft">{meta.total} total</span>
      </div>

      <div className="card mb-4 flex flex-wrap gap-3 p-4">
        <input className="input max-w-xs" placeholder="Search name, email, phone…"
          value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} />
        <select className="input max-w-[160px]" value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
          <option value="">All statuses</option>
          {Object.keys(STATUS_MAP).map((s) => <option key={s} value={s}>{STATUS_MAP[s].label}</option>)}
        </select>
        <select className="input max-w-[160px]" value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value, page: 1 })}>
          <option value="">All cities</option>
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {data === null ? <Spinner /> : data.length === 0 ? (
        <div className="card text-center text-ink-soft">No volunteers match these filters.</div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-ink-soft">
              <tr>
                <th className="px-4 py-3">Name</th><th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Cause Areas</th><th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((v) => {
                const st = STATUS_MAP[v.status] || STATUS_MAP.pending;
                return (
                  <tr key={v._id} className="border-t border-line align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{v.fullName}</p>
                      <p className="text-xs text-ink-soft">{v.email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{v.city}</td>
                    <td className="px-4 py-3 text-xs text-ink-soft">{(v.causeAreas || []).slice(0, 2).join(', ')}</td>
                    <td className="px-4 py-3"><Badge color={st.color}>{st.label}</Badge></td>
                    <td className="px-4 py-3">
                      {v.status === 'pending' && (
                        <div className="flex gap-2">
                          <button className="btn-primary px-3 py-1 text-xs" onClick={() => act(v._id, 'approved')}>Approve</button>
                          <button className="btn-ghost px-3 py-1 text-xs" onClick={() => act(v._id, 'rejected')}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button className="btn-ghost px-3 py-1 text-sm" disabled={filters.page <= 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>← Prev</button>
          <span className="px-3 py-1 text-sm text-ink-soft">Page {filters.page} of {meta.totalPages}</span>
          <button className="btn-ghost px-3 py-1 text-sm" disabled={filters.page >= meta.totalPages}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next →</button>
        </div>
      )}
    </AdminLayout>
  );
}
