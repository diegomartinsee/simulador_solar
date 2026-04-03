'use client';

/**
 * 📦 LocalStorage CRM Service (MVP)
 * Serviço que emula um banco de dados para gestão de Leads e Propostas no dispositivo.
 * Facilmente substituível por Supabase/Prisma no futuro.
 */

import { Lead, Proposal } from '@/types/crm';

const KEYS = {
    LEADS: '@solar:leads',
    PROPOSALS: '@solar:proposals',
};

// Utils para gerar ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Wrapper seguro para LocalStorage (Prevenindo QuotaExceeded e Null Safari Privado)
const safeSetItem = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.warn('SaaS Engine: LocalStorage impedido de gravar dados.', e);
    }
};

export const CRMStorage = {
    // ============================================
    // LEADS
    // ============================================
    getLeads: (): Lead[] => {
        if (typeof window === 'undefined') return [];
        try {
            const data = localStorage.getItem(KEYS.LEADS);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    getLeadById: (id: string): Lead | undefined => {
        return CRMStorage.getLeads().find(l => l.id === id);
    },

    saveLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'propostasIds'> & Partial<Lead>): Lead => {
        const leads = CRMStorage.getLeads();
        const now = new Date().toISOString();

        if (lead.id) {
            // Atualizar existente
            const index = leads.findIndex(l => l.id === lead.id);
            if (index >= 0) {
                leads[index] = { ...leads[index], ...lead, updatedAt: now };
                safeSetItem(KEYS.LEADS, JSON.stringify(leads));
                return leads[index];
            }
        }

        // Criar novo
        const newLead: Lead = {
            ...lead,
            id: lead.id || generateId(),
            propostasIds: lead.propostasIds || [],
            createdAt: now,
            updatedAt: now,
        } as Lead;

        leads.push(newLead);
        safeSetItem(KEYS.LEADS, JSON.stringify(leads));
        return newLead;
    },

    updateLeadStatus: (leadId: string, status: Lead['status']): Lead | null => {
        const lead = CRMStorage.getLeadById(leadId);
        if (!lead) return null;
        return CRMStorage.saveLead({ ...lead, status });
    },

    deleteLead: (id: string): void => {
        const leads = CRMStorage.getLeads().filter(l => l.id !== id);
        safeSetItem(KEYS.LEADS, JSON.stringify(leads));

        // Cascata de exclusão das propostas atreladas a este lead
        const proposals = CRMStorage.getProposals().filter(p => p.leadId !== id);
        safeSetItem(KEYS.PROPOSALS, JSON.stringify(proposals));
    },

    // ============================================
    // PROPOSALS (SIMULAÇÕES)
    // ============================================
    getProposals: (): Proposal[] => {
        if (typeof window === 'undefined') return [];
        try {
            const data = localStorage.getItem(KEYS.PROPOSALS);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    getProposalsByLead: (leadId: string): Proposal[] => {
        return CRMStorage.getProposals().filter(p => p.leadId === leadId).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },

    getProposalById: (id: string): Proposal | undefined => {
        return CRMStorage.getProposals().find(p => p.id === id);
    },

    saveProposal: (proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'> & Partial<Proposal>): Proposal => {
        const proposals = CRMStorage.getProposals();
        const now = new Date().toISOString();

        let savedProposal: Proposal;

        if (proposal.id) {
            // Atualizar existente
            const index = proposals.findIndex(p => p.id === proposal.id);
            if (index >= 0) {
                savedProposal = { ...proposals[index], ...proposal, updatedAt: now };
                proposals[index] = savedProposal;
            } else {
                // ID fornecido não encontrado, cria com ele
                savedProposal = { ...proposal, createdAt: now, updatedAt: now } as Proposal;
                proposals.push(savedProposal);
            }
        } else {
            // Criar novo
            savedProposal = {
                ...proposal,
                id: generateId(),
                createdAt: now,
                updatedAt: now,
            } as Proposal;
            proposals.push(savedProposal);
        }

        safeSetItem(KEYS.PROPOSALS, JSON.stringify(proposals));

        // Atualizar o array de IDs no Lead
        const lead = CRMStorage.getLeadById(savedProposal.leadId);
        if (lead && !lead.propostasIds.includes(savedProposal.id)) {
            CRMStorage.saveLead({
                ...lead,
                propostasIds: [...lead.propostasIds, savedProposal.id]
            });
        }

        return savedProposal;
    },

    deleteProposal: (id: string): void => {
        const prop = CRMStorage.getProposalById(id);
        if (!prop) return;

        // Remover da lista de proposals
        const proposals = CRMStorage.getProposals().filter(p => p.id !== id);
        safeSetItem(KEYS.PROPOSALS, JSON.stringify(proposals));

        // Remover da relacao do lead
        const lead = CRMStorage.getLeadById(prop.leadId);
        if (lead) {
            CRMStorage.saveLead({
                ...lead,
                propostasIds: lead.propostasIds.filter(pid => pid !== id)
            });
        }
    }
};
