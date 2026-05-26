'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/sidebar'
import Header from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { createSupabaseClient } from '@/lib/supabase-client'
import { excluirProduto, toggleAtivo } from '@/actions/produtos'
import { formatBRL } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'

interface Produto {
  id: string
  nome: string
  descricao: string | null
  categoria: string
  preco: number
  estoque: number
  unidade: string
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

type SortField = 'nome' | 'preco'
type SortDir = 'asc' | 'desc'

export default function ProdutosPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [search, setSearch] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('todas')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [sortField, setSortField] = useState<SortField>('nome')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const fetchProdutos = async () => {
    const supabase = createSupabaseClient()
    const { data } = await supabase
      .from('produtos')
      .select('*')
      .order('nome')

    setProdutos(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProdutos()
  }, [])

  const categorias = useMemo(() => {
    const cats = [...new Set(produtos.map((p) => p.categoria))]
    return cats.sort()
  }, [produtos])

  const filteredProdutos = useMemo(() => {
    let result = [...produtos]

    // Search
    if (search) {
      const s = search.toLowerCase()
      result = result.filter((p) => p.nome.toLowerCase().includes(s))
    }

    // Category filter
    if (filterCategoria !== 'todas') {
      result = result.filter((p) => p.categoria === filterCategoria)
    }

    // Status filter
    if (filterStatus === 'ativos') {
      result = result.filter((p) => p.ativo)
    } else if (filterStatus === 'inativos') {
      result = result.filter((p) => !p.ativo)
    }

    // Sort
    result.sort((a, b) => {
      let comp = 0
      if (sortField === 'nome') {
        comp = a.nome.localeCompare(b.nome)
      } else {
        comp = a.preco - b.preco
      }
      return sortDir === 'asc' ? comp : -comp
    })

    return result
  }, [produtos, search, filterCategoria, filterStatus, sortField, sortDir])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const handleDelete = async (id: string) => {
    // Optimistic update
    setProdutos((prev) => prev.filter((p) => p.id !== id))
    const result = await excluirProduto(id)
    if (result.sucesso) {
      toast.success('Produto excluído com sucesso!')
    } else {
      toast.error(result.erro || 'Erro ao excluir produto')
      fetchProdutos() // Revert
    }
  }

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    // Optimistic update
    setProdutos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ativo } : p))
    )
    const result = await toggleAtivo(id, ativo)
    if (!result.sucesso) {
      toast.error('Erro ao alterar status')
      fetchProdutos() // Revert
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-gray-600" />
    return sortDir === 'asc' ? (
      <ChevronUp size={14} className="text-violet-400" />
    ) : (
      <ChevronDown size={14} className="text-violet-400" />
    )
  }

  return (
    <div className="flex min-h-screen paper-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-[260px] flex flex-col">
        <Header title="Produtos" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 space-y-4">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-[280px]">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <Input
                  placeholder="Buscar por nome..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
                />
              </div>

              <Select value={filterCategoria} onValueChange={(v) => v && setFilterCategoria(v)}>
                <SelectTrigger className="w-full sm:w-[180px] h-9 bg-white/[0.04] border-white/[0.08] text-gray-300">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas categorias</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v)}>
                <SelectTrigger className="w-full sm:w-[140px] h-9 bg-white/[0.04] border-white/[0.08] text-gray-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativos">Ativos</SelectItem>
                  <SelectItem value="inativos">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Link href="/produtos/novo">
              <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 text-white gap-2 shadow-lg shadow-violet-500/20 w-full sm:w-auto font-bold border-0 rounded-xl cursor-pointer">
                <Plus size={16} />
                Novo produto
              </Button>
            </Link>
          </div>

          {/* Table */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#0D0D22] to-[#0A0A1C] shadow-xl animate-fade-in-up">
            {/* Top highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl bg-white/[0.03]" />
                ))}
              </div>
            ) : filteredProdutos.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                  <Package size={28} className="text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-400">
                  {search || filterCategoria !== 'todas' || filterStatus !== 'todos'
                    ? 'Nenhum produto encontrado com os filtros aplicados'
                    : 'Nenhum produto cadastrado'}
                </p>
                {!search && filterCategoria === 'todas' && filterStatus === 'todos' && (
                  <Link href="/produtos/novo">
                    <Button variant="outline" size="sm" className="mt-4 gap-2 border-white/[0.1] text-gray-300 hover:bg-white/[0.05] rounded-xl">
                      <Plus size={14} />
                      Cadastrar primeiro produto
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th
                        className="text-left px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] cursor-pointer select-none hover:text-gray-300 transition-colors"
                        onClick={() => handleSort('nome')}
                      >
                        <span className="flex items-center gap-1">
                          Nome <SortIcon field="nome" />
                        </span>
                      </th>
                      <th className="text-left px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                        Categoria
                      </th>
                      <th
                        className="text-left px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] cursor-pointer select-none hover:text-gray-300 transition-colors"
                        onClick={() => handleSort('preco')}
                      >
                        <span className="flex items-center gap-1">
                          Preço <SortIcon field="preco" />
                        </span>
                      </th>
                      <th className="text-left px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                        Estoque
                      </th>
                      <th className="text-left px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                        Unidade
                      </th>
                      <th className="text-left px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                        Ativo
                      </th>
                      <th className="text-right px-6 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProdutos.map((produto) => (
                      <tr
                        key={produto.id}
                        className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <p className="font-semibold text-gray-200 text-sm">{produto.nome}</p>
                          {produto.descricao && (
                            <p className="text-[11px] text-gray-600 truncate max-w-[250px]">
                              {produto.descricao}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap text-xs">
                          <span className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded-md">
                            {produto.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-bold text-white whitespace-nowrap tabular-nums">
                          {formatBRL(produto.preco)}
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap tabular-nums">
                          <span
                            className={
                              produto.estoque < 5
                                ? 'text-amber-400 font-bold'
                                : 'text-gray-400'
                            }
                          >
                            {produto.estoque}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap capitalize text-xs">
                          {produto.unidade}
                        </td>
                        <td className="px-6 py-3.5">
                          <button
                            onClick={() => handleToggleAtivo(produto.id, !produto.ativo)}
                          >
                            <Badge
                              variant={produto.ativo ? 'default' : 'secondary'}
                              className={
                                produto.ativo
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 cursor-pointer transition-colors'
                                  : 'bg-white/[0.04] text-gray-500 border border-white/[0.06] hover:bg-white/[0.08] cursor-pointer transition-colors'
                              }
                            >
                              {produto.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </button>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/produtos/${produto.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg cursor-pointer"
                              >
                                <Pencil size={14} />
                              </Button>
                            </Link>

                            <AlertDialog>
                              <AlertDialogTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                }
                              />
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir produto</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir &quot;{produto.nome}&quot;? Esta ação não pode ser
                                    desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(produto.id)}
                                    className="bg-destructive text-white hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Count */}
          {!loading && filteredProdutos.length > 0 && (
            <p className="text-xs text-gray-600 text-center">
              Mostrando {filteredProdutos.length} de {produtos.length} produtos
            </p>
          )}
        </main>
      </div>
    </div>
  )
}
