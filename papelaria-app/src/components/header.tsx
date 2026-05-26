'use client'

import { useRouter } from 'next/navigation'
import { Menu, LogOut, User } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

interface HeaderProps {
  title: string
  onMenuClick: () => void
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#08081A]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-8">
      {/* Left: Menu + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-white/[0.06] text-gray-400 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h2 className="font-heading text-lg font-bold text-white tracking-tight">
          {title}
        </h2>
      </div>

      {/* Right: User + logout */}
      <div className="flex items-center gap-2">
        {userEmail && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500/30 to-cyan-500/20 flex items-center justify-center">
              <User size={12} className="text-violet-400" />
            </div>
            <span className="text-xs text-gray-400 font-medium truncate max-w-[180px]">
              {userEmail}
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 gap-2 transition-all rounded-xl cursor-pointer"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline text-xs font-medium">
            {loggingOut ? 'Saindo...' : 'Sair'}
          </span>
        </Button>
      </div>
    </header>
  )
}
