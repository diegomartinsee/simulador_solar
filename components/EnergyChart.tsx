'use client';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface EnergyChartProps {
    projecao: number[];  // valor pago por ano (10 anos)
}

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

export default function EnergyChart({ projecao }: EnergyChartProps) {
    const labels = projecao.map((_, i) => `Ano ${i + 1}`);

    const data = {
        labels,
        datasets: [
            {
                label: 'Gasto anual sem solar',
                data: projecao,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2.5,
                pointBackgroundColor: '#ef4444',
                pointRadius: 4,
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: 'rgba(148,163,184,0.9)',
                    font: { size: 12 },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15,23,42,0.95)',
                borderColor: 'rgba(239,68,68,0.4)',
                borderWidth: 1,
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                callbacks: {
                    label: (ctx: { parsed: { y: number } }) => ` ${fmt(ctx.parsed.y)}/ano`,
                },
            },
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'rgba(148,163,184,0.7)', font: { size: 11 } },
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: {
                    color: 'rgba(148,163,184,0.7)',
                    font: { size: 11 },
                    callback: (v: string | number) => fmt(Number(v)),
                },
            },
        },
    };

    return (
        <div className="h-64">
            <Line data={data} options={options as Parameters<typeof Line>[0]['options']} />
        </div>
    );
}
