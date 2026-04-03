'use client';

import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
    inercia: number;
    solar: number;
}

export default function ComparisonChart({ inercia, solar }: Props) {
    const data = {
        labels: ['Custo de Ficar Sem Solar', 'Custo Fixo Com Solar'],
        datasets: [
            {
                label: 'Custo Total 25 Anos (R$)',
                data: [inercia, solar],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)', // red-500
                    'rgba(16, 185, 129, 0.8)' // emerald-500
                ],
                borderColor: [
                    'rgba(239, 68, 68, 1)',
                    'rgba(16, 185, 129, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8,
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        let label = context.dataset.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: {
                    color: '#94a3b8',
                    callback: (value: any) => 'R$ ' + (value / 1000).toLocaleString() + 'k'
                }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#ffffff', font: { weight: 'bold' } }
            }
        }
    };

    return (
        <div className="w-full" style={{ height: '300px' }}>
            <Bar data={data as any} options={options as any} />
        </div>
    );
}
