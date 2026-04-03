'use client';

import { useMemo } from 'react';
import { CONFIG } from '@/lib/config';
import { KitConfig } from '@/app/proposta/page';

interface ProposalCoverProps {
    cliente: string;
    data: string;
    kitConfig?: KitConfig;
}

export default function ProposalCover({ cliente, data, kitConfig }: ProposalCoverProps) {
    const validade = new Date();
    validade.setDate(validade.getDate() + 7);
    const validadeStr = validade.toLocaleDateString('pt-BR');
    // Ref# estável por sessão — useMemo previne que rerender gere um número diferente
    const refNumber = useMemo(() => Math.floor(Math.random() * 9000) + 1000, []);

    return (
        <section className="relative h-[297mm] w-[210mm] bg-slate-950 text-white overflow-hidden flex flex-col justify-between p-20 page-break-after">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-amber-500/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px]" />
            </div>

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <span className="text-5xl">{CONFIG.EMPRESA.LOGO}</span>
                    <span className="text-2xl font-black tracking-tighter uppercase">{CONFIG.EMPRESA.NOME}</span>
                </div>
                <div className="text-right">
                    <div className="text-amber-400 font-bold text-sm tracking-widest uppercase">Proposta Comercial</div>
                    <div className="text-slate-500 text-xs">Ref: #SOL-{refNumber}</div>
                </div>
            </div>

            {/* Main Title */}
            <div className="relative z-10 mt-20">
                <h1 className="text-7xl font-black leading-[0.9] tracking-tighter mb-6">
                    PROPOSTA DE <br />
                    <span className="text-amber-400">SISTEMA <br /> FOTOVOLTAICO</span>
                </h1>
                <p className="text-slate-400 text-xl max-w-md leading-relaxed border-l-2 border-amber-400 pl-6">
                    {CONFIG.EMPRESA.SLOGAN}
                </p>
            </div>

            {/* Client Info Box */}
            <div className="relative z-10 grid grid-cols-2 gap-12 mt-auto">
                <div>
                    <div className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-4">Informações do Cliente</div>
                    <div className="space-y-4">
                        <div>
                            <div className="text-slate-400 text-xs uppercase font-bold tracking-wider">Cliente</div>
                            <div className="text-xl font-bold text-white">{cliente}</div>
                        </div>
                        <div>
                            <div className="text-slate-400 text-xs uppercase font-bold tracking-wider">Local da Instalação</div>
                            <div className="text-white">{kitConfig?.enderecoInstalacao || 'Residencial / Comercial'}</div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-4">Detalhes da Proposta</div>
                    <div className="space-y-4">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-400 text-xs">Data</span>
                            <span className="text-white font-medium">{data}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-400 text-xs">Validade</span>
                            <span className="text-amber-400 font-bold">{validadeStr}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-400 text-xs">Responsável</span>
                            <span className="text-white font-medium">{CONFIG.EMPRESA.RESPONSAVEL}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer decoration */}
            <div className="relative z-10 pt-12 mt-12 border-t border-slate-800/50 flex justify-between items-end">
                <div className="text-[10px] text-slate-600 uppercase tracking-widest leading-relaxed">
                    © 2026 {CONFIG.EMPRESA.NOME} <br />
                    Todos os direitos reservados
                </div>
                <div className="h-1 w-32 bg-gradient-to-r from-amber-500 to-transparent" />
            </div>
        </section>
    );
}
