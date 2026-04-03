'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SimulacaoInput } from '@/types/simulation';
import { CRMStorage } from '@/lib/storage';
import { CONFIG } from '@/lib/config';

interface SimulatorFormProps {
    leadId?: string;
}

export default function SimulatorForm({ leadId }: SimulatorFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [modoAgente, setModoAgente] = useState<'express' | 'investidor' | 'tecnico' | 'financiamento'>('tecnico');

    const [form, setForm] = useState<SimulacaoInput>({
        nomeCliente: '',
        consumoMensal: 0,
        valorConta: 0,
        tarifaEnergia: CONFIG.TARIFA_PADRAO,
        cidade: '',
        tipoConexao: 'Bifásico',
        tipoGeracao: 'Junto à Carga',
        valorPorKwp: CONFIG.INVESTIMENTO_PADRAO_KWP,
        kwpProjeto: 0,
        potenciaModuloWp: 550,
        orientacao: 'Norte',
        taxaDesconto: 0.12,  // 12% a.a. (Selic/Custo Op)
        condicaoPagamento: '',
        capexFinal: undefined
    });

    // AUTO-PREFILL NO CASO DE EDIÇÃO
    useEffect(() => {
        if (leadId) {
            const lead = CRMStorage.getLeadById(leadId);
            // Sincroniza o modo visual do form com o modo atual do Lead
            if (lead?.modoVendaAtivo) setModoAgente(lead.modoVendaAtivo);

            const propsOfThisLead = CRMStorage.getProposalsByLead(leadId);
            if (propsOfThisLead.length > 0) {
                const latest = propsOfThisLead[0];
                setForm(prev => ({ ...prev, ...latest.input }));
            } else {
                if (lead) {
                    setForm(prev => ({ ...prev, nomeCliente: lead.nome }));
                }
            }
        }
    }, [leadId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // Rodada 14: Defesa Anti-Vírgula para Mobile (Transforma R$ 0,95 em 0.95 Float)
        let safeStr = value;
        if (typeof value === 'string' && type === 'number') {
            safeStr = value.replace(',', '.');
        }

        const numValue = type === 'number' ? (safeStr === '' ? 0 : parseFloat(safeStr)) : value;

        setForm((prev) => {
            const up = { ...prev, [name]: numValue };

            // UX Minimalista: Se preencheu a conta e o consumo tá zero, tenta adivinhar. E vice versa.
            if (name === 'valorConta' && Number(numValue) > 0 && prev.consumoMensal === 0) {
                up.consumoMensal = Math.round(Number(numValue) / prev.tarifaEnergia);
            }
            if (name === 'consumoMensal' && Number(numValue) > 0 && prev.valorConta === 0) {
                up.valorConta = Math.round(Number(numValue) * prev.tarifaEnergia);
            }

            return up as any;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload = { ...form };

        // UX: Se estiver em express ou esqueceu a Pôtencia da Usina, a IA do front tira a média!
        if (payload.kwpProjeto <= 0 && payload.consumoMensal > 0) {
            // Calculo bruto de rendimento BR (Consumo / 120) // Assumindo PR 80% e Irradiacao 5.0
            payload.kwpProjeto = parseFloat((payload.consumoMensal / 120).toFixed(2));
        }

        try {
            const res = await fetch('/api/simular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (!json.success) {
                // Mensagem customizada se o backend recusar por Taxa Mínima ou outra validação
                setError(json.error || 'Erro desconhecido. Preencha todos os campos obrigatórios.');
                setLoading(false);
                return;
            }

            if (leadId) {
                const proposal = CRMStorage.saveProposal({
                    leadId,
                    titulo: 'Orçamento Base ' + new Date().toLocaleDateString(),
                    input: payload,
                    resultado: json.data
                });

                // Mudar status do lead
                CRMStorage.updateLeadStatus(leadId, 'precificando');

                router.push(`/resultado?leadId=${leadId}&proposalId=${proposal.id}`);
            } else {
                localStorage.setItem('simulacao_resultado', JSON.stringify(json.data));
                router.push('/resultado');
            }
        } catch {
            setError('Erro ao conectar com o servidor. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* Bloco 1: Identidade */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-amber-500 transition-colors"></div>
                <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                    👤 Dados do Cliente
                </h3>
                <div>
                    <label htmlFor="nomeCliente" className="solar-label">Nome do Cliente ou Razão Social</label>
                    <input
                        id="nomeCliente" name="nomeCliente" type="text"
                        className="solar-input" placeholder="Ex: Farmácias São Paulo"
                        value={form.nomeCliente} onChange={handleChange} required
                    />
                </div>
            </div>

            {/* Bloco 2: Perfil Consumo */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-blue-500 transition-colors"></div>
                <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                    ⚡ Perfil Energético
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                        <label htmlFor="consumoMensal" className="solar-label">Consumo (kWh) *</label>
                        <input
                            id="consumoMensal" name="consumoMensal" type="number"
                            min="1" step="1" className="solar-input focus:border-blue-400 focus:bg-blue-950/20" placeholder="Ex: 1000"
                            value={form.consumoMensal || ''} onChange={handleChange} required
                        />
                        <p className="text-[10px] text-slate-500 mt-1 italic">Preencha um para inferir o outro</p>
                    </div>
                    <div className="sm:col-span-1">
                        <label htmlFor="valorConta" className="solar-label">Fatura Atual (R$) *</label>
                        <input
                            id="valorConta" name="valorConta" type="number"
                            min="1" step="0.01" className="solar-input focus:border-amber-400 focus:bg-amber-950/20" placeholder="Ex: 800"
                            value={form.valorConta || ''} onChange={handleChange} required
                        />
                    </div>
                    {modoAgente !== 'express' && (
                        <div className="sm:col-span-1">
                            <label htmlFor="tarifaEnergia" className="solar-label">Tarifa (R$/kWh)</label>
                            <input
                                id="tarifaEnergia" name="tarifaEnergia" type="number"
                                min="0.1" step="0.01" className="solar-input font-mono"
                                value={form.tarifaEnergia || ''} onChange={handleChange} required
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Bloco 3: Engenharia (Fio B / Conexão) */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-emerald-500 transition-colors"></div>
                <h3 className="text-emerald-500 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                    {modoAgente === 'express' ? '📍 Rede & Modalidade' : '⚙️ Perfil Técnico (Fio B / Taxa Mínima)'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="tipoConexao" className="solar-label">Padrão de Entrada (Limita a Economia Mínima)</label>
                        <select
                            id="tipoConexao" name="tipoConexao"
                            className="solar-input"
                            value={form.tipoConexao} onChange={handleChange}
                        >
                            <option value="Monofásico">Monofásico (Retém 30 kWh)</option>
                            <option value="Bifásico">Bifásico (Retém 50 kWh)</option>
                            <option value="Trifásico">Trifásico (Retém 100 kWh)</option>
                        </select>
                        <p className="text-[10px] text-amber-500/80 mt-1 
                            bg-amber-500/5 p-2 rounded border border-amber-500/20 italic">
                            💡 O cliente não pode zerar a conta. Ele sempre pagará esta taxa de prontidão ("aluguel" do fio).
                        </p>
                    </div>
                    <div>
                        <label htmlFor="tipoGeracao" className="solar-label">Modalidade de Compensação (Lei 14.300)</label>
                        <select
                            id="tipoGeracao" name="tipoGeracao"
                            className="solar-input"
                            value={form.tipoGeracao} onChange={handleChange}
                        >
                            <option value="Junto à Carga">Telhado Próprio / Junto à Carga</option>
                            <option value="Rateio (Geração Remota)">Autoconsumo Remoto / Rateio</option>
                        </select>
                        <p className="text-[10px] text-slate-500 mt-2">Geração Local tem mais desconto na distribuição (Simultaneidade).</p>
                    </div>
                </div>
            </div>

            {modoAgente !== 'express' && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-500/30 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-slate-500 transition-colors"></div>
                    <h3 className="text-slate-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                        📐 Engenharia do Sistema
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="valorPorKwp" className="solar-label">Custo Turn-key (R$/kWp)</label>
                            <input
                                id="valorPorKwp" name="valorPorKwp" type="number"
                                min="1" step="0.01" className="solar-input"
                                value={form.valorPorKwp || ''} onChange={handleChange} required
                            />
                        </div>
                        <div>
                            <label htmlFor="kwpProjeto" className="solar-label">Potência Sugerida (kWp)</label>
                            <input
                                id="kwpProjeto" name="kwpProjeto" type="number"
                                min="0.1" step="0.1" className="solar-input" placeholder="Ex: 8.5"
                                value={form.kwpProjeto || ''} onChange={handleChange} required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="potenciaModuloWp" className="solar-label">Potência do Módulo (Wp)</label>
                            <input
                                id="potenciaModuloWp" name="potenciaModuloWp" type="number"
                                min="100" step="5" className="solar-input"
                                value={form.potenciaModuloWp || ''} onChange={handleChange} required
                            />
                        </div>
                        <div>
                            <label htmlFor="orientacao" className="solar-label">Orientação do Telhado</label>
                            <select
                                id="orientacao" name="orientacao"
                                className="solar-input appearance-none bg-slate-900"
                                value={form.orientacao} onChange={handleChange} required
                            >
                                <option value="Norte">Norte (Ideal - 100%)</option>
                                <option value="Nordeste">Nordeste (97%)</option>
                                <option value="Noroeste">Noroeste (97%)</option>
                                <option value="Leste">Leste (92%)</option>
                                <option value="Oeste">Oeste (92%)</option>
                                <option value="Sul">Sul (Baixa Eficiência - 80%)</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="taxaDesconto" className="solar-label">Custo de Oportun. (TMA %)</label>
                            <input
                                id="taxaDesconto" name="taxaDesconto" type="number"
                                min="0" step="0.01" className="solar-input"
                                placeholder="Ex: 0.12 = 12% a.a."
                                value={form.taxaDesconto || ''} onChange={handleChange} required
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Reflete a SELIC ou juros da poupança (ex: 12% a.a = 0.12).</p>
                        </div>
                    </div>
                </div>
            )}

            {modoAgente === 'tecnico' && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-purple-500 transition-colors"></div>
                    <h3 className="text-purple-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                        🛡️ Parâmetros de Fechamento B2B
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="capexFinal" className="solar-label">CAPEX Fechado (R$ Orçamento Exato)</label>
                            <input
                                id="capexFinal" name="capexFinal" type="number"
                                min="1" step="0.01" className="solar-input border-purple-500/20 bg-purple-500/5 focus:bg-purple-500/10" placeholder="Ex: 27500.00"
                                value={form.capexFinal || ''} onChange={handleChange}
                            />
                            <p className="text-[10px] text-slate-500 mt-2">Derruba o valor em Reais calculados pelo Valor de kWp (se preenchido).</p>
                        </div>
                        <div>
                            <label htmlFor="condicaoPagamento" className="solar-label">Texto Comercial (Condições de Negócio)</label>
                            <input
                                id="condicaoPagamento" name="condicaoPagamento" type="text"
                                className="solar-input border-purple-500/20 bg-purple-500/5 focus:bg-purple-500/10" placeholder="Ex: Entrada 30% e 24x sem juros"
                                value={form.condicaoPagamento || ''} onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-950/50 border border-red-500/40 text-red-300 px-4 py-3 rounded-lg text-sm">
                    ⚠️ {error}
                </div>
            )}

            <button type="submit" className="btn-solar mt-4" disabled={loading}>
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Calculando...
                    </span>
                ) : (
                    modoAgente === 'express' ? '⚡ SIMULAÇÃO EXPRESSA' : '☀️ GERAR ORÇAMENTO TÉCNICO'
                )}
            </button>
        </form>
    );
}
