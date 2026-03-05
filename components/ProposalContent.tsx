'use client';

import { CONFIG } from '@/lib/config';
import { SimulacaoResultado } from '@/types/simulation';

interface ProposalContentProps {
    resultado: SimulacaoResultado;
}

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

const fmtPct = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1 }).format(v);

export default function ProposalContent({ resultado }: ProposalContentProps) {
    const mesesSemSolar = 120; // 10 anos

    return (
        <div className="bg-white text-slate-900 font-sans">

            {/* SEÇÃO 2: APRESENTAÇÃO DA EMPRESA */}
            <section className="h-[297mm] w-[210mm] p-20 flex flex-col justify-center page-break-after">
                <div className="max-w-3xl">
                    <h2 className="text-amber-500 font-black text-xs uppercase tracking-[0.3em] mb-4">Quem somos</h2>
                    <h3 className="text-5xl font-black text-slate-950 mb-12 leading-tight">Expertise em <br />Energia Renovável</h3>

                    <div className="space-y-8 text-xl text-slate-600 leading-relaxed">
                        <p>
                            A <strong className="text-slate-950">{CONFIG.EMPRESA.NOME}</strong> é especializada em soluções completas de geração fotovoltaica,
                            projetadas para transformar telhados em ativos financeiros de alta performance.
                        </p>
                        <p>
                            {CONFIG.EMPRESA.EXPERIENCIA}
                        </p>
                        <div className="pt-12 grid grid-cols-2 gap-8 border-t border-slate-100">
                            <div>
                                <div className="text-amber-500 font-bold text-sm uppercase tracking-widest mb-2">Responsável Técnico</div>
                                <div className="text-slate-950 font-bold">{CONFIG.EMPRESA.RESPONSAVEL}</div>
                                <div className="text-slate-500 text-sm">{CONFIG.EMPRESA.CREA}</div>
                            </div>
                            <div>
                                <div className="text-amber-500 font-bold text-sm uppercase tracking-widest mb-2">Compromisso</div>
                                <div className="text-slate-950 font-bold">Resiliência e Performance</div>
                                <div className="text-slate-500 text-sm">Garantia de atendimento técnico</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEÇÃO 3: RESUMO EXECUTIVO DO PROJETO */}
            <section className="h-[297mm] w-[210mm] p-20 flex flex-col justify-center page-break-after bg-slate-50">
                <h2 className="text-amber-600 font-black text-xs uppercase tracking-[0.3em] mb-4">Resumo Executivo</h2>
                <h3 className="text-5xl font-black text-slate-950 mb-16 underline decoration-amber-400 decoration-8 underline-offset-8">Principais Indicadores</h3>

                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="text-4xl mb-4">⚡</div>
                        <div className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-1">Potência do Sistema</div>
                        <div className="text-4xl font-black text-slate-950">{resultado.potenciaInstaladaKwp} kWp</div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="text-4xl mb-4">☀️</div>
                        <div className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-1">Produção Mensal</div>
                        <div className="text-4xl font-black text-slate-950">{Math.round(resultado.geracaoAnualTotal / 12)} kWh</div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="text-4xl mb-4">🏠</div>
                        <div className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-1">Consumo Médio</div>
                        <div className="text-4xl font-black text-slate-950">{resultado.economiaMensalMedia > 0 ? (resultado.economiaMensalMedia / (0.95 * 0.95)).toFixed(0) : 'Calculando...'} kWh</div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="text-4xl mb-4">🔋</div>
                        <div className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-1">Compensação Real</div>
                        <div className="text-4xl font-black text-emerald-600">{fmtPct(CONFIG.COMPENSACAO_ENERGIA)}</div>
                    </div>
                </div>

                <div className="mt-12 p-8 bg-amber-500 rounded-3xl text-white">
                    <div className="text-xs uppercase font-bold tracking-widest opacity-80 mb-2">Impacto Financeiro Final (25 Anos)</div>
                    <div className="text-6xl font-black">{fmt(resultado.economiaAcumulada25Anos)}</div>
                    <div className="mt-4 text-white/90 text-sm italic">
                        "O sol não envia boletos. Transforme seu passivo em ativo fixo."
                    </div>
                </div>
            </section>

            {/* SEÇÃO 5 & 6: DIMENSIONAMENTO E COMPOSIÇÃO */}
            <section className="h-[297mm] w-[210mm] p-20 page-break-after">
                <h2 className="text-amber-500 font-black text-xs uppercase tracking-[0.3em] mb-4">Engenharia Solar</h2>
                <h3 className="text-4xl font-black text-slate-950 mb-12">Especificações do Sistema</h3>

                <div className="mb-16">
                    <h4 className="text-sm font-bold border-b-2 border-slate-100 pb-2 mb-6 uppercase tracking-wider text-slate-400">Dados Técnicos</h4>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Módulos Fotovoltaicos</span>
                            <span className="font-bold">{resultado.numeroModulos} unidades</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Potência por Módulo</span>
                            <span className="font-bold">{resultado.potenciaModuloWp}W</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Tecnologia</span>
                            <span className="font-bold">Monocristalino Half-Cell</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Eficiência (PR)</span>
                            <span className="font-bold">{fmtPct(resultado.pr)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Área Estimada</span>
                            <span className="font-bold">{Math.round(resultado.numeroModulos * 2.5)} m²</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Inversor Sugerido</span>
                            <span className="font-bold">High Performance</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-bold border-b-2 border-slate-100 pb-2 mb-6 uppercase tracking-wider text-slate-400">Composição do Fornecimento</h4>
                    <table className="w-full text-left">
                        <thead className="text-xs uppercase text-slate-400 tracking-widest">
                            <tr>
                                <th className="pb-4">Item</th>
                                <th className="pb-4">Descrição Técnica</th>
                                <th className="pb-4 text-right">Qtd</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-slate-700">
                            <tr className="border-b border-slate-50">
                                <td className="py-4 font-bold text-slate-950">Módulo Solar</td>
                                <td className="py-4 font-medium italic text-slate-500">Painéis Tier-1 de alta eficiência</td>
                                <td className="py-4 text-right font-black">{resultado.numeroModulos}</td>
                            </tr>
                            <tr className="border-b border-slate-50">
                                <td className="py-4 font-bold text-slate-950">Inversor</td>
                                <td className="py-4 font-medium italic text-slate-500">Inversor Interativo com monitoramento Wi-Fi</td>
                                <td className="py-4 text-right font-black">1</td>
                            </tr>
                            <tr className="border-b border-slate-50">
                                <td className="py-4 font-bold text-slate-950">Estrutura</td>
                                <td className="py-4 font-medium italic text-slate-500">Alumínio anodizado e fixação em aço inox</td>
                                <td className="py-4 text-right font-black">1 kit</td>
                            </tr>
                            <tr className="border-b border-slate-50">
                                <td className="py-4 font-bold text-slate-950">Cabos/Proteção</td>
                                <td className="py-4 font-medium italic text-slate-500">String Box e Condutores Solar 1.8kV</td>
                                <td className="py-4 text-right font-black">1 kit</td>
                            </tr>
                            <tr>
                                <td className="py-4 font-bold text-slate-950">Serviços</td>
                                <td className="py-4 font-medium italic text-slate-500">Instalação, ART e Homologação</td>
                                <td className="py-4 text-right font-black">Incluso</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* SEÇÃO 9: ANÁLISE FINANCEIRA */}
            <section className="h-[297mm] w-[210mm] p-20 page-break-after bg-slate-950 text-white">
                <h2 className="text-amber-500 font-black text-xs uppercase tracking-[0.3em] mb-4">Business Intelligence</h2>
                <h3 className="text-5xl font-black mb-12">Viabilidade Econômica</h3>

                <div className="space-y-12">
                    <div className="grid grid-cols-2 gap-12">
                        <div>
                            <div className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-2">Investimento Total</div>
                            <div className="text-5xl font-black text-amber-500">{fmt(resultado.investimentoTotal)}</div>
                        </div>
                        <div>
                            <div className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-2">Retorno Anual (TIR)</div>
                            <div className="text-5xl font-black">{fmtPct(resultado.tir)}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <div className="text-white/60 text-[10px] uppercase font-bold tracking-widest mb-1">Payback Simples</div>
                            <div className="text-2xl font-black text-amber-400">{resultado.paybackSimplesAnos} Anos</div>
                        </div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <div className="text-white/60 text-[10px] uppercase font-bold tracking-widest mb-1">Payback Descontado</div>
                            <div className="text-2xl font-black text-amber-400">{resultado.paybackDescontadoAnos} Anos</div>
                        </div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <div className="text-white/60 text-[10px] uppercase font-bold tracking-widest mb-1">Valor do VPL</div>
                            <div className="text-2xl font-black text-emerald-400">{fmt(resultado.vpl)}</div>
                        </div>
                    </div>

                    <div className="pt-12">
                        <h4 className="text-xl font-bold mb-6 text-amber-500 italic">Comparativo de Mercado</h4>
                        <p className="text-slate-400 leading-relaxed mb-8">
                            Enquanto investimentos tradicionais rendem apenas sobre o capital, o sistema fotovoltaico elimina uma
                            despesa crescente (inflação energética), gerando um lucro líquido de
                            <strong className="text-white"> {fmt(resultado.vpl)}</strong> já descontando todos os custos financeiros.
                        </p>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                                <span className="font-bold">☀️ Energia Solar</span>
                                <span className="text-amber-400 font-black">{fmtPct(resultado.tir)} a.a.</span>
                            </div>
                            <div className="flex justify-between items-center opacity-40 p-4">
                                <span>🏦 Renda Fixa (CDI)</span>
                                <span>10.0% a.a.</span>
                            </div>
                            <div className="flex justify-between items-center opacity-40 p-4">
                                <span>🏢 Fundos Imobiliários</span>
                                <span>8.0% a.a.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEÇÃO 10 & 11: GARANTIAS E ESCOPO */}
            <section className="h-[297mm] w-[210mm] p-20 page-break-after">
                <div className="flex justify-between items-start mb-16">
                    <div>
                        <h2 className="text-amber-500 font-black text-xs uppercase tracking-[0.3em] mb-4">Segurança</h2>
                        <h3 className="text-4xl font-black text-slate-950">Garantias e Escopo</h3>
                    </div>
                    <div className="text-3xl font-black text-slate-100 uppercase tracking-tighter -rotate-12 translate-y-4">
                        Quality Check
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-16">
                    <div>
                        <h4 className="text-xs uppercase font-black text-slate-400 tracking-widest mb-6">Prazos de Garantia</h4>
                        <div className="space-y-6">
                            <div className="border-l-4 border-amber-500 pl-4">
                                <div className="text-sm font-bold text-slate-950">Módulos Solares</div>
                                <div className="text-xs text-slate-500">{CONFIG.GARANTIAS.MODULOS}</div>
                            </div>
                            <div className="border-l-4 border-amber-500 pl-4">
                                <div className="text-sm font-bold text-slate-950">Performance 25 Anos</div>
                                <div className="text-xs text-slate-500">{CONFIG.GARANTIAS.PERFORMANCE}</div>
                            </div>
                            <div className="border-l-4 border-amber-500 pl-4">
                                <div className="text-sm font-bold text-slate-950">Inversores</div>
                                <div className="text-xs text-slate-500">{CONFIG.GARANTIAS.INVERSOR}</div>
                            </div>
                            <div className="border-l-4 border-amber-500 pl-4">
                                <div className="text-sm font-bold text-slate-950">Estrutura de Fixação</div>
                                <div className="text-xs text-slate-500">{CONFIG.GARANTIAS.ESTRUTURA}</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs uppercase font-black text-slate-400 tracking-widest mb-6">O que está incluso?</h4>
                        <ul className="space-y-4 text-sm text-slate-700 font-medium">
                            <li className="flex items-center gap-2">✅ Projeto elétrico completo</li>
                            <li className="flex items-center gap-2">✅ ART (Resp. Técnica)</li>
                            <li className="flex items-center gap-2">✅ Fornecimento de todos os kits</li>
                            <li className="flex items-center gap-2">✅ Mão de obra especializada</li>
                            <li className="flex items-center gap-2">✅ Homologação na Concessionária</li>
                            <li className="flex items-center gap-2">✅ Treinamento de monitoramento</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* SEÇÃO FINAL: ASSINATURA */}
            <section className="h-[297mm] w-[210mm] p-20 flex flex-col justify-between">
                <div>
                    <h2 className="text-amber-500 font-black text-xs uppercase tracking-[0.3em] mb-4">Aprovação</h2>
                    <h3 className="text-5xl font-black text-slate-950 mb-12 leading-tight">Vamos iniciar sua <br />independência energética?</h3>

                    <p className="text-slate-500 text-lg leading-relaxed max-w-2xl mb-24">
                        Esta proposta foi desenhada exclusivamente para as necessidades energéticas do seu imóvel,
                        equilibrando o menor custo de investimento com a maior durabilidade tecnológica do mercado brasileiro.
                    </p>
                </div>

                <div className="space-y-20">
                    <div className="grid grid-cols-2 gap-20">
                        <div className="border-t-2 border-slate-900 pt-8">
                            <div className="text-xs uppercase font-black tracking-widest text-slate-300 mb-8">Pela contratada</div>
                            <div className="text-lg font-black">{CONFIG.EMPRESA.RESPONSAVEL}</div>
                            <div className="text-sm text-slate-500">{CONFIG.EMPRESA.NOME}</div>
                        </div>

                        <div className="border-t-2 border-slate-200 pt-8">
                            <div className="text-xs uppercase font-black tracking-widest text-slate-100 mb-8">Aceite do Cliente</div>
                            <div className="text-lg font-black text-slate-200">________________________</div>
                            <div className="text-sm text-slate-400">Assinatura / Data</div>
                        </div>
                    </div>

                    <div className="text-center pt-20 border-t border-slate-100 opacity-30 italic text-[10px] text-slate-500">
                        *Simulação baseada em dados históricos de irradiação. Os resultados reais podem variar conforme sombreamento local e condições climáticas extremas.
                        Compensação de {fmtPct(CONFIG.COMPENSACAO_ENERGIA)} estimada considerando encargos setoriais e Fio B conforme Lei 14.300.
                    </div>
                </div>
            </section>

        </div>
    );
}
