import { SimulacaoInput, SimulacaoResultado } from './simulation';

/** Status da Jornada Comercial (Funil) */
export type LeadStatus =
    | 'curioso'             // Entrou no app, fez form rápido
    | 'precificando'        // Aguardando engenharia/compras
    | 'proposta_emitida'    // PDF/WhatsApp finalizado
    | 'fechado'             // Venda Concluída
    | 'perdido';            // Churn

/** Entidade Cliente (O Lead) */
export interface Lead {
    id: string;
    nome: string;
    telefone?: string;
    email?: string;
    cidade?: string;
    estado?: string;

    status: LeadStatus;

    // Dados base de energia (preenchidos já no contato inicial)
    consumoMensal?: number;
    valorConta?: number;

    createdAt: string; // ISO string
    updatedAt: string; // ISO string

    // Controle de Abas
    modoVendaAtivo?: 'express' | 'investidor' | 'tecnico' | 'financiamento';

    // CRM e Histórico
    observacoes?: string;

    // Relação com as versões de propostas que o lead tem
    propostasIds: string[];
}

/** Entidade Proposta (O Orçamento/Simulação Salvo) */
export interface Proposal {
    id: string;
    leadId: string;
    titulo: string; // ex: "Proposta Base", "Proposta Financiada 72x"

    // O que foi pedido/inputado
    input: Partial<SimulacaoInput>;

    // O motor gerou o resultado
    resultado?: SimulacaoResultado;

    // Dados finais após engenharia preencher as lacunas do "cálculo exato"
    capexFinalReal?: number;       // O valor exato do Kit + Serviço
    condicaoPagamento?: string;    // ex: "Avista 5% Desc", "Bradesco 72x R$900"

    createdAt: string;
    updatedAt: string;
}
