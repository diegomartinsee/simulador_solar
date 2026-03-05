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
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface ComparativoData {
    anos: number[];
    solar: number[];
    cdi: number[];
    fii: number[];
    imovel: number[];
}

interface InvestmentChartProps {
    comparativo: ComparativoData;
    investimentoTotal: number;
}

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

export default function InvestmentChart({ comparativo, investimentoTotal }: InvestmentChartProps) {
    const labels = comparativo.anos.map((a) => `Ano ${a}`);

    const data = {
        labels,
        datasets: [
            {
                label: '☀️ Solar',
                data: comparativo.solar,
                borderColor: '#fbbf24',
                backgroundColor: 'rgba(251,191,36,0.08)',
                borderWidth: 3,
                pointBackgroundColor: '#fbbf24',
                pointRadius: 4,
                tension: 0.4,
            },
            {
                label: '📈 CDI (10% a.a.)',
                data: comparativo.cdi,
                borderColor: '#60a5fa',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 3,
                tension: 0.4,
            },
            {
                label: '🏢 FII (8% a.a.)',
                data: comparativo.fii,
                borderColor: '#a78bfa',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 3,
                tension: 0.4,
            },
            {
                label: '🏠 Imóvel (6% a.a.)',
                data: comparativo.imovel,
                borderColor: '#34d399',
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 3,
                tension: 0.4,
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
                    padding: 16,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15,23,42,0.95)',
                borderColor: 'rgba(251,191,36,0.3)',
                borderWidth: 1,
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                callbacks: {
                    label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) =>
                        ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`,
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
        <div className="h-72">
            <Line data={data} options={options as Parameters<typeof Line>[0]['options']} />
        </div>
    );
}
