'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProposalCover from '@/components/ProposalCover';
import ProposalContent from '@/components/ProposalContent';
import { SimulacaoResultado } from '@/types/simulation';
import { CRMStorage } from '@/lib/storage';

import { Suspense } from 'react';

// Dados técnicos do kit que o vendedor preenche antes de imprimir
export interface KitConfig {
    enderecoInstalacao: string;
    cpfCnpj: string;
    marcaPainel: string;
    modeloPainel: string;
    marcaInversor: string;
    potenciaInversorKw: string;
    tipoInversor: 'String' | 'Microinversor' | 'Híbrido';
    tipoEstrutura: 'Cerâmico' | 'Metálico' | 'Fibrocimento' | 'Solo' | 'Laje';
    observacoes: string;
}

const defaultKit: KitConfig = {
    enderecoInstalacao: '',
    cpfCnpj: '',
    marcaPainel: '',
    modeloPainel: '',
    marcaInversor: '',
    potenciaInversorKw: '',
    tipoInversor: 'String',
    tipoEstrutura: 'Cerâmico',
    observacoes: '',
};

function PropostaInner() {
    const searchParams = useSearchParams();
    const proposalId = searchParams.get('proposalId');
    const [resultado, setResultado] = useState<SimulacaoResultado | null>(null);
    const [kitConfig, setKitConfig] = useState<KitConfig>(defaultKit);
    const [etapa, setEtapa] = useState<'config' | 'pdf'>('config');

    useEffect(() => {
        if (proposalId) {
            const prop = CRMStorage.getProposalById(proposalId);
            if (prop && prop.resultado) {
                setResultado(prop.resultado);
                // ✅ Atualiza o status do Lead para 'proposta_emitida' automaticamente
                CRMStorage.updateLeadStatus(prop.leadId, 'proposta_emitida');
                return;
            }
        }

        const saved = localStorage.getItem('simulacao_resultado');
        if (saved) {
            setResultado(JSON.parse(saved));
        }
    }, [proposalId]);

    const handleKitChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setKitConfig(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (!resultado) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-500">
                Carregando dados da proposta...
            </div>
        );
    }

    // ETAPA 1: FORMULÁRIO DE CONFIGURAÇÃO DO KIT
    if (etapa === 'config') {
        return (
            <main className="min-h-screen p-6 max-w-3xl mx-auto">
                <button onClick={() => window.history.back()} className="text-slate-500 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors">
                    ← Voltar
                </button>

                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 text-amber-400 text-xs font-semibold mb-3">
                        📄 Configuração da Proposta
                    </div>
                    <h1 className="text-3xl font-black text-white">Dados do Kit e Cliente</h1>
                    <p className="text-slate-400 mt-1 text-sm">Preencha os detalhes finais antes de gerar o PDF profissional.</p>
                </div>

                <div className="space-y-6">

                    {/* Dados do Cliente */}
                    <div className="glass-card p-5 border border-slate-800 hover:border-amber-500/30 transition-colors">
                        <h3 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-4">👤 Dados do Cliente / Obra</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="solar-label">Endereço de Instalação</label>
                                <input name="enderecoInstalacao" value={kitConfig.enderecoInstalacao} onChange={handleKitChange}
                                    className="solar-input" placeholder="Rua, número, bairro, cidade - UF" />
                            </div>
                            <div>
                                <label className="solar-label">CPF ou CNPJ</label>
                                <input name="cpfCnpj" value={kitConfig.cpfCnpj} onChange={handleKitChange}
                                    className="solar-input" placeholder="000.000.000-00" />
                            </div>
                        </div>
                    </div>

                    {/* Painel Solar */}
                    <div className="glass-card p-5 border border-slate-800 hover:border-blue-500/30 transition-colors">
                        <h3 className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-4">☀️ Módulos Fotovoltaicos</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="solar-label">Marca do Painel</label>
                                <input name="marcaPainel" value={kitConfig.marcaPainel} onChange={handleKitChange}
                                    className="solar-input" placeholder="Ex: Canadian Solar, Risen, JA Solar" />
                            </div>
                            <div>
                                <label className="solar-label">Modelo / Linha</label>
                                <input name="modeloPainel" value={kitConfig.modeloPainel} onChange={handleKitChange}
                                    className="solar-input" placeholder="Ex: HiKu7 Mono PERC 610W" />
                            </div>
                        </div>
                    </div>

                    {/* Inversor */}
                    <div className="glass-card p-5 border border-slate-800 hover:border-emerald-500/30 transition-colors">
                        <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-4">⚡ Inversor</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="solar-label">Marca</label>
                                <input name="marcaInversor" value={kitConfig.marcaInversor} onChange={handleKitChange}
                                    className="solar-input" placeholder="Ex: Growatt, Hoymiles, WEG" />
                            </div>
                            <div>
                                <label className="solar-label">Potência (kW)</label>
                                <input name="potenciaInversorKw" value={kitConfig.potenciaInversorKw} onChange={handleKitChange}
                                    className="solar-input" placeholder="Ex: 8.0" />
                            </div>
                            <div>
                                <label className="solar-label">Tipo de Inversor</label>
                                <select name="tipoInversor" value={kitConfig.tipoInversor} onChange={handleKitChange} className="solar-input">
                                    <option value="String">String (padrão)</option>
                                    <option value="Microinversor">Microinversor</option>
                                    <option value="Híbrido">Híbrido (c/ bateria)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Estrutura */}
                    <div className="glass-card p-5 border border-slate-800 hover:border-slate-500/30 transition-colors">
                        <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">🏗️ Estrutura de Fixação</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="solar-label">Tipo de Telhado / Local</label>
                                <select name="tipoEstrutura" value={kitConfig.tipoEstrutura} onChange={handleKitChange} className="solar-input">
                                    <option value="Cerâmico">Cerâmico (colonial)</option>
                                    <option value="Metálico">Metálico (trapezoidal)</option>
                                    <option value="Fibrocimento">Fibrocimento</option>
                                    <option value="Solo">Solo (estrutura rastreadora)</option>
                                    <option value="Laje">Laje / Terraço</option>
                                </select>
                            </div>
                            <div className="sm:col-span-1">
                                <label className="solar-label">Observações Técnicas</label>
                                <input name="observacoes" value={kitConfig.observacoes} onChange={handleKitChange}
                                    className="solar-input" placeholder="Ex: Inversor externo coberto, sombra parcial manhã" />
                            </div>
                        </div>
                    </div>

                </div>

                <div className="mt-8 flex gap-3">
                    <button
                        onClick={() => setEtapa('pdf')}
                        className="btn-solar flex-1 py-4 text-lg font-black"
                    >
                        📄 GERAR PDF PROFISSIONAL →
                    </button>
                </div>
            </main>
        );
    }

    // ETAPA 2: O PDF EM SI
    return (
        <main className="min-h-screen bg-slate-100 flex flex-col items-center py-10 print:p-0 print:bg-white">
            {/* Controle de Impressão */}
            <div className="fixed top-6 right-6 z-50 flex gap-3 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="bg-amber-500 hover:bg-amber-400 text-white font-black px-8 py-4 rounded-2xl shadow-2xl shadow-amber-500/20 transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95"
                >
                    🖨️ IMPRIMIR (PDF)
                </button>
                <button
                    onClick={() => setEtapa('config')}
                    className="bg-white/90 backdrop-blur text-slate-900 border border-slate-200 font-bold px-6 py-4 rounded-2xl shadow-xl transition-all"
                >
                    ← Editar Kit
                </button>
            </div>

            <div className="shadow-[0_0_100px_rgba(0,0,0,0.1)] print:shadow-none">
                <ProposalCover
                    cliente={resultado.nomeCliente}
                    data={new Date().toLocaleDateString('pt-BR')}
                    kitConfig={kitConfig}
                />
                <ProposalContent resultado={resultado} kitConfig={kitConfig} />
            </div>

            <style jsx global>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    body { margin: 0; -webkit-print-color-adjust: exact; }
                    .page-break-after { page-break-after: always; }
                }
                * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            `}</style>
        </main>
    );
}

export default function PropostaPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Carregando dados da proposta...</div>}>
            <PropostaInner />
        </Suspense>
    );
}
