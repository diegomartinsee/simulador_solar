'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CRMStorage } from '@/lib/storage';
import { Lead, LeadStatus } from '@/types/crm';

export default function CRMDashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [modoVenda, setModoVenda] = useState<Lead['modoVendaAtivo']>('express');
  const [editingNotes, setEditingNotes] = useState<string | null>(null); // ID do lead editando nota

  // Load leads from LocalStorage MVP
  useEffect(() => {
    setLeads(CRMStorage.getLeads());
  }, []);

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim()) return;
    const mappedStatus = modoVenda === 'express' ? 'curioso' : 'precificando';

    const lead = CRMStorage.saveLead({
      nome: newLeadName,
      status: mappedStatus,
      modoVendaAtivo: modoVenda,
    });

    setModalOpen(false);
    // Redirects directly to the simulator for this specific lead
    router.push(`/simulador/${lead.id}`);
  };

  const handleUpdateStatus = (leadId: string, novoStatus: LeadStatus) => {
    CRMStorage.updateLeadStatus(leadId, novoStatus);
    setLeads(CRMStorage.getLeads()); // refresh screen state
  };

  const handleUpdateNotes = (leadId: string, notes: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      CRMStorage.saveLead({ ...lead, observacoes: notes });
      setLeads(CRMStorage.getLeads());
    }
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  const columns: { title: string; status: LeadStatus; color: string; glow: string; icon: string }[] = [
    { title: 'Curiosos', status: 'curioso', color: 'border-blue-500/30', glow: 'border-glow-blue', icon: '🥶' },
    { title: 'Precificando', status: 'precificando', color: 'border-amber-500/30', glow: 'border-glow-amber', icon: '🔥' },
    { title: 'Proposta Enviada', status: 'proposta_emitida', color: 'border-purple-500/30', glow: 'border-glow-purple', icon: '📝' },
    { title: 'Fechados', status: 'fechado', color: 'border-emerald-500/30', glow: 'border-glow-emerald', icon: '💰' },
    { title: 'Perdidos', status: 'perdido', color: 'border-red-500/30', glow: 'border-glow-red', icon: '🚫' },
  ];

  const totalLeads = leads.length;
  const fechados = leads.filter(l => l.status === 'fechado').length;
  const perdidos = leads.filter(l => l.status === 'perdido').length;
  const taxaConversao = totalLeads > 0 ? Math.round((fechados / totalLeads) * 100) : 0;

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header + Scoreboard */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Funil de Vendas Solar</h1>
          <p className="text-slate-400">Visibilidade total do seu pipeline comercial.</p>
        </div>
        <div className="flex items-center gap-6">
          {/* Scoreboard */}
          <div className="hidden sm:flex gap-6 text-center">
            <div>
              <div className="text-2xl font-black text-white">{totalLeads}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Total</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">{fechados}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Fechados</div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-400">{taxaConversao}%</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Conversão</div>
            </div>
            <div>
              <div className="text-2xl font-black text-red-400">{perdidos}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Perdidos</div>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-solar px-6 py-2 rounded-lg font-bold shadow-lg"
          >
            ➕ Novo Lead
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {columns.map(col => {
          const columnLeads = leads.filter(l => l.status === col.status).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

          return (
            <div key={col.status} className={`min-w-[280px] flex-1 bg-slate-900/50 rounded-xl p-4 border ${col.color} snap-start`}>
              <h2 className="text-slate-300 font-bold mb-4 flex items-center justify-between">
                <span>{col.icon} {col.title}</span>
                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full">{columnLeads.length}</span>
              </h2>

              <div className="space-y-3">
                {columnLeads.map(lead => (
                  <div
                    key={lead.id}
                    className={`glass-premium p-4 ${col.glow} transition-all flex flex-col gap-3 group relative`}
                  >
                    <div
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => router.push(`/simulador/${lead.id}`)}
                    >
                      <h3 className="font-bold text-white text-base hover:text-amber-400 group-hover:translate-x-1 transition-all leading-tight">
                        {lead.nome}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingNotes(editingNotes === lead.id ? null : lead.id);
                        }}
                        className={`text-sm p-1 rounded-md transition-colors ${lead.observacoes ? 'text-amber-400 bg-amber-400/10' : 'text-slate-600 hover:text-slate-400'}`}
                        title="Anotações do Lead"
                      >
                        📝
                      </button>
                    </div>

                    {lead.propostasIds.length > 0 && (
                      <div className="flex items-center gap-2 -mt-2">
                        <span className="text-emerald-400 font-bold text-lg">
                          {(() => {
                            const props = CRMStorage.getProposalsByLead(lead.id);
                            return props.length > 0 ? fmt(props[0].resultado?.investimentoTotal || 0) : 'R$ ---';
                          })()}
                        </span>
                      </div>
                    )}

                    {/* Área de Notas (Condicional) */}
                    {editingNotes === lead.id && (
                      <textarea
                        autoFocus
                        className="text-xs bg-slate-800 text-slate-300 border border-amber-500/30 rounded-md p-2 h-20 outline-none focus:border-amber-400 transition-all resize-none shadow-inner"
                        placeholder="Adicione notas sobre o cliente..."
                        value={lead.observacoes || ''}
                        onChange={(e) => handleUpdateNotes(lead.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}

                    {/* Dropdown de Status */}
                    <select
                      className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 rounded-md p-1 outline-none w-full"
                      value={lead.status}
                      onChange={(e) => handleUpdateStatus(lead.id, e.target.value as LeadStatus)}
                    >
                      {columns.map(c => <option key={c.status} value={c.status}>{c.icon} {c.title}</option>)}
                    </select>

                    {/* Ações Rápidas */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/simulador/${lead.id}`)}
                        className="bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-slate-900 border border-amber-500/20 text-[10px] font-bold px-2 py-1 rounded-md transition-colors flex-1"
                      >
                        ✏️ Editar / Simular
                      </button>

                      {/* Botão de reativação (se fechado ou perdido) */}
                      {(lead.status === 'fechado' || lead.status === 'perdido') && (
                        <button
                          onClick={() => handleUpdateStatus(lead.id, 'precificando')}
                          className="bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/20 text-[10px] font-bold px-2 py-1 rounded-md transition-colors"
                          title="Voltar para Precificando"
                        >
                          🔄 Reativar
                        </button>
                      )}

                      {/* Botão de fechamento rápido */}
                      {lead.status !== 'fechado' && lead.status !== 'perdido' && (
                        <button
                          onClick={() => handleUpdateStatus(lead.id, 'fechado')}
                          className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-[10px] font-bold px-2 py-1 rounded-md transition-colors"
                          title="Marcar como Fechado"
                        >
                          ✔️ Fechar
                        </button>
                      )}
                      {/* Botão de perda rápida */}
                      {lead.status !== 'fechado' && lead.status !== 'perdido' && (
                        <button
                          onClick={() => handleUpdateStatus(lead.id, 'perdido')}
                          className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 text-[10px] font-bold px-2 py-1 rounded-md transition-colors"
                          title="Marcar como Perdido"
                        >
                          ❌ Perder
                        </button>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-800/50 pt-2">
                      <span>{new Date(lead.updatedAt).toLocaleDateString('pt-BR')}</span>
                      {lead.propostasIds.length > 0 ? (
                        <span className="text-emerald-400/80 bg-emerald-400/10 px-2 py-0.5 rounded">
                          📄 {lead.propostasIds.length} proposta(s)
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[9px] uppercase tracking-wider">{lead.modoVendaAtivo || 'express'}</span>
                      )}
                    </div>
                  </div>
                ))}

                {columnLeads.length === 0 && (
                  <div className="text-center p-6 border border-dashed border-slate-700/50 rounded-lg text-slate-500 text-sm">
                    Vazio
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Novo Lead */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-in">
            <h2 className="text-2xl font-black text-white mb-4">Novo Lead Comercial</h2>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="solar-label">Nome do Potencial Cliente</label>
                <input
                  autoFocus
                  type="text"
                  className="solar-input"
                  placeholder="Ex: João da Silva"
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="solar-label">Modo de Venda Inicial</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModoVenda('express')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${modoVenda === 'express' ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                  >
                    ⚡ EXPRESS (Rápido)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoVenda('tecnico')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${modoVenda === 'tecnico' ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                  >
                    🛠️ TÉCNICO (Completo)
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-solar"
                >
                  Criar e Iniciar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
