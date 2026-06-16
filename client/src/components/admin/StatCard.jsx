export default function StatCard({ label, value, icon, accent = 'text-brand' }) {
  return (
    <div className="card flex items-center gap-4 p-6">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className={`text-2xl font-extrabold ${accent}`}>{value}</p>
        <p className="text-sm text-ink-soft">{label}</p>
      </div>
    </div>
  );
}
