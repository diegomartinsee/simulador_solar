/**
 * ⚙️ Configurações Internas do Simulador Solar
 * Edite estes valores para ajustar o comportamento dos cálculos.
 */

export const CONFIG = {
    /** Irradiação solar média mensal (kWh/m²/dia) - Base NASA/INPE (Média Brasil) */
    IRRADIACAO_MENSAL: {
        jan: 5.4, fev: 5.5, mar: 5.2, abr: 4.8, mai: 4.2, jun: 3.8,
        jul: 4.0, ago: 4.7, set: 5.1, out: 5.2, nov: 5.3, dez: 5.4,
        anual: 4.88
    },

    /** Valores padrão para novos formulários */
    TARIFA_PADRAO: 0.95,
    INVESTIMENTO_PADRAO_KWP: 3200, // Preço médio atualizado 2024/2025

    /** Fatores de correção por orientação do telhado */
    FATOR_ORIENTACAO: {
        Norte: 1.00,
        Nordeste: 0.97,
        Noroeste: 0.97,
        Leste: 0.92,
        Oeste: 0.92,
        Sul: 0.80,
    },

    /** Detalhamento de perdas do Performance Ratio (PR) */
    PERDAS: {
        temperatura: 0.08,
        mismatch: 0.015,
        sujeira: 0.02,
        cabos_cc: 0.01,
        cabos_ca: 0.01,
        inversor: 0.025,
        conversao_ac: 0.01,
        sombreamento_leve: 0.01,
    },

    /** Degradação dos módulos fotovoltaicos */
    DEGRADACAO: {
        ano1: 0.02,      // 2% no primeiro ano
        anual: 0.0055    // 0.55% nos anos seguintes
    },

    /** Taxa de compensação (Lei 14.300 / Fio B). Rateio desconta mais pq não há simultaneidade. */
    COMPENSACAO_JUNTO_CARGA: 0.85,
    COMPENSACAO_RATEIO: 0.70,

    /** Custo de Disponibilidade (kWh que a concessionária sempre cobra) */
    TARIFA_MINIMA: {
        'Monofásico': 30,
        'Bifásico': 50,
        'Trifásico': 100,
    },
    ILUMINACAO_PUBLICA_MEDIA: 15,

    /** Taxa anual de inflação da energia elétrica (default 5% conforme pedido) */
    INFLACAO_ENERGETICA_ANUAL: 0.05,

    /** Vida útil do sistema solar em anos */
    VIDA_UTIL_ANOS: 25,

    /** Taxas de retorno de investimentos comparativos (ao ano) */
    TAXAS_COMPARATIVAS: {
        CDI: 0.10,        // 10% a.a.
        FII: 0.08,        // 8% a.a.
        IMOVEL: 0.06,     // 6% a.a.
    },

    /** Taxa mínima anual de manutenção do sistema solar */
    CUSTO_MANUTENCAO_ANUAL_PERCENTUAL: 0.005, // 0.5% do investimento

    /** Anos a projetar nos gráficos comparativos */
    ANOS_GRAFICO_COMPARATIVO: 10,

    /** Configurações da Empresa para Propostas */
    EMPRESA: {
        NOME: 'Solar Premium Engenharia',
        SLOGAN: 'Soluções inteligentes para um futuro sustentável.',
        CREA: 'CREA-SP 123456789',
        RESPONSAVEL: 'Eng. Diego Martins',
        EXPERIENCIA: 'Mais de 5 anos de atuação no mercado fotovoltaico, com +500 sistemas instalados.',
        CONTATO: '(11) 98765-4321',
        EMAIL: 'contato@solarpremium.com.br',
        LOGO: '☀️',
    },

    /** Prazos e Garantias Padrão */
    GARANTIAS: {
        MODULOS: '12 anos contra defeitos de fabricação',
        PERFORMANCE: '25 anos (mínimo 80% da potência nominal)',
        INVERSOR: '10 anos (padrão de fábrica)',
        ESTRUTURA: '10 anos contra corrosão',
        INSTALACAO: '1 ano de garantia técnica',
    },

    /** Escopo e Prazos */
    PRAZOS: {
        INSTALACAO: '15 a 30 dias após aprovação',
        HOMOLOGACAO: 'Até 45 dias conforme rito da concessionária',
    }
} as const;
