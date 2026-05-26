'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/sidebar'
import Header from '@/components/header'
import PedidoStatusBadge from '@/components/pedido-status-badge'
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
import { atualizarStatus } from '@/actions/pedidos'
import { formatBRL, formatDate, truncateUUID, statusLabels } from '@/lib/utils'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ExternalLink,
  User,
  Phone,
  MessageSquare,
  Hash,
  Calendar,
  Loader2,
} from 'lucide-react'

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
  link_pagamento: string | null
  observacao: string | null
  criado_em: string
  atualizado_em: string
}

const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'pago', label: 'Pago' },
  { value: 'em_separacao', label: 'Em separação' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelado', label: 'Cancelado' },
]

export default function PedidoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    const fetchPedido = async () => {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        toast.error('Pedido não encontrado')
        router.push('/pedidos')
        return
      }

      setPedido(data)
      setLoading(false)
    }

    if (id) fetchPedido()
  }, [id, router])

  const handleStatusChange = async (newStatus: string) => {
    if (!pedido || updatingStatus) return

    const oldStatus = pedido.status
    setUpdatingStatus(true)

    // Optimistic update
    setPedido({ ...pedido, status: newStatus })

    const result = await atualizarStatus(pedido.id, newStatus)

    if (result.sucesso) {
      toast.success(`Status atualizado para "${statusLabels[newStatus] || newStatus}"`)
    } else {
      toast.error(result.erro || 'Erro ao atualizar status')
      setPedido({ ...pedido, status: oldStatus }) // Revert
    }

    setUpdatingStatus(false)
  }

  return (
    <div className="flex min-h-screen paper-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-[260px] flex flex-col">
        <Header title="Detalhe do Pedido" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 max-w-4xl">
          <Link
            href="/pedidos"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-terracotta transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Voltar para pedidos
          </Link>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          ) : pedido ? (
            <div className="space-y-6 animate-fade-in-up">
              {/* Header card */}
              <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Hash size={14} />
                        <span className="text-sm font-mono font-medium">
                          {truncateUUID(pedido.id)}
                        </span>
                      </div>
                      <PedidoStatusBadge status={pedido.status} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      {formatDate(pedido.criado_em)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Select
                      value={pedido.status}
                      onValueChange={(val) => val && handleStatusChange(val)}
                      disabled={updatingStatus}
                    >
                      <SelectTrigger className="w-[180px] h-9">
                        {updatingStatus ? (
                          <div className="flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin" />
                            Atualizando...
                          </div>
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Client info */}
              <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                <h3 className="font-heading font-semibold text-foreground mb-4 text-sm">
                  Dados do Cliente
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <User size={16} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Nome</p>
                      <p className="text-sm font-medium text-foreground">
                        {pedido.cliente_nome || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <Phone size={16} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Telefone</p>
                      <p className="text-sm font-medium text-foreground">
                        {pedido.cliente_telefone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items table */}
              <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="font-heading font-semibold text-foreground text-sm">
                    Itens do Pedido
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Produto
                        </th>
                        <th className="text-center px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Qtd
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Preço unit.
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(pedido.itens) && pedido.itens.map((item, idx) => (
                        <tr key={idx} className="border-b border-border/50 last:border-0">
                          <td className="px-6 py-3 font-medium text-foreground">
                            {item.nome}
                          </td>
                          <td className="px-6 py-3 text-center text-muted-foreground">
                            {item.qtd}
                          </td>
                          <td className="px-6 py-3 text-right text-muted-foreground">
                            {formatBRL(item.preco_unit)}
                          </td>
                          <td className="px-6 py-3 text-right font-medium text-foreground">
                            {formatBRL(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/20">
                        <td
                          colSpan={3}
                          className="px-6 py-3 text-right text-sm font-heading font-semibold text-foreground"
                        >
                          Total
                        </td>
                        <td className="px-6 py-3 text-right text-lg font-heading font-bold text-terracotta">
                          {formatBRL(pedido.valor_total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payment link */}
              {pedido.link_pagamento && (
                <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                  <h3 className="font-heading font-semibold text-foreground mb-3 text-sm">
                    Link de Pagamento
                  </h3>
                  <a
                    href={pedido.link_pagamento}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="gap-2 text-terracotta border-terracotta/30 hover:bg-terracotta/5"
                    >
                      <ExternalLink size={14} />
                      Abrir link
                    </Button>
                  </a>
                </div>
              )}

              {/* Observation */}
              {pedido.observacao && (
                <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare size={14} className="text-muted-foreground" />
                    <h3 className="font-heading font-semibold text-foreground text-sm">
                      Observação do Bot
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4 border border-border/50">
                    {pedido.observacao}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
