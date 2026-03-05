'use client';

interface ResultCardProps {
    label: string;
    value: string;
    subValue?: string;
    equivalencia?: string;
    icon: string;
    highlight?: boolean;
    danger?: boolean;
    delay?: number;
}

export default function ResultCard({
    label,
    value,
    subValue,
    equivalencia,
    icon,
    highlight = false,
    danger = false,
    delay = 0,
}: ResultCardProps) {
    const borderColor = danger
        ? 'border-red-500/40 bg-red-950/10'
        : highlight
            ? 'border-amber-400/50 bg-amber-400/5'
            : '';

    const valueColor = danger
        ? 'text-red-400'
        : highlight
            ? 'text-amber-400 number-glow'
            : 'text-white';

    const badge = danger ? (
        <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Custo da Inércia
        </span>
    ) : highlight ? (
        <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Destaque
        </span>
    ) : null;

    return (
        <div className={`kpi-card fade-in fade-in-delay-${delay} ${borderColor}`}>
            <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{icon}</span>
                {badge}
            </div>
            <div className={`text-3xl md:text-4xl font-black mb-1 ${valueColor}`}>
                {value}
            </div>
            {subValue && <div className="text-slate-400 text-sm mb-1">{subValue}</div>}
            {equivalencia && (
                <div className="text-amber-400/70 text-xs italic mb-1">≈ {equivalencia}</div>
            )}
            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</div>
        </div>
    );
}
