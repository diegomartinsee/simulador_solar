/**
 * 🧮 Lógica Financeira do Simulador Solar
 * Todas as funções são puras e testáveis de forma isolada.
 */

import { CONFIG } from './config';
import { SimulacaoInput, SimulacaoResultado, ScoreViabilidade } from '@/types/simulation';

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Calcula o Performance Ratio (PR) do sistema.
 */
export function calcularPR(): number {
    const perdas = Object.values(CONFIG.PERDAS).reduce((acc, curr) => acc + curr, 0);
    return 1 - perdas;
}

/**
 * Retorna a irradiação mensal corrigida pelo fator de orientação.
 */
export function obterIrradiacaoMensalCorrigida(orientacao: keyof typeof CONFIG.FATOR_ORIENTACAO): number[] {
    const fator = CONFIG.FATOR_ORIENTACAO[orientacao];
    return [
        CONFIG.IRRADIACAO_MENSAL.jan * fator,
        CONFIG.IRRADIACAO_MENSAL.fev * fator,
        CONFIG.IRRADIACAO_MENSAL.mar * fator,
        CONFIG.IRRADIACAO_MENSAL.abr * fator,
        CONFIG.IRRADIACAO_MENSAL.mai * fator,
        CONFIG.IRRADIACAO_MENSAL.jun * fator,
        CONFIG.IRRADIACAO_MENSAL.jul * fator,
        CONFIG.IRRADIACAO_MENSAL.ago * fator,
        CONFIG.IRRADIACAO_MENSAL.set * fator,
        CONFIG.IRRADIACAO_MENSAL.out * fator,
        CONFIG.IRRADIACAO_MENSAL.nov * fator,
        CONFIG.IRRADIACAO_MENSAL.dez * fator,
    ];
}

/**
 * Calcula a geração mensal (kWh) para o primeiro ano.
 */
export function calcularGeracaoMensalPrimeiroAno(
    kwp: number,
    irradiacaoCorrigida: number[],
    pr: number
): number[] {
    const diasMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return irradiacaoCorrigida.map((irrad, i) => kwp * irrad * diasMes[i] * pr);
}

/**
 * Calcula o investimento total do projeto.
 */
export function calcularInvestimento(kwp: number, valorPorKwp: number): number {
    return kwp * valorPorKwp;
}

/**
 * Calcula a economia mensal com base no valor da conta.
 */
export function calcularEconomiaMensal(valorConta: number): number {
    return valorConta * CONFIG.COMPENSACAO_ENERGIA;
}

/**
 * Calcula o payback (simples e descontado).
 */
export function calcularPaybacks(
    investimento: number,
    fluxoCaixaAnual: number[],
    taxaDesconto: number
): { simples: number; descontado: number; dataPaybackSimples: string } {
    let acumuladoSimples = -investimento;
    let acumuladoDescontado = -investimento;
    let paybackSimples = 25;
    let paybackDescontado = 25;
    let encontradoSimples = false;
    let encontradoDescontado = false;

    for (let i = 1; i < fluxoCaixaAnual.length; i++) {
        const ganhoAnual = fluxoCaixaAnual[i];
        const ganhoDescontado = ganhoAnual / Math.pow(1 + taxaDesconto, i);

        if (!encontradoSimples) {
            if (acumuladoSimples + ganhoAnual >= 0) {
                paybackSimples = i - 1 + (Math.abs(acumuladoSimples) / ganhoAnual);
                encontradoSimples = true;
            } else {
                acumuladoSimples += ganhoAnual;
            }
        }

        if (!encontradoDescontado) {
            if (acumuladoDescontado + ganhoDescontado >= 0) {
                paybackDescontado = i - 1 + (Math.abs(acumuladoDescontado) / ganhoDescontado);
                encontradoDescontado = true;
            } else {
                acumuladoDescontado += ganhoDescontado;
            }
        }
    }

    // Data formatada para o simples
    const agora = new Date();
    const dataPaybackDate = new Date(agora);
    dataPaybackDate.setMonth(dataPaybackDate.getMonth() + Math.round(paybackSimples * 12));
    const dataFormatted = dataPaybackDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const dataPaybackSimples = dataFormatted.charAt(0).toUpperCase() + dataFormatted.slice(1);

    return {
        simples: Math.round(paybackSimples * 10) / 10,
        descontado: Math.round(paybackDescontado * 10) / 10,
        dataPaybackSimples
    };
}

/**
 * Gera o fluxo de caixa anual considerando degradação e inflação energética.
 */
export function calcularFluxoCaixaAvancado(
    investimento: number,
    geracaoAnualAno1: number,
    tarifaInicial: number,
    taxaInflacaoEnergia: number = CONFIG.INFLACAO_ENERGETICA_ANUAL
): number[] {
    const fluxo: number[] = [-investimento];
    const manutencaoAnual = investimento * CONFIG.CUSTO_MANUTENCAO_ANUAL_PERCENTUAL;

    for (let ano = 1; ano <= CONFIG.VIDA_UTIL_ANOS; ano++) {
        // Degradação: 2% no ano 1, 0.55% nos demais
        const fatorDegradacao = ano === 1
            ? (1 - CONFIG.DEGRADACAO.ano1)
            : (1 - CONFIG.DEGRADACAO.ano1) * Math.pow(1 - CONFIG.DEGRADACAO.anual, ano - 1);

        const geracaoNoAno = geracaoAnualAno1 * fatorDegradacao;
        const tarifaNoAno = tarifaInicial * Math.pow(1 + taxaInflacaoEnergia, ano - 1);

        const economiaAnual = geracaoNoAno * tarifaNoAno * CONFIG.COMPENSACAO_ENERGIA;
        fluxo.push(economiaAnual - manutencaoAnual);
    }

    return fluxo;
}

/**
 * Calcula a TIR usando método iterativo de Newton-Raphson.
 */
export function calcularTIR(fluxoCaixa: number[], precisao = 0.00001): number {
    let taxa = 0.1;

    for (let iteracao = 0; iteracao < 1000; iteracao++) {
        let vpl = 0;
        let derivada = 0;

        for (let t = 0; t < fluxoCaixa.length; t++) {
            const fator = Math.pow(1 + taxa, t);
            vpl += fluxoCaixa[t] / fator;
            derivada -= (t * fluxoCaixa[t]) / Math.pow(1 + taxa, t + 1);
        }

        const novaTaxa = taxa - vpl / derivada;

        if (Math.abs(novaTaxa - taxa) < precisao) {
            return novaTaxa;
        }

        taxa = novaTaxa;
    }

    return taxa;
}

/**
 * Calcula quanto o cliente pagaria por ano sem solar (com inflação).
 */
export function calcularProjecaoEnergia(
    valorConta: number,
    anos: number = 10,
    inflacao: number = CONFIG.INFLACAO_ENERGETICA_ANUAL
): number[] {
    const projecao: number[] = [];
    for (let ano = 1; ano <= anos; ano++) {
        const valorAnual = valorConta * 12 * Math.pow(1 + inflacao, ano - 1);
        projecao.push(Math.round(valorAnual));
    }
    return projecao;
}

/**
 * VPL (NPV)
 */
export function calcularVPL(fluxoCaixa: number[], taxaDesconto: number): number {
    return fluxoCaixa.reduce((acc, val, i) => acc + val / Math.pow(1 + taxaDesconto, i), 0);
}

/**
 * Comparativo Refatorado
 */
export function calcularComparativo(
    investimento: number,
    fluxoCaixaSolar: number[],
    taxaDesconto: number
): SimulacaoResultado['comparativoInvestimentos'] {
    const anos = CONFIG.ANOS_GRAFICO_COMPARATIVO;
    const anosArr = Array.from({ length: anos }, (_, i) => i + 1);
    const solar: number[] = [];
    const cdi: number[] = [];
    const fii: number[] = [];
    const imovel: number[] = [];

    let acumuladoSolar = 0;

    for (let ano = 1; ano <= anos; ano++) {
        // Solar: acumulado líquido
        acumuladoSolar += fluxoCaixaSolar[ano];
        solar.push(Math.round(acumuladoSolar));

        // Comparativos: crescimento de capital
        cdi.push(Math.round(investimento * Math.pow(1 + CONFIG.TAXAS_COMPARATIVAS.CDI, ano) - investimento));
        fii.push(Math.round(investimento * Math.pow(1 + CONFIG.TAXAS_COMPARATIVAS.FII, ano) - investimento));
        imovel.push(Math.round(investimento * Math.pow(1 + CONFIG.TAXAS_COMPARATIVAS.IMOVEL, ano) - investimento));
    }

    return { anos: anosArr, solar, cdi, fii, imovel };
}

/**
 * Calcula o score de viabilidade com base no payback e TIR.
 */
function calcularScore(
    paybackDescontado: number,
    tir: number
): { score: ScoreViabilidade; descricao: string } {
    if (paybackDescontado <= 6 && tir >= 0.25) {
        return { score: 'Excelente', descricao: 'Investimento extremamente robusto com retorno rápido mesmo considerando o valor do dinheiro no tempo.' };
    } else if (paybackDescontado <= 8 && tir >= 0.18) {
        return { score: 'Ótimo', descricao: 'Projeto sólido com rentabilidade muito acima dos fundos de renda fixa tradicionais.' };
    } else if (paybackDescontado <= 11 && tir >= 0.12) {
        return { score: 'Bom', descricao: 'Viabilidade garantida com proteção contra inflação energética.' };
    } else {
        return { score: 'Regular', descricao: 'Viável, porém o tempo de retorno é mais longo. Recomenda-se avaliar custos de instalação.' };
    }
}

/**
 * Gera equivalência criativa para o valor de economia acumulada.
 */
function gerarEquivalencia(valorEconomia: number): string {
    const carroPopular = 70000;
    const faculdade = 60000;
    const salarioMinimo = 1518;

    if (valorEconomia >= carroPopular * 5) {
        const qtd = Math.round(valorEconomia / carroPopular);
        return `${qtd} carros populares`;
    } else if (valorEconomia >= faculdade * 2) {
        const qtd = Math.round(valorEconomia / faculdade);
        return `a faculdade de ${qtd} filhos`;
    } else {
        const meses = Math.round(valorEconomia / salarioMinimo);
        return `${meses} salários mínimos`;
    }
}

// =============================================================================
// FUNÇÃO PRINCIPAL
// =============================================================================

/**
 * Executa a simulação completa com base nos dados de entrada.
 */
export function executarSimulacao(input: SimulacaoInput): SimulacaoResultado {
    const { nomeCliente, kwpProjeto, valorPorKwp, tarifaEnergia, orientacao, taxaDesconto } = input;

    // 1. Engenharia do Sistema
    const pr = calcularPR();
    const irradiacaoCorrigida = obterIrradiacaoMensalCorrigida(orientacao);
    const geracaoMensal = calcularGeracaoMensalPrimeiroAno(kwpProjeto, irradiacaoCorrigida, pr);
    const geracaoAnualAno1 = geracaoMensal.reduce((a, b) => a + b, 0);
    const numeroModulos = Math.round((kwpProjeto * 1000) / input.potenciaModuloWp);

    // 2. Fluxo de Caixa e Indicadores
    const investimentoTotal = kwpProjeto * valorPorKwp;
    const fluxoCaixa = calcularFluxoCaixaAvancado(investimentoTotal, geracaoAnualAno1, tarifaEnergia);
    const tir = calcularTIR(fluxoCaixa);
    const vpl = calcularVPL(fluxoCaixa, taxaDesconto);
    const { simples, descontado, dataPaybackSimples } = calcularPaybacks(investimentoTotal, fluxoCaixa, taxaDesconto);

    // 3. Auxiliares para UI
    const economiaMensalMedia = (geracaoAnualAno1 * tarifaEnergia * CONFIG.COMPENSACAO_ENERGIA) / 12;
    const economiaDiariaMedia = economiaMensalMedia / 30;
    const { score: scoreViabilidade, descricao: scoreDescricao } = calcularScore(descontado, tir);
    const tirMultiploCDI = Math.round((tir / CONFIG.TAXAS_COMPARATIVAS.CDI) * 10) / 10;

    // 4. Projeções Sociais/Storytelling
    const economiaLíquida25Anos = fluxoCaixa.slice(1).reduce((a, b) => a + b, 0);
    const equivalenciaEconomia = gerarEquivalencia(economiaLíquida25Anos);

    // Conta projetada sem solar (Storytelling)
    const valorContaAtual = input.valorConta;
    const contaAno5 = Math.round(valorContaAtual * Math.pow(1 + CONFIG.INFLACAO_ENERGETICA_ANUAL, 4));
    const contaAno10 = Math.round(valorContaAtual * Math.pow(1 + CONFIG.INFLACAO_ENERGETICA_ANUAL, 9));
    const contaAno25 = Math.round(valorContaAtual * Math.pow(1 + CONFIG.INFLACAO_ENERGETICA_ANUAL, 24));

    // Projeção 10 anos para gráfico
    const projecaoEnergiaSemSolar = calcularProjecaoEnergia(valorContaAtual, 10);
    const totalPagoSemSolar10Anos = projecaoEnergiaSemSolar.reduce((a, b) => a + b, 0);
    const totalPagoSemSolar25Anos = calcularProjecaoEnergia(valorContaAtual, 25).reduce((a, b) => a + b, 0);

    return {
        nomeCliente,
        potenciaInstaladaKwp: kwpProjeto,
        numeroModulos,
        potenciaModuloWp: input.potenciaModuloWp,
        pr,
        geracaoMensal: geracaoMensal.map(g => Math.round(g)),
        geracaoAnualTotal: Math.round(geracaoAnualAno1),
        investimentoTotal,
        economiaMensalMedia: Math.round(economiaMensalMedia),
        economiaDiariaMedia: Math.round(economiaDiariaMedia * 100) / 100,
        paybackSimplesAnos: simples,
        paybackDescontadoAnos: descontado,
        dataPaybackSimples,
        scoreViabilidade,
        scoreDescricao,
        vpl: Math.round(vpl),
        tir,
        tirMultiploCDI,
        totalPagoSemSolar25Anos: Math.round(totalPagoSemSolar25Anos),
        totalPagoSemSolar10Anos: Math.round(totalPagoSemSolar10Anos),
        economiaAcumulada25Anos: Math.round(economiaLíquida25Anos),
        equivalenciaEconomia,
        contaAno5,
        contaAno10,
        contaAno25,
        projecaoEnergiaSemSolar,
        comparativoInvestimentos: calcularComparativo(investimentoTotal, fluxoCaixa, taxaDesconto),
    };
}
