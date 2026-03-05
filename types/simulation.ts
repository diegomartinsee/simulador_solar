/**
 * 📐 Tipos TypeScript do Simulador Solar
 */

/** Dados de entrada do formulário de simulação */
export interface SimulacaoInput {
    nomeCliente: string;
    consumoMensal: number;              // kWh/mês (média se detalhado não fornecido)
    consumosMensais?: number[];         // [jan, fev, ... dez]
    valorConta: number;                 // R$/mês
    tarifaEnergia: number;              // R$/kWh
    cidade?: string;                    // opcional
    valorPorKwp: number;                // R$/kWp
    kwpProjeto: number;                 // kWp do kit
    potenciaModuloWp: number;           // Ex: 550
    orientacao: 'Norte' | 'Nordeste' | 'Noroeste' | 'Leste' | 'Oeste' | 'Sul';
    taxaDesconto: number;               // % (Selic ou custo de oportunidade)
}

/** Score de viabilidade do projeto */
export type ScoreViabilidade = 'Excelente' | 'Ótimo' | 'Bom' | 'Regular';

/** Resultado completo da simulação */
export interface SimulacaoResultado {
    // Dados do cliente
    nomeCliente: string;

    // Engenharia
    potenciaInstaladaKwp: number;
    numeroModulos: number;
    potenciaModuloWp: number;
    pr: number;                   // Performance Ratio (e.g., 0.80)
    geracaoMensal: number[];      // [jan, fev, ... dez] em kWh
    geracaoAnualTotal: number;    // kWh/ano 1

    // Financeiro principal
    investimentoTotal: number;    // R$
    economiaMensalMedia: number;  // R$/mês
    economiaDiariaMedia: number;  // R$/dia
    paybackSimplesAnos: number;
    paybackDescontadoAnos: number;
    dataPaybackSimples: string;

    // Score e viabilidade
    scoreViabilidade: ScoreViabilidade;
    scoreDescricao: string;

    // Metricas financeiras avançadas
    vpl: number;                       // Valor Presente Líquido
    tir: number;                       // Taxa Interna de Retorno (anual)
    tirMultiploCDI: number;            // ex: 2.8 (solar é 2.8x o CDI)

    // Projeções de longo prazo (25 anos)
    totalPagoSemSolar25Anos: number;
    totalPagoSemSolar10Anos: number;
    economiaAcumulada25Anos: number;   // Economia Líquida (já subtraído investimento)

    // Storytelling
    equivalenciaEconomia: string;
    contaAno5: number;
    contaAno10: number;
    contaAno25: number;

    // Dados para gráficos
    projecaoEnergiaSemSolar: number[];
    comparativoInvestimentos: {
        anos: number[];
        solar: number[];
        cdi: number[];
        fii: number[];
        imovel: number[];
    };
}

/** Resposta da API de simulação */
export interface ApiResponse {
    success: boolean;
    data?: SimulacaoResultado;
    error?: string;
}
