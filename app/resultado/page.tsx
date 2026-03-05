'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SimulacaoResultado } from '@/types/simulation';
import ResultCard from '@/components/ResultCard';
import EnergyChart from '@/components/EnergyChart';
import InvestmentChart from '@/components/InvestmentChart';
import MonthlyChart from '@/components/MonthlyChart';

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;

const scoreConfig = {
    Excelente: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', bar: 'bg-emerald-400', pct: 100 },
    Ótimo: { color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30', bar: 'bg-amber-400', pct: 80 },
    Bom: { color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30', bar: 'bg-blue-400', pct: 60 },
    Regular: { color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/30', bar: 'bg-slate-400', pct: 40 },
};

export default function ResultadoPage() {
    const router = useRouter();
    const [resultado, setResultado] = useState<SimulacaoResultado | null>(null);
    const [mesesSemSolar, setMesesSemSolar] = useState(0);

    useEffect(() => {
        const raw = localStorage.getItem('simulacao_resultado');
        if (!raw) { router.push('/'); return; }
        const parsed = JSON.parse(raw);
        setResultado(parsed);
        // Persistir também para a página de proposta
        localStorage.setItem('lastSimulation', raw);
    }, [router]);

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
                            className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:border-amber-400 hover:text-amber-400 text-sm transition-all"
                        >
                            🖨️ Imprimir
                        </button>
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                                `☀️ *Proposta Solar — ${resultado.nomeCliente}*\n\n` +
                                `📐 Potência: ${resultado.potenciaInstaladaKwp} kWp (${resultado.numeroModulos} módulos)\n` +
                                `💰 Investimento: ${fmt(resultado.investimentoTotal)}\n` +
                                `📉 Econo. Média: ${fmt(resultado.economiaMensalMedia)}\n` +
                                `⏱️ Payback: ${resultado.paybackSimplesAnos} anos\n` +
                                `📊 TIR: ${fmtPct(resultado.tir)} a.a.\n\n` +
                                `Quer o VPL detalhado? Entre em contato!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition-all flex items-center gap-2"
                        >
                            <span>📲</span> Enviar para Cliente
                        </a>
                    </div>
                </div>

                {/* ===== DASHBOARD RESUMO ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Score */}
                    <div className={`glass-card p-5 border ${score.bg} fade-in col-span-1 lg:col-span-1`}>
                        <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Viabilidade do Investimento</div>
                        <div className={`text-4xl font-black ${score.color}`}>{resultado.scoreViabilidade}</div>
                        <div className="text-slate-400 text-sm mt-3 leading-tight">{resultado.scoreDescricao}</div>
                        <div className="mt-4">
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${score.bar} rounded-full transition-all duration-1000`}
                                    style={{ width: `${score.pct}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* VPL e TIR */}
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
                    <ResultCard icon="💰" label="Investimento" value={fmt(resultado.investimentoTotal)} highlight delay={1} />
                    <ResultCard icon="📉" label="Economia Média" value={fmt(resultado.economiaMensalMedia)} subValue={`R$ ${resultado.economiaDiariaMedia.toFixed(2)} /dia`} delay={2} />
                    <ResultCard icon="⏱️" label="Payback Simples" value={`${resultado.paybackSimplesAnos} anos`} subValue={`Em ${resultado.dataPaybackSimples}`} delay={3} />
                    <ResultCard icon="⏳" label="Payback Descontado" value={`${resultado.paybackDescontadoAnos} anos`} subValue="Corrige o valor do dinheiro" delay={4} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <ResultCard icon="📐" label="Potência do Sistema" value={`${resultado.potenciaInstaladaKwp} kWp`} subValue={`${resultado.numeroModulos} painéis de ${resultado.potenciaModuloWp}W`} delay={5} />
                    <ResultCard icon="🎯" label="Eficiência (PR)" value={fmtPct(resultado.pr)} subValue="Performance do equipamento" delay={6} />
                    <ResultCard icon="🔋" label="Compensação Real" value={fmtPct(0.85)} subValue="Lado B e encargos inclusos" delay={7} />
                    <ResultCard icon="🏦" label="Lucro em 25 Anos" value={fmt(resultado.economiaAcumulada25Anos)} highlight delay={8} />
                </div>

                {/* ===== GRÁFICOS E ENGENHARIA ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Geração Mensal */}
                    <div className="glass-card p-6 fade-in lg:col-span-1">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <span className="text-amber-400 text-lg">📊</span> Sazonalidade da Geração
                        </h3>
                        <MonthlyChart geracao={resultado.geracaoMensal} />
                        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 text-xs text-slate-400 text-center">
                            A geração varia conforme a irradiação mensal da sua região.
                        </div>
                    </div>

                    {/* Comparativo Investimentos */}
                    <div className="glass-card p-6 fade-in lg:col-span-2">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2 uppercase tracking-wider">
                            <span className="text-emerald-400 text-lg">☀️</span> Retorno vs Mercado (10 Anos)
                        </h3>
                        <InvestmentChart comparativo={resultado.comparativoInvestimentos} investimentoTotal={resultado.investimentoTotal} />
                    </div>
                </div>

                {/* ===== STORYTELLING E URGÊNCIA ===== */}
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

                {/* ===== CTA FINAL ===== */}
                <div className="text-center space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => router.push('/proposta')}
                            className="btn-solar sm:max-w-xs flex items-center justify-center gap-2"
                        >
                            📄 GERAR PROPOSTA PROFISSIONAL (PDF)
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-3 rounded-xl border border-slate-700 text-slate-500 hover:text-slate-300 transition-all text-sm"
                        >
                            ← Editar Parâmetros
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
