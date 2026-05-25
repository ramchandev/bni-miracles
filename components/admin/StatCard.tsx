type Props = {
  label: string;
  value: number | string;
  icon: string;
  color?: string;
};

export default function StatCard({ label, value, icon, color = 'var(--color-primary)' }: Props) {
  return (
    <div className="card p-6 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
        style={{ background: `${color}18` }}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-extrabold" style={{ color: 'var(--color-dark)' }}>
          {value}
        </div>
        <div className="text-sm" style={{ color: 'var(--color-gray)' }}>
          {label}
        </div>
      </div>
    </div>
  );
}
