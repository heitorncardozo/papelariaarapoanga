import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  className?: string
  gradient?: 'violet' | 'cyan' | 'amber' | 'emerald'
  delay?: number
}

const gradientMap = {
  violet: {
    bg: 'from-violet-500/20 to-violet-700/10',
    icon: 'text-violet-400',
    ring: 'shadow-violet-500/10',
    border: 'hover:border-violet-500/30',
    glow: 'group-hover:shadow-violet-500/20',
  },
  cyan: {
    bg: 'from-cyan-500/20 to-cyan-700/10',
    icon: 'text-cyan-400',
    ring: 'shadow-cyan-500/10',
    border: 'hover:border-cyan-500/30',
    glow: 'group-hover:shadow-cyan-500/20',
  },
  amber: {
    bg: 'from-amber-500/20 to-amber-700/10',
    icon: 'text-amber-400',
    ring: 'shadow-amber-500/10',
    border: 'hover:border-amber-500/30',
    glow: 'group-hover:shadow-amber-500/20',
  },
  emerald: {
    bg: 'from-emerald-500/20 to-emerald-700/10',
    icon: 'text-emerald-400',
    ring: 'shadow-emerald-500/10',
    border: 'hover:border-emerald-500/30',
    glow: 'group-hover:shadow-emerald-500/20',
  },
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  className,
  gradient = 'violet',
  delay = 0,
}: StatsCardProps) {
  const g = gradientMap[gradient]

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/[0.07]',
        'bg-gradient-to-br from-[#0D0D22] to-[#0A0A1C]',
        'p-5 shadow-xl transition-all duration-300',
        'hover:-translate-y-1 hover:border-white/[0.12]',
        `hover:shadow-2xl ${g.glow}`,
        'opacity-0 animate-fade-in-up',
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Subtle top highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
            {title}
          </p>
          <p className="text-3xl font-heading font-extrabold text-white tracking-tight leading-none">
            {value}
          </p>
          {description && (
            <p className="text-xs text-gray-500 mt-1.5">{description}</p>
          )}
        </div>

        <div
          className={cn(
            'shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
            `bg-gradient-to-br ${g.bg}`,
            'ring-1 ring-white/[0.06] shadow-inner'
          )}
        >
          <Icon size={22} className={g.icon} strokeWidth={1.8} />
        </div>
      </div>

      {/* Bottom gradient line accent */}
      <div className={cn('absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        `bg-gradient-to-r ${g.bg}`
      )} />
    </div>
  )
}
