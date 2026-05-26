'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import Header from '@/components/header'
import PedidoStatusBadge from '@/components/pedido-status-badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createSupabaseClient } from '@/lib/supabase-client'
import { formatBRL, formatDate, truncateUUID } from '@/lib/utils'
import { Search, ShoppingCart, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'

interface PedidoItem {
  produto_id: string
  nome: string
  qtd: number
  preco_unit: number
  subtotal: number
}

interface Pedido {
  id: string
  cliente_nome: string | null
  cliente_telefone: string
  itens: PedidoItem[]
  valor_total: number
  status: string
  criado_em: string
}

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'pago', label: 'Pago' },
  { value: 'em_separacao', label: 'Em separação' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelado', label: 'Cancelado' },
]

const DATE_FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'hoje', label: 'Hoje' },
  { value: '7dias', label: 'Últimos 7 dias' },
  { value: '30dias', label: 'Últimos 30 dias' },
]

const PAGE_SIZE = 20

export default function PedidosPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [searchTelefone, setSearchTelefone] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterDate, setFilterDate] = useState('todos')
  const [page, setPage] = useState(1)
  const router = useRouter()

  useEffect(() => {
    const fetchPedidos = async () => {
      const supabase = createSupabaseClient()
      const { data } = await supabase
        .from('pedidos')
        .select('*')
        .order('criado_em', { ascending: false })
        .limit(500)

      setPedidos(data || [])
      setLoading(false)
    }

    fetchPedidos()
  }, [])

  const filteredPedidos = useMemo(() => {
    let result = [...pedidos]

    // Status filter
    if (filterStatus !== 'todos') {
      result = result.filter((p) => p.status === filterStatus)
    }

    // Date filter
    if (filterDate !== 'todos') {
      const now = new Date()
      let startDate = new Date()

      if (filterDate === 'hoje') {
        startDate.setHours(0, 0, 0, 0)
      } else if (filterDate === '7dias') {
        startDate.setDate(now.getDate() - 7)
      } else if (filterDate === '30dias') {
        startDate.setDate(now.getDate() - 30)
      }

      result = result.filter(
        (p) => new Date(p.criado_em) >= startDate
      )
    }

    // Search by phone
    if (searchTelefone) {
      result = result.filter((p) =>
        p.cliente_telefone?.includes(searchTelefone)
      )
    }

    return result
  }, [pedidos, filterStatus, filterDate, searchTelefone])

  const totalPages = Math.ceil(filteredPedidos.length / PAGE_SIZE)
  const paginatedPedidos = filteredPedidos.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  // Reset page on filter change
  useEffect(() => {
    setPage(1)
  }, [filterStatus, filterDate, searchTelefone])

  const summarizeItens = (itens: PedidoItem[]) => {
    if (!itens || !Array.isArray(itens)) return '—'
    if (itens.length === 0) return '—'
    if (itens.length === 1) return `${itens[0].qtd}x ${itens[0].nome}`
    return `${itens[0].qtd}x ${itens[0].nome} +${itens.length - 1}`
  }

  return (
    <div className="flex min-h-screen paper-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-[260px] flex flex-col">
        <Header title="Pedidos" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-fade-in">
            <div className="relative w-full sm:w-[220px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <Input
                placeholder="Buscar por telefone..."
                value={searchTelefone}
                onChange={(e) => setSearchTelefone(e.target.value)}
                className="pl-9 h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              />
            </div>

            <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v)}>
              <SelectTrigger className="w-full sm:w-[160px] h-9 bg-white/[0.04] border-white/[0.08] text-gray-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDate} onValueChange={(v) => v && setFilterDate(v)}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 bg-white/[0.04] border-white/[0.08] text-gray-300">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                {DATE_FILTERS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#0D0D22] to-[#0A0A1C] shadow-xl animate-fade-in-up">
            {/* Top highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl bg-white/[0.03]" />
                ))}
              </div>
            ) : paginatedPedidos.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                  <Inbox size={28} className="text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-400">Nenhum pedido encontrado</p>
                <p className="text-xs text-gray-600 mt-1">
                  {filterStatus !== 'todos' || filterDate !== 'todos' || searchTelefone
                    ? 'Tente ajustar os filtros'
                    : 'Os pedidos do bot aparecerão aqui automaticamente'}
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
                      <th className="text-left px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] hidden md:table-cell">
                        Telefone
                      </th>
                      <th className="text-left px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] hidden lg:table-cell">
                        Itens
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
                    {paginatedPedidos.map((pedido) => (
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
                          <p className="text-[11px] text-gray-600 md:hidden tabular-nums">
                            {pedido.cliente_telefone}
                          </p>
                        </td>
                        <td className="px-6 py-3.5 text-gray-400 whitespace-nowrap hidden md:table-cell tabular-nums text-xs">
                          {pedido.cliente_telefone}
                        </td>
                        <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap hidden lg:table-cell max-w-[200px] truncate text-xs">
                          {summarizeItens(pedido.itens)}
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

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">
                Página {page} de {totalPages} — {filteredPedidos.length} pedidos
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="h-8 border-white/[0.08] text-gray-400 hover:bg-white/[0.05] rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="h-8 border-white/[0.08] text-gray-400 hover:bg-white/[0.05] rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
