'use client';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface MonthlyChartProps {
    geracao: number[]; // 12 meses (kWh)
}

export default function MonthlyChart({ geracao }: MonthlyChartProps) {
    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const data = {
        labels,
        datasets: [
            {
                label: 'Geração Mensal (kWh)',
                data: geracao,
                backgroundColor: 'rgba(251, 191, 36, 0.6)',
                borderColor: '#fbbf24',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(15,23,42,0.95)',
                borderColor: 'rgba(251,191,36,0.3)',
                borderWidth: 1,
                titleColor: '#f1f5f9',
                bodyColor: '#fbbf24',
                callbacks: {
                    label: (ctx: { parsed: { y: number } }) => ` ${ctx.parsed.y} kWh`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(148,163,184,0.7)', font: { size: 10 } },
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: {
                    color: 'rgba(148,163,184,0.7)',
                    font: { size: 10 },
                },
            },
        },
    };

    return (
        <div className="h-48">
            <Bar data={data} options={options as Parameters<typeof Bar>[0]['options']} />
        </div>
    );
}
