'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SimulacaoResultado } from '@/types/simulation';
import { CRMStorage } from '@/lib/storage';
import ResultCard from '@/components/ResultCard';
import EnergyChart from '@/components/EnergyChart';
import MonthlyChart from '@/components/MonthlyChart';
import ComparisonChart from '@/components/ComparisonChart';
import GrowthChart from '@/components/GrowthChart';

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;

const scoreConfig = {
    Excelente: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', bar: 'bg-emerald-400', pct: 100 },
    Ótimo: { color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30', bar: 'bg-amber-400', pct: 80 },
    Bom: { color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30', bar: 'bg-blue-400', pct: 60 },
    Regular: { color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/30', bar: 'bg-slate-400', pct: 40 },
};

import { Suspense } from 'react';

function ResultadoInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const proposalId = searchParams.get('proposalId');
    const leadId = searchParams.get('leadId');

    const [resultado, setResultado] = useState<SimulacaoResultado | null>(null);
    const [mesesSemSolar, setMesesSemSolar] = useState(0);
    const [leadMode, setLeadMode] = useState<string>('tecnico');

    useEffect(() => {
        if (leadId) {
            const lead = CRMStorage.getLeadById(leadId);
            if (lead?.modoVendaAtivo) setLeadMode(lead.modoVendaAtivo);
        }

        if (proposalId) {
            const prop = CRMStorage.getProposalById(proposalId);
            if (prop && prop.resultado) {
                setResultado(prop.resultado);
                return;
            }
        }

        const raw = localStorage.getItem('simulacao_resultado');
        if (!raw) { router.push('/'); return; }
        const parsed = JSON.parse(raw);
        setResultado(parsed);
    }, [router, proposalId, leadId]);

    // Contador de custo acumulado desde a simulação
    useEffect(() => {
        if (!resultado) return;
        const interval = setInterval(() => {
            setMesesSemSolar((prev) => prev + 1);
        }, 3000); // incrementa a cada 3s para ser dramático
        return () => clearInterval(interval);
    }, [resultado]);

    if (!resultado) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-slate-400 text-lg animate-pulse">☀️ Calculando o quanto você vai economizar...</div>
            </div>
        );
    }

    const score = scoreConfig[resultado.scoreViabilidade];
    // Economia mensal média usada para o contador dramático
    const custoAcumulado = fmt(mesesSemSolar * (resultado.economiaMensalMedia / 30));

    return (
        <main className="min-h-screen px-4 py-10 print:bg-white print:text-black">
            {/* Background glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none print:hidden">
                <div className="absolute top-[-10%] left-[50%] translate-x-[-50%] w-[900px] h-[500px] rounded-full"
                    style={{ background: 'radial-gradient(ellipse, rgba(251,191,36,0.05) 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">

                {/* ===== HEADER ===== */}
                <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <button onClick={() => router.push('/')}
                            className="text-slate-400 hover:text-amber-400 text-sm flex items-center gap-1 mb-3 transition-colors print:hidden">
                            ← Nova simulação
                        </button>
                        <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-full px-3 py-1 text-green-400 text-xs font-semibold mb-2">
                            ✅ Engenharia Solar Validada
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white">
                            Proposta Técnica — <span className="text-amber-400">{resultado.nomeCliente}</span>
                        </h1>
                    </div>
                    <div className="flex gap-2 print:hidden">
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-amber-400 hover:text-amber-400 text-sm transition-all shadow"
                        >
                            🖨️ Imprimir
                        </button>
                        <button
                            onClick={() => {
                                const text = `🚀 *PROPOSTA SOLAR: ${resultado.nomeCliente.toUpperCase()}*\n\n` +
                                    `Boas notícias! Sua simulação de viabilidade técnica ficou pronta. Veja os números de destaque:\n\n` +
                                    `💰 *Investimento:* ${fmt(resultado.investimentoTotal)}\n` +
                                    `📉 *Economia Mensal:* ${fmt(resultado.economiaMensalMedia)} (Dinheiro de volta no seu bolso!)\n` +
                                    `📈 *Lucro Total (25 anos):* ${fmt(resultado.economiaAcumulada25Anos)}\n` +
                                    `⏱️ *Payback:* ${resultado.paybackSimplesAnos} anos\n` +
                                    `🏆 *Rentabilidade:* ${fmtPct(resultado.tir)} a.a. (${resultado.tirMultiploCDI}x o CDI)\n\n` +
                                    `Sua economia acumulada equivale a ganhar *${resultado.equivalenciaEconomia}* de presente do sol. ☀️\n\n` +
                                    `Vamos agendar a visita técnica para fechar?`;
                                navigator.clipboard.writeText(text);
                                alert("Copy persuasivo copiado!");
                            }}
                            className="px-4 py-2 rounded-lg border border-green-600/50 text-green-400 bg-green-950/20 hover:bg-green-600 hover:text-white text-sm transition-all shadow"
                        >
                            📋 Copiar Copy
                        </button>
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                                `🚀 *PROPOSTA SOLAR: ${resultado.nomeCliente.toUpperCase()}*\n\n` +
                                `Boas notícias! Sua simulação de viabilidade técnica ficou pronta. Veja os números de destaque:\n\n` +
                                `💰 *Investimento:* ${fmt(resultado.investimentoTotal)}\n` +
                                `📉 *Economia Mensal:* ${fmt(resultado.economiaMensalMedia)} (Dinheiro de volta no seu bolso!)\n` +
                                `📈 *Lucro Total (25 anos):* ${fmt(resultado.economiaAcumulada25Anos)}\n` +
                                `⏱️ *Payback:* ${resultado.paybackSimplesAnos} anos\n` +
                                `🏆 *Rentabilidade:* ${fmtPct(resultado.tir)} a.a. (${resultado.tirMultiploCDI}x o CDI)\n\n` +
                                `Sua economia acumulada equivale a ganhar *${resultado.equivalenciaEconomia}* de presente do sol. ☀️\n\n` +
                                `Vamos agendar a visita técnica para fechar?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition-all flex items-center gap-2 shadow"
                        >
                            <span>📲</span> Enviar WhatsApp
                        </a>
                    </div>
                </div>

                {/* ===== DASHBOARD RESUMO ===== */}
                <div className={`grid grid-cols-1 ${leadMode === 'express' ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6 mb-8`}>
                    {/* Score */}
                    <div className={`glass-card p-5 border ${score.bg} fade-in col-span-1 lg:col-span-1`}>
                        <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Status da Oportunidade</div>
                        <div className={`text-4xl font-black ${score.color}`}>{resultado.scoreViabilidade}</div>
                        <div className="text-slate-400 text-sm mt-3 leading-tight">{resultado.scoreDescricao}</div>
                        <div className="mt-4">
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${score.bar} rounded-full transition-all duration-1000`}
                                    style={{ width: `${score.pct}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* VPL e TIR - Oculto no Express para nao assustar */}
                    {leadMode !== 'express' && (
                        <div className="glass-card p-5 border border-amber-400/20 fade-in col-span-1 lg:col-span-2 flex flex-col justify-center">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">VPL (Valor Presente Líquido)</div>
                                    <div className="text-3xl font-black text-amber-400">{fmt(resultado.vpl)}</div>
                                    <div className="text-slate-500 text-xs mt-1">Lucro real trazido a valor de hoje</div>
                                </div>
                                <div>
                                    <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">TIR (Retorno Anual)</div>
                                    <div className="text-3xl font-black text-white">{fmtPct(resultado.tir)} <span className="text-sm font-medium text-slate-400">a.a.</span></div>
                                    <div className="text-amber-400 text-xs font-bold mt-1 uppercase tracking-wider">🏆 {resultado.tirMultiploCDI}x CDI</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== CUSTO DA INÉRCIA ===== */}
                <div className="glass-card p-6 mb-8 border border-red-500/30 bg-red-950/10 fade-in">
                    <div className="flex items-start gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                            <div className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">⚠️ O custo de esperar</div>
                            <div className="text-5xl md:text-6xl font-black text-red-400 number-glow mb-2">
                                {fmt(resultado.totalPagoSemSolar25Anos)}
                            </div>
                            <p className="text-slate-400 text-base max-w-2xl">
                                é o valor total que será pago para a concessionária em 25 anos.
                                Com o solar, você transforma essa <span className="text-red-400 font-bold">despesa perdida</span> em um <span className="text-emerald-400 font-bold">patrimônio sólido</span>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ===== KPI GRID PRINCIPAL ===== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <ResultCard icon="💰" label="Invest. Estimado" value={fmt(resultado.investimentoTotal)} highlight delay={1} />
                    <ResultCard icon="📉" label="Economia Média" value={fmt(resultado.economiaMensalMedia)} subValue={`R$ ${resultado.economiaDiariaMedia.toFixed(2)} /dia`} delay={2} />
                    <ResultCard icon="🏢" label="Nova Conta (Residual)" value={fmt(resultado.custoFixoResidual)} subValue="Fio B + Ilum. Pública — sempre cobrado" delay={3} />
                    <ResultCard icon="🏦" label="Lucro em 25 Anos" value={fmt(resultado.economiaAcumulada25Anos)} highlight delay={4} />
                </div>

                {/* KPIs de Engenharia só para Tecnico / Investidor */}
                {leadMode !== 'express' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <ResultCard icon="📐" label="Potência do Sistema" value={`${resultado.potenciaInstaladaKwp} kWp`} subValue={`${resultado.numeroModulos} painéis de ${resultado.potenciaModuloWp}W`} delay={5} />
                        <ResultCard icon="🎯" label="Eficiência (PR)" value={fmtPct(resultado.pr)} subValue="Performance do equipamento" delay={6} />

                        {/* Redução percentual verdadeira no lugar do antigo hardcode do Lado B */}
                        <ResultCard
                            icon="🔋"
                            label="Redução na Fatura"
                            value={fmtPct(resultado.economiaMensalMedia / (resultado.economiaMensalMedia + resultado.custoFixoResidual))}
                            subValue="Porcentagem de economia isolada"
                            delay={7}
                        />
                        <ResultCard icon="⏳" label="Payback Descontado" value={`${resultado.paybackDescontadoAnos} anos`} subValue="Corrige o valor do dinheiro" delay={8} />
                    </div>
                )}

                {/* ===== GRÁFICOS E COMPARATIVOS ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Choque de Inércia vs Solar */}
                    <div className="glass-card p-6 fade-in lg:col-span-1 border border-red-500/20">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <span className="text-red-400 text-lg">⚠️</span> Custo Total 25 Anos vs Solução Solar
                        </h3>
                        {/* Custo Total do Solar = CapEx + (Residual Fixo * 12 * 25) + Manutenção 25 anos*/}
                        <ComparisonChart
                            inercia={resultado.totalPagoSemSolar25Anos}
                            solar={resultado.investimentoTotal + (resultado.custoFixoResidual * 12 * 25) + (resultado.investimentoTotal * 0.005 * 25)}
                        />
                        <div className="mt-4 p-3 bg-red-950/20 rounded-lg border border-red-500/10 text-[10px] text-slate-400 text-center uppercase tracking-widest">
                            Mostra a matemática óbvia ao longo do longo prazo
                        </div>
                    </div>

                    {/* Comparativo Investimentos */}
                    {leadMode !== 'express' && (
                        <div className="glass-card p-6 fade-in lg:col-span-1">
                            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <span className="text-emerald-400 text-lg">📈</span> Evolução Patrimonial (25 Anos)
                            </h3>
                            <div className="h-[300px]">
                                <GrowthChart
                                    dadosSolar={resultado.comparativoInvestimentos.solar}
                                    dadosCdi={resultado.comparativoInvestimentos.cdi}
                                />
                            </div>
                            <div className="mt-4 p-3 bg-emerald-950/20 rounded-lg border border-emerald-500/10 text-[10px] text-slate-400 text-center uppercase tracking-widest">
                                Solar vs Aplicação Financeira (CDI 10% a.a.)
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== STORYTELLING E URGÊNCIA ===== */}
                {leadMode !== 'express' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="glass-card p-6 border border-emerald-500/20 fade-in">
                            <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">💎 Valor Agregado</div>
                            <p className="text-slate-300 leading-relaxed">
                                Ao longo de 25 anos, sua economia líquida de <span className="text-emerald-400 font-bold">{fmt(resultado.economiaAcumulada25Anos)}</span> é equivalente
                                a adquirir <span className="text-white font-bold italic">{resultado.equivalenciaEconomia}</span> sem tirar um centavo extra do bolso.
                            </p>
                        </div>
                        <div className="glass-card p-6 border border-red-500/20 bg-red-950/5 fade-in">
                            <div className="text-red-400 text-xs font-bold uppercase tracking-widest mb-3">🔥 Urgência Comercial</div>
                            <p className="text-slate-300 leading-relaxed">
                                Enquanto você lê este relatório, sua conta continua subindo.
                                Cada mês sem solar custa <span className="text-red-400 font-bold">{fmt(resultado.economiaMensalMedia)}</span>.
                                Em um ano, o custo da sua hesitação será de <span className="text-red-400 font-bold">{fmt(resultado.economiaMensalMedia * 12)}</span>.
                            </p>
                        </div>
                    </div>
                )}

                {/* ===== CTA FINAL ===== */}
                <div className="text-center space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {leadMode !== 'express' ? (
                            <button
                                onClick={() => {
                                    if (proposalId) {
                                        router.push(`/proposta?proposalId=${proposalId}`);
                                    } else {
                                        router.push('/proposta');
                                    }
                                }}
                                className="btn-solar sm:max-w-xs flex items-center justify-center gap-2"
                            >
                                📄 GERAR PROPOSTA FINAL (PDF)
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    if (leadId) {
                                        CRMStorage.saveLead({ id: leadId, modoVendaAtivo: 'tecnico' } as any);
                                        router.push(`/simulador/${leadId}`);
                                    }
                                }}
                                className="btn-solar sm:max-w-md flex items-center justify-center gap-2 px-8 py-4 text-sm"
                            >
                                🔥 AVANÇAR PARA ORÇAMENTO TÉCNICO
                            </button>
                        )}
                        <button
                            onClick={() => leadId ? router.push(`/simulador/${leadId}`) : router.push('/')}
                            className="px-6 py-3 rounded-xl border border-slate-700 text-slate-500 hover:text-slate-300 transition-all text-sm"
                        >
                            ← Voltar / Ajustar
                        </button>
                    </div>
                    <p className="text-slate-600 text-[10px] uppercase tracking-widest">
                        SIMULAÇÃO TÉCNICA BASEADA EM MODELOS DINÂMICOS DE ENGENHARIA @ 2026
                    </p>
                </div>

            </div>
        </main>
    );
}

export default function ResultadoPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">☀️ Calculando...</div>}>
            <ResultadoInner />
        </Suspense>
    );
}
