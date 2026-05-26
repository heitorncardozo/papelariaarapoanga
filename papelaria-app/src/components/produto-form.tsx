'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { criarProduto, atualizarProduto } from '@/actions/produtos'
import { toast } from 'sonner'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'

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

interface ProdutoFormProps {
  produto?: Produto
  categorias: string[]
}

const unidades = [
  { value: 'unidade', label: 'Unidade' },
  { value: 'folha', label: 'Folha' },
  { value: 'pacote', label: 'Pacote' },
  { value: 'caixa', label: 'Caixa' },
  { value: 'rolo', label: 'Rolo' },
  { value: 'metro', label: 'Metro' },
]

export default function ProdutoForm({ produto, categorias }: ProdutoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [nome, setNome] = useState(produto?.nome || '')
  const [descricao, setDescricao] = useState(produto?.descricao || '')
  const [categoria, setCategoria] = useState(produto?.categoria || '')
  const [preco, setPreco] = useState(produto?.preco?.toString() || '')
  const [estoque, setEstoque] = useState(produto?.estoque?.toString() || '0')
  const [unidade, setUnidade] = useState(produto?.unidade || 'unidade')
  const [ativo, setAtivo] = useState(produto?.ativo ?? true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!produto

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório'
    if (nome.length > 100) newErrors.nome = 'Máximo 100 caracteres'
    if (!categoria.trim()) newErrors.categoria = 'Categoria é obrigatória'
    if (descricao && descricao.length > 500) newErrors.descricao = 'Máximo 500 caracteres'

    const precoNum = parseFloat(preco)
    if (isNaN(precoNum) || precoNum <= 0) newErrors.preco = 'Preço deve ser maior que zero'

    const estoqueNum = parseInt(estoque, 10)
    if (isNaN(estoqueNum) || estoqueNum < 0) newErrors.estoque = 'Estoque não pode ser negativo'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)

    const formData = new FormData()
    formData.set('nome', nome.trim())
    formData.set('descricao', descricao.trim())
    formData.set('categoria', categoria.trim())
    formData.set('preco', preco)
    formData.set('estoque', estoque)
    formData.set('unidade', unidade)
    formData.set('ativo', ativo.toString())

    try {
      const result = isEditing
        ? await atualizarProduto(produto.id, formData)
        : await criarProduto(formData)

      if (result.sucesso) {
        toast.success(isEditing ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!')
        router.push('/produtos')
      } else {
        toast.error(result.erro || 'Erro ao salvar produto.')
      }
    } catch {
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handlePrecoBlur = () => {
    const num = parseFloat(preco)
    if (!isNaN(num)) {
      setPreco(num.toFixed(2))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up max-w-2xl">
      {/* Nome */}
      <div className="space-y-2">
        <Label htmlFor="nome" className="text-sm font-medium">
          Nome <span className="text-destructive">*</span>
        </Label>
        <Input
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Caderno universitário 96 folhas"
          maxLength={100}
          className={errors.nome ? 'border-destructive' : ''}
        />
        {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
        <p className="text-xs text-muted-foreground">{nome.length}/100 caracteres</p>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="descricao" className="text-sm font-medium">Descrição</Label>
        <Textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição breve do produto..."
          maxLength={500}
          rows={3}
          className={errors.descricao ? 'border-destructive' : ''}
        />
        {errors.descricao && <p className="text-xs text-destructive">{errors.descricao}</p>}
        <p className="text-xs text-muted-foreground">{descricao.length}/500 caracteres</p>
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <Label htmlFor="categoria" className="text-sm font-medium">
          Categoria <span className="text-destructive">*</span>
        </Label>
        <Input
          id="categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Ex: Cadernos, Canetas, Material escolar..."
          list="categorias-list"
          className={errors.categoria ? 'border-destructive' : ''}
        />
        <datalist id="categorias-list">
          {categorias.map((cat) => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
        {errors.categoria && <p className="text-xs text-destructive">{errors.categoria}</p>}
      </div>

      {/* Preço e Estoque lado a lado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preco" className="text-sm font-medium">
            Preço (R$) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="preco"
            type="number"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            onBlur={handlePrecoBlur}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={errors.preco ? 'border-destructive' : ''}
          />
          {errors.preco && <p className="text-xs text-destructive">{errors.preco}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estoque" className="text-sm font-medium">
            Estoque <span className="text-destructive">*</span>
          </Label>
          <Input
            id="estoque"
            type="number"
            value={estoque}
            onChange={(e) => setEstoque(e.target.value)}
            placeholder="0"
            min="0"
            step="1"
            className={errors.estoque ? 'border-destructive' : ''}
          />
          {errors.estoque && <p className="text-xs text-destructive">{errors.estoque}</p>}
        </div>
      </div>

      {/* Unidade e Ativo lado a lado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Unidade <span className="text-destructive">*</span>
          </Label>
          <Select value={unidade} onValueChange={(v) => v && setUnidade(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unidades.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Ativo</Label>
          <div className="flex items-center gap-3 pt-2">
            <Switch checked={ativo} onCheckedChange={setAtivo} />
            <span className="text-sm text-muted-foreground">
              {ativo ? 'Visível no bot' : 'Oculto do bot'}
            </span>
          </div>
        </div>
      </div>

      {/* Timestamps (somente para edição) */}
      {isEditing && produto && (
        <div className="pt-4 border-t border-border">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Criado em: {formatDateShort(produto.criado_em)}</span>
            <span>Atualizado em: {formatDateShort(produto.atualizado_em)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="bg-terracotta hover:bg-terracotta-dark text-white gap-2 shadow-lg shadow-terracotta/20"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save size={16} />
              {isEditing ? 'Salvar alterações' : 'Criar produto'}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/produtos')}
          className="gap-2"
        >
          <ArrowLeft size={16} />
          Cancelar
        </Button>
      </div>
    </form>
  )
}
