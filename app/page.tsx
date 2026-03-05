import SimulatorForm from '@/components/SimulatorForm';

const stats = [
  { icon: '📈', value: '+65%', label: 'Alta na energia nos últimos 5 anos' },
  { icon: '🏆', value: '18–30%', label: 'TIR média em projetos solares' },
  { icon: '☀️', value: '6º lugar', label: 'Brasil no ranking mundial solar' },
];

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px]"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.03) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 text-amber-400 text-sm font-medium mb-5">
            ⚡ Ferramenta Interna de Vendas
          </div>
          <div className="text-6xl mb-3">☀️</div>
          <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent leading-tight">
            Simulador Solar
          </h1>
          <p className="text-slate-400 text-lg">
            Mostre ao seu cliente o melhor investimento disponível
          </p>
        </div>

        {/* ===== MICRO-CARDS DE CONTEXTO DE MERCADO ===== */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass-card p-3 text-center"
            >
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-amber-400 font-black text-lg leading-tight">{s.value}</div>
              <div className="text-slate-500 text-xs mt-0.5 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ===== ALERTA DE URGÊNCIA ===== */}
        <div className="mb-6 bg-red-950/40 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <p className="text-red-300 text-sm">
            <span className="font-bold">Cada mês sem solar = dinheiro perdido para sempre.</span>{' '}
            A energia sobe em média 5% ao ano. Calcule agora o custo da inércia.
          </p>
        </div>

        {/* Form card */}
        <div className="glass-card p-8">
          <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-400/15 flex items-center justify-center text-amber-400 text-sm font-black">1</span>
            Dados do Projeto
          </h2>
          <SimulatorForm />
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Simulação com base em médias brasileiras de irradiação solar e eficiência do sistema.
        </p>
      </div>
    </main>
  );
}
