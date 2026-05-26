'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/produtos', label: 'Produtos', icon: Package },
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col',
          'bg-sidebar text-sidebar-foreground',
          'border-r border-sidebar-border',
          'transition-transform duration-300 ease-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-white/[0.06]">
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-neon to-cyan-neon flex items-center justify-center shadow-lg shadow-violet-neon/20 group-hover:shadow-violet-neon/40 transition-shadow">
              <span className="font-heading text-white text-lg font-bold">P</span>
            </div>
            <div>
              <h1 className="font-heading text-[15px] font-bold text-white tracking-tight leading-none">
                Papelaria
              </h1>
              <p className="text-[10px] text-cyan-neon/80 tracking-[0.2em] uppercase mt-0.5 font-semibold">
                Painel Admin
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md hover:bg-white/10 text-sidebar-foreground/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/30 px-3 mb-3 font-semibold">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'active bg-sidebar-accent text-white'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-neon animate-pulse" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <div className="text-[10px] text-sidebar-foreground/30 text-center">
            © {new Date().getFullYear()} Papelaria Arapoanga
          </div>
        </div>
      </aside>
    </>
  )
}
