'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SimulacaoInput } from '@/types/simulation';

export default function SimulatorForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState<SimulacaoInput>({
        nomeCliente: '',
        consumoMensal: 0,
        valorConta: 0,
        tarifaEnergia: 0.95, // Valor médio Brasil
        cidade: '',
        valorPorKwp: 3800,   // Valor médio mercado
        kwpProjeto: 0,
        potenciaModuloWp: 550,
        orientacao: 'Norte',
        taxaDesconto: 0.12,  // 12% a.a. (Selic/Custo Op)
    });

    useEffect(() => {
        if (form.consumoMensal > 0) {
            // Recalcula kwp recomendado se necessário (pode manter o anterior ou deixar o vendedor decidir)
            // setKwpRecomendado(calcularKwpRecomendado(form.consumoMensal));
        }
    }, [form.consumoMensal]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/simular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const json = await res.json();

            if (!json.success) {
                setError(json.error || 'Erro desconhecido');
                setLoading(false);
                return;
            }

            localStorage.setItem('simulacao_resultado', JSON.stringify(json.data));
            router.push('/resultado');
        } catch {
            setError('Erro ao conectar com o servidor. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label htmlFor="nomeCliente" className="solar-label">Nome do Cliente</label>
                <input
                    id="nomeCliente" name="nomeCliente" type="text"
                    className="solar-input" placeholder="Ex: João Silva"
                    value={form.nomeCliente} onChange={handleChange} required
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                    <label htmlFor="consumoMensal" className="solar-label">Consumo (kWh/mês)</label>
                    <input
                        id="consumoMensal" name="consumoMensal" type="number"
                        min="1" step="1" className="solar-input" placeholder="Ex: 1000"
                        value={form.consumoMensal || ''} onChange={handleChange} required
                    />
                </div>
                <div className="sm:col-span-1">
                    <label htmlFor="valorConta" className="solar-label">Valor Conta (R$)</label>
                    <input
                        id="valorConta" name="valorConta" type="number"
                        min="1" step="0.01" className="solar-input" placeholder="Ex: 800"
                        value={form.valorConta || ''} onChange={handleChange} required
                    />
                </div>
                <div className="sm:col-span-1">
                    <label htmlFor="tarifaEnergia" className="solar-label">Tarifa (R$/kWh)</label>
                    <input
                        id="tarifaEnergia" name="tarifaEnergia" type="number"
                        min="0.1" step="0.01" className="solar-input font-mono"
                        value={form.tarifaEnergia || ''} onChange={handleChange} required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="valorPorKwp" className="solar-label">Valor por kWp (R$/kWp)</label>
                    <input
                        id="valorPorKwp" name="valorPorKwp" type="number"
                        min="1" step="0.01" className="solar-input"
                        value={form.valorPorKwp || ''} onChange={handleChange} required
                    />
                </div>
                <div>
                    <label htmlFor="kwpProjeto" className="solar-label">Tamanho do Projeto (kWp)</label>
                    <input
                        id="kwpProjeto" name="kwpProjeto" type="number"
                        min="0.1" step="0.1" className="solar-input" placeholder="Ex: 8.5"
                        value={form.kwpProjeto || ''} onChange={handleChange} required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="potenciaModuloWp" className="solar-label">Potência Módulo (Wp)</label>
                    <input
                        id="potenciaModuloWp" name="potenciaModuloWp" type="number"
                        min="100" step="5" className="solar-input"
                        value={form.potenciaModuloWp || ''} onChange={handleChange} required
                    />
                </div>
                <div>
                    <label htmlFor="orientacao" className="solar-label">Orientação</label>
                    <select
                        id="orientacao" name="orientacao"
                        className="solar-input appearance-none bg-slate-900"
                        value={form.orientacao} onChange={handleChange} required
                    >
                        <option value="Norte">Norte (100%)</option>
                        <option value="Nordeste">Nordeste (97%)</option>
                        <option value="Noroeste">Noroeste (97%)</option>
                        <option value="Leste">Leste (92%)</option>
                        <option value="Oeste">Oeste (92%)</option>
                        <option value="Sul">Sul (80%)</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="taxaDesconto" className="solar-label">Taxa Desconto (% a.a.)</label>
                    <input
                        id="taxaDesconto" name="taxaDesconto" type="number"
                        min="0" step="0.01" className="solar-input"
                        placeholder="Ex: 0.12"
                        value={form.taxaDesconto || ''} onChange={handleChange} required
                    />
                </div>
            </div>

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
                        Processando Engenharia...
                    </span>
                ) : (
                    '☀️ GERAR PROPOSTA PROFISSIONAL'
                )}
            </button>
        </form>
    );
}
