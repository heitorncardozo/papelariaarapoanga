import { cn } from '@/lib/utils'

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
  pendente: {
    label: 'Pendente',
    dot: 'bg-amber-400 animate-pulse',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  pago: {
    label: 'Pago',
    dot: 'bg-emerald-400',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  em_separacao: {
    label: 'Em separação',
    dot: 'bg-blue-400 animate-pulse',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  entregue: {
    label: 'Entregue',
    dot: 'bg-green-400',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/20',
  },
  cancelado: {
    label: 'Cancelado',
    dot: 'bg-red-400',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
  },
}

interface PedidoStatusBadgeProps {
  status: string
  className?: string
}

export default function PedidoStatusBadge({ status, className }: PedidoStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    dot: 'bg-gray-400',
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    border: 'border-gray-500/20',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', config.dot)} />
      {config.label}
    </span>
  )
}
