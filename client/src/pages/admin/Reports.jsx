import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Spinner from '@/components/common/Spinner';
import api from '@/services/api';
import { CITIES, STATUS_MAP } from '@/constants';

export default function Reports() {
  const [filters, setFilters] = useState({ city: '', status: '', from: '', to: '' });
  const [preview, setPreview] = useState(null);

  const buildParams = () => Object.fromEntries(Object.entries(filters).filter(([, v]) => v));

  const loadPreview = () => {
    setPreview(null);
    api.get('/reports/volunteers', { params: { ...buildParams(), limit: 10 } })
      .then((r) => setPreview(r.data))
      .catch(() => setPreview({ data: [], total: 0 }));
  };

  useEffect(() => { loadPreview(); /* eslint-disable-next-line */ }, []);

  const download = async (fmt) => {
    const res = await api.get(`/reports/volunteers/${fmt}`, { params: buildParams(), responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url; a.download = `volunteers-report.${fmt}`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Reports">
      <h1 className="mb-2 text-2xl font-extrabold text-ink">Reports</h1>
      <p className="mb-6 text-ink-soft">Filter and export volunteer data as CSV or PDF.</p>

      <div className="card mb-6 flex flex-wrap items-end gap-3">
        <div><label className="label">City</label>
          <select className="input max-w-[160px]" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
            <option value="">All</option>{CITIES.map((c) => <option key={c}>{c}</option>)}
          </select></div>
        <div><label className="label">Status</label>
          <select className="input max-w-[160px]" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All</option>{Object.keys(STATUS_MAP).map((s) => <option key={s} value={s}>{STATUS_MAP[s].label}</option>)}
          </select></div>
        <div><label className="label">From</label>
          <input type="date" className="input" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} /></div>
        <div><label className="label">To</label>
          <input type="date" className="input" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /></div>
        <button className="btn-ghost" onClick={loadPreview}>Apply</button>
        <div className="ml-auto flex gap-2">
          <button className="btn-ghost" onClick={() => download('csv')}>⬇ CSV</button>
          <button className="btn-primary" onClick={() => download('pdf')}>⬇ PDF</button>
        </div>
      </div>

      {preview === null ? <Spinner /> : (
        <div className="card overflow-x-auto p-0">
          <div className="border-b border-line px-4 py-3 text-sm text-ink-soft">Showing {preview.data.length} of {preview.total} records</div>
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-ink-soft">
              <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Status</th><th className="px-4 py-3">Hours</th></tr>
            </thead>
            <tbody>
              {preview.data.map((r, i) => (
                <tr key={i} className="border-t border-line">
                  <td className="px-4 py-3 text-ink-soft">{r.volunteerId}</td>
                  <td className="px-4 py-3 font-medium text-ink">{r.fullName}</td>
                  <td className="px-4 py-3 text-ink-soft">{r.city}</td>
                  <td className="px-4 py-3 text-ink-soft">{r.status}</td>
                  <td className="px-4 py-3">{r.totalHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
