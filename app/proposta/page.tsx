'use client';

import { useEffect, useState } from 'react';
import ProposalCover from '@/components/ProposalCover';
import ProposalContent from '@/components/ProposalContent';
import { SimulacaoResultado } from '@/types/simulation';

export default function PropostaPage() {
    const [resultado, setResultado] = useState<SimulacaoResultado | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('lastSimulation');
        if (saved) {
            setResultado(JSON.parse(saved));
        }
    }, []);

    if (!resultado) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-500">
                Carregando dados da proposta...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-100 flex flex-col items-center py-10 print:p-0 print:bg-white">
            {/* Controle de Impressão (Fica invisível na impressão) */}
            <div className="fixed top-6 right-6 z-50 flex gap-3 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="bg-amber-500 hover:bg-amber-400 text-white font-black px-8 py-4 rounded-2xl shadow-2xl shadow-amber-500/20 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95"
                >
                    🖨️ IMPRIMIR PROPOSTA (PDF)
                </button>
                <button
                    onClick={() => window.history.back()}
                    className="bg-white/90 backdrop-blur text-slate-900 border border-slate-200 font-bold px-6 py-4 rounded-2xl shadow-xl transition-all"
                >
                    ← VOLTAR
                </button>
            </div>

            {/* Container da Proposta A4 */}
            <div className="shadow-[0_0_100px_rgba(0,0,0,0.1)] print:shadow-none">
                <ProposalCover
                    cliente={resultado.nomeCliente}
                    data={new Date().toLocaleDateString('pt-BR')}
                />
                <ProposalContent resultado={resultado} />
            </div>

            {/* Estilos para Impressão A4 exata */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        -webkit-print-color-adjust: exact;
                    }
                    .page-break-after {
                        page-break-after: always;
                    }
                }
                /* Forçar renderização de cores de fundo no Chrome/Safari */
                * {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            `}</style>
        </main>
    );
}
