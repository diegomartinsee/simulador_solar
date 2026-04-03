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

interface GrowthChartProps {
    dadosSolar: number[]; // Array de 25 posições (Patrimônio Líquido Acumulado)
    dadosCdi: number[];   // Array de 25 posições (O que teria se aplicasse o capital)
}

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

export default function GrowthChart({ dadosSolar, dadosCdi }: GrowthChartProps) {
    const labels = dadosSolar.map((_, i) => `Ano ${i}`);

    const data = {
        labels,
        datasets: [
            {
                label: '☀️ Patrimônio com Solar',
                data: dadosSolar,
                borderColor: '#fbbf24', // amber-400
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                borderWidth: 3,
                pointRadius: 0,
                tension: 0.3,
                fill: true,
            },
            {
                label: '🏦 Aplicação CDI (10% a.a.)',
                data: dadosCdi,
                borderColor: '#94a3b8', // slate-400
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.3,
                fill: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: '#94a3b8', font: { size: 11 } }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                padding: 12,
                callbacks: {
                    label: (ctx: any) => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#64748b' }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: {
                    color: '#64748b',
                    callback: (v: any) => 'R$ ' + (v / 1000).toLocaleString() + 'k'
                }
            }
        }
    };

    return (
        <div className="h-72">
            <Line data={data} options={options as any} />
        </div>
    );
}
