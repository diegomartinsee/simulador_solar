import { NextRequest, NextResponse } from 'next/server';
import { executarSimulacao } from '@/lib/calculations';
import { SimulacaoInput, ApiResponse } from '@/types/simulation';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
        const body = await req.json() as SimulacaoInput;

        const { nomeCliente, consumoMensal, valorConta, valorPorKwp, kwpProjeto, tarifaEnergia, potenciaModuloWp, orientacao } = body;

        // Campos absolutamente obrigatórios para qualquer modo
        if (!nomeCliente || !consumoMensal || !valorConta || !tarifaEnergia || !potenciaModuloWp || !orientacao) {
            return NextResponse.json(
                { success: false, error: 'Preencha todos os campos obrigatórios.' },
                { status: 400 }
            );
        }

        // valorPorKwp é necessário somente quando kwpProjeto está ausente (Express calcula no front)
        if (!kwpProjeto && !valorPorKwp) {
            return NextResponse.json(
                { success: false, error: 'Informe o kWp do projeto ou o custo por kWp para calcular.' },
                { status: 400 }
            );
        }

        if (consumoMensal <= 0 || valorConta <= 0 || tarifaEnergia <= 0 || potenciaModuloWp <= 0) {
            return NextResponse.json(
                { success: false, error: 'Os valores numéricos devem ser maiores que zero.' },
                { status: 400 }
            );
        }

        const taxaMinimaKwh =
            body.tipoConexao === 'Trifásico' ? 100 :
                body.tipoConexao === 'Bifásico' ? 50 : 30;

        // Custo fixo basico: (Taxa mín * tarifa) + Iluminação (Aprox R$15)
        const custoFixoMinimo = (taxaMinimaKwh * tarifaEnergia) + 15;

        // Se a pessoa paga MENOS que o custo fixo da concessionaria, a conta não fecha matematicamente
        if (valorConta <= custoFixoMinimo) {
            return NextResponse.json(
                { success: false, error: `Conta Inválida: Uma fatura ${body.tipoConexao} não pode custar menos que R$ ${custoFixoMinimo.toFixed(2)} devido ao Fio B e Ilum. Pública.` },
                { status: 400 }
            );
        }

        const resultado = executarSimulacao(body);

        return NextResponse.json({ success: true, data: resultado });
    } catch (err) {
        console.error('Erro na simulação:', err);
        return NextResponse.json(
            { success: false, error: 'Erro interno ao processar a simulação.' },
            { status: 500 }
        );
    }
}
