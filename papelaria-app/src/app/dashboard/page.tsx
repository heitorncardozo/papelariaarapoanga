'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/sidebar'
import Header from '@/components/header'
import StatsCard from '@/components/stats-card'
import EstoqueAlerta from '@/components/estoque-alerta'
import PedidoStatusBadge from '@/components/pedido-status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createSupabaseClient } from '@/lib/supabase-client'
import { formatBRL, formatDate } from '@/lib/utils'
import { ShoppingCart, DollarSign, Clock, Package, ArrowRight, Inbox } from 'lucide-react'

interface Stats {
  pedidosHoje: number
  faturamentoHoje: number
  pedidosPendentes: number
  produtosAtivos: number
}

interface Pedido {
  id: string
  cliente_nome: string | null
  cliente_telefone: string
  valor_total: number
  status: string
  criado_em: string
}

interface ProdutoEstoqueBaixo {
  id: string
  nome: string
  categoria: string
  estoque: number
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    pedidosHoje: 0,
    faturamentoHoje: 0,
    pedidosPendentes: 0,
    produtosAtivos: 0,
  })
  const [ultimosPedidos, setUltimosPedidos] = useState<Pedido[]>([])
  const [estoqueBaixo, setEstoqueBaixo] = useState<ProdutoEstoqueBaixo[]>([])
  const router = useRouter()

  const fetchData = useCallback(async () => {
    const supabase = createSupabaseClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    try {
      // Pedidos hoje
      const { count: pedidosHoje } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .gte('criado_em', todayISO)

      // Faturamento hoje (pedidos pagos de hoje)
      const { data: pedidosPagosHoje } = await supabase
        .from('pedidos')
        .select('valor_total')
        .eq('status', 'pago')
        .gte('criado_em', todayISO)

      const faturamentoHoje = pedidosPagosHoje?.reduce(
        (sum, p) => sum + (p.valor_total || 0),
        0
      ) || 0

      // Pedidos pendentes
      const { count: pedidosPendentes } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendente')

      // Produtos ativos
      const { count: produtosAtivos } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true)

      // Últimos 10 pedidos
      const { data: ultimos } = await supabase
        .from('pedidos')
        .select('id, cliente_nome, cliente_telefone, valor_total, status, criado_em')
        .order('criado_em', { ascending: false })
        .limit(10)

      // Estoque baixo (< 5)
      const { data: estoque } = await supabase
        .from('produtos')
        .select('id, nome, categoria, estoque')
        .lt('estoque', 5)
        .eq('ativo', true)
        .order('estoque', { ascending: true })

      setStats({
        pedidosHoje: pedidosHoje || 0,
        faturamentoHoje,
        pedidosPendentes: pedidosPendentes || 0,
        produtosAtivos: produtosAtivos || 0,
      })
      setUltimosPedidos(ultimos || [])
      setEstoqueBaixo(estoque || [])
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [fetchData])

  return (
    <div className="flex min-h-screen paper-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-[260px] flex flex-col">
        <Header title="Dashboard" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 space-y-6">
          {/* Ambient glow decorations */}
          <div className="pointer-events-none fixed top-20 right-[15%] w-[500px] h-[500px] bg-violet-500/[0.03] rounded-full blur-[100px]" />
          <div className="pointer-events-none fixed bottom-10 left-[30%] w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[100px]" />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[130px] rounded-2xl bg-white/[0.04]" />
              ))
            ) : (
              <>
                <StatsCard
                  title="Pedidos hoje"
                  value={stats.pedidosHoje}
                  icon={ShoppingCart}
                  description="Total de pedidos recebidos"
                  gradient="violet"
                  delay={0}
                />
                <StatsCard
                  title="Faturamento hoje"
                  value={formatBRL(stats.faturamentoHoje)}
                  icon={DollarSign}
                  description="Pedidos com status pago"
                  gradient="emerald"
                  delay={80}
                />
                <StatsCard
                  title="Pendentes"
                  value={stats.pedidosPendentes}
                  icon={Clock}
                  description="Aguardando pagamento"
                  gradient="amber"
                  delay={160}
                />
                <StatsCard
                  title="Produtos ativos"
                  value={stats.produtosAtivos}
                  icon={Package}
                  description="Visíveis no bot"
                  gradient="cyan"
                  delay={240}
                />
              </>
            )}
          </div>

          {/* Estoque Baixo */}
          {!loading && <EstoqueAlerta produtos={estoqueBaixo} />}

          {/* Últimos Pedidos */}
          <div
            className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#0D0D22] to-[#0A0A1C] shadow-xl opacity-0 animate-fade-in-up"
            style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
          >
            {/* Top highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Header */}
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="font-heading font-bold text-white text-base tracking-tight">
                Últimos Pedidos
              </h3>
              <Link
                href="/pedidos"
                className="text-xs text-violet-400 hover:text-cyan-400 font-semibold flex items-center gap-1.5 transition-colors group"
              >
                Ver todos
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl bg-white/[0.03]" />
                ))}
              </div>
            ) : ultimosPedidos.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                  <Inbox size={28} className="text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-400">Nenhum pedido encontrado</p>
                <p className="text-xs text-gray-600 mt-1">
                  Os pedidos do bot aparecerão aqui automaticamente
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                        Data/Hora
                      </th>
                      <th className="text-left px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                        Cliente
                      </th>
                      <th className="text-left px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                        Total
                      </th>
                      <th className="text-left px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimosPedidos.map((pedido) => (
                      <tr
                        key={pedido.id}
                        onClick={() => router.push(`/pedidos/${pedido.id}`)}
                        className="border-b border-white/[0.04] last:border-0 cursor-pointer hover:bg-white/[0.03] transition-colors group"
                      >
                        <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap text-xs tabular-nums">
                          {formatDate(pedido.criado_em)}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <p className="font-semibold text-gray-200 group-hover:text-white transition-colors text-sm">
                            {pedido.cliente_nome || '—'}
                          </p>
                          <p className="text-[11px] text-gray-600 tabular-nums">
                            {pedido.cliente_telefone}
                          </p>
                        </td>
                        <td className="px-6 py-3.5 font-bold text-white whitespace-nowrap tabular-nums">
                          {formatBRL(pedido.valor_total)}
                        </td>
                        <td className="px-6 py-3.5">
                          <PedidoStatusBadge status={pedido.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
