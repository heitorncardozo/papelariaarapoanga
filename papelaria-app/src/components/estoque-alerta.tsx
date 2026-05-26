'use client'

import { AlertTriangle, Package } from 'lucide-react'

interface Produto {
  id: string
  nome: string
  categoria: string
  estoque: number
}

interface EstoqueAlertaProps {
  produtos: Produto[]
}

export default function EstoqueAlerta({ produtos }: EstoqueAlertaProps) {
  if (produtos.length === 0) return null

  return (
    <div
      className="animate-fade-in-up relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#16100A] to-[#0F0D0A] p-5 shadow-xl"
      style={{ animationDelay: '300ms', animationFillMode: 'forwards', opacity: 0 }}
    >
      {/* Top glow line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/20 flex items-center justify-center ring-1 ring-amber-500/20 shadow-inner">
          <AlertTriangle size={16} className="text-amber-400" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-amber-300 text-sm tracking-tight">
            Estoque Baixo
          </h3>
          <p className="text-[10px] text-amber-500/60 font-medium">
            Produtos que precisam de reposição
          </p>
        </div>
        <span className="ml-auto text-xs bg-amber-500/15 text-amber-400 px-3 py-1 rounded-full font-bold border border-amber-500/20">
          {produtos.length} {produtos.length === 1 ? 'produto' : 'produtos'}
        </span>
      </div>

      {/* Products list */}
      <div className="space-y-2">
        {produtos.map((produto, i) => (
          <div
            key={produto.id}
            className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-amber-500/20 hover:bg-amber-500/5 transition-all duration-200"
            style={{ animationDelay: `${300 + i * 60}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Package size={13} className="text-amber-500/70" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-200">{produto.nome}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{produto.categoria}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`text-lg font-extrabold font-heading tabular-nums ${
                  produto.estoque === 0 ? 'text-red-400' : 'text-amber-400'
                }`}
              >
                {produto.estoque}
              </span>
              <span className="text-[10px] text-gray-500 font-medium">un.</span>
              {produto.estoque === 0 && (
                <span className="ml-2 text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                  Esgotado
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
