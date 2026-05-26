import { createSupabaseServer } from '@/lib/supabase-server'
import ProdutoForm from '@/components/produto-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NovoProdutoPage() {
  const supabase = await createSupabaseServer()

  // Buscar categorias existentes para o datalist
  const { data: produtos } = await supabase
    .from('produtos')
    .select('categoria')

  const categorias = [...new Set((produtos || []).map((p) => p.categoria))].sort()

  return (
    <div className="flex min-h-screen paper-bg">
      <div className="flex-1 flex flex-col">
        <div className="p-4 lg:p-8 max-w-3xl mx-auto w-full">
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-violet-400 transition-colors mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Voltar para produtos
          </Link>

          <div className="mb-6">
            <h1 className="font-heading text-2xl font-extrabold text-white tracking-tight">
              Novo Produto
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Preencha os dados abaixo para cadastrar um novo produto no sistema.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#0D0D22] to-[#0A0A1C] shadow-xl p-6 lg:p-8">
            {/* Top highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <ProdutoForm categorias={categorias} />
          </div>
        </div>
      </div>
    </div>
  )
}
