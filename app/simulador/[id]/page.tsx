'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CRMStorage } from '@/lib/storage';
import { Lead } from '@/types/crm';
import SimulatorForm from '@/components/SimulatorForm';

export default function SimulatorTabsPage() {
    const router = useRouter();
    const params = useParams();
    const [lead, setLead] = useState<Lead | null>(null);

    useEffect(() => {
        if (params?.id) {
            const found = CRMStorage.getLeadById(params.id as string);
            setLead(found || null);
        }
    }, [params]);

    if (!lead) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400">
                Carregando informações do cliente...
                <button className="ml-4 text-amber-500 hover:underline" onClick={() => router.push('/')}>Voltar</button>
            </div>
        );
    }

    return (
        <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
            {/* Header do Lead */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <button onClick={() => router.push('/')} className="text-slate-500 hover:text-white text-sm mb-3 flex items-center gap-1 transition-colors">
                        ← Voltar para o Funil
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-white">{lead.nome}</h1>
                        <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 text-xs rounded-full uppercase tracking-wider font-bold">
                            {lead.status.replace('_', ' ')}
                        </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">Sessão de simulação e orçamento.</p>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Abas Horizontais (Mobile-first) */}
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-2 px-2">
                    <button
                        onClick={() => {
                            CRMStorage.saveLead({ id: lead.id, modoVendaAtivo: 'express' } as any);
                            window.location.reload();
                        }}
                        className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm transition-all ring-1 flex-shrink-0 ${lead.modoVendaAtivo === 'express' ? 'bg-amber-500/10 ring-amber-500/50 text-amber-400' : 'glass-card ring-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        ⚡ Express
                    </button>
                    <button
                        onClick={() => {
                            CRMStorage.saveLead({ id: lead.id, modoVendaAtivo: 'tecnico' } as any);
                            window.location.reload();
                        }}
                        className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm transition-all ring-1 flex-shrink-0 ${(!lead.modoVendaAtivo || lead.modoVendaAtivo === 'tecnico') ? 'bg-amber-500/10 ring-amber-500/50 text-amber-400' : 'glass-card ring-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        📝 Técnico
                    </button>
                    <button
                        onClick={() => {
                            CRMStorage.saveLead({ id: lead.id, modoVendaAtivo: 'investidor' } as any);
                            window.location.reload();
                        }}
                        className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm transition-all ring-1 flex-shrink-0 ${lead.modoVendaAtivo === 'investidor' ? 'bg-emerald-500/10 ring-emerald-500/50 text-emerald-400' : 'glass-card ring-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        📈 Investidor
                    </button>
                    <button
                        onClick={() => {
                            CRMStorage.saveLead({ id: lead.id, modoVendaAtivo: 'financiamento' } as any);
                            window.location.reload();
                        }}
                        className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm transition-all ring-1 flex-shrink-0 ${lead.modoVendaAtivo === 'financiamento' ? 'bg-blue-500/10 ring-blue-500/50 text-blue-400' : 'glass-card ring-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        💳 Fechamento
                    </button>
                </div>

                {/* Área do Formulário */}
                <div className="glass-card p-6 border-slate-700">
                    <h2 className="text-xl font-bold mb-2 text-white border-b border-slate-800 pb-4 flex items-center gap-2">
                        {lead.modoVendaAtivo === 'express' && <>⚡ Simulação Express</>}
                        {(!lead.modoVendaAtivo || lead.modoVendaAtivo === 'tecnico') && <>📝 Orçamento Técnico</>}
                        {lead.modoVendaAtivo === 'investidor' && <>📈 Perfil Investidor</>}
                        {lead.modoVendaAtivo === 'financiamento' && <>💳 Fechamento / Financiamento</>}
                    </h2>
                    <p className="text-slate-500 text-xs mb-6">
                        {lead.modoVendaAtivo === 'express' && 'Campos mínimos — ideal para primeiro contato rápido no campo.'}
                        {(!lead.modoVendaAtivo || lead.modoVendaAtivo === 'tecnico') && 'Orçamento completo com todos os parâmetros de engenharia.'}
                        {lead.modoVendaAtivo === 'investidor' && 'Foco em TIR, VPL e comparação com mercado financeiro.'}
                        {lead.modoVendaAtivo === 'financiamento' && 'Calculado com base em parcelas de financiamento e residual de conta.'}
                    </p>
                    <SimulatorForm leadId={lead.id} />
                </div>
            </div>
        </main>
    );
}
