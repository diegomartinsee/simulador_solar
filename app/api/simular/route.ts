import { NextRequest, NextResponse } from 'next/server';
import { executarSimulacao } from '@/lib/calculations';
import { SimulacaoInput, ApiResponse } from '@/types/simulation';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
        const body = await req.json() as SimulacaoInput;

        // Validação dos campos obrigatórios
        const { nomeCliente, consumoMensal, valorConta, valorPorKwp, kwpProjeto, tarifaEnergia, potenciaModuloWp, orientacao } = body;

        if (!nomeCliente || !consumoMensal || !valorConta || !valorPorKwp || !kwpProjeto || !tarifaEnergia || !potenciaModuloWp || !orientacao) {
            return NextResponse.json(
                { success: false, error: 'Preencha todos os campos obrigatórios.' },
                { status: 400 }
            );
        }

        if (consumoMensal <= 0 || valorConta <= 0 || valorPorKwp <= 0 || kwpProjeto <= 0 || tarifaEnergia <= 0 || potenciaModuloWp <= 0) {
            return NextResponse.json(
                { success: false, error: 'Os valores numéricos devem ser maiores que zero.' },
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
