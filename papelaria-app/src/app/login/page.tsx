'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase-client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })

      if (error) {
        console.error('Supabase Login Error:', error)
        setErro(`Erro: ${error.message} (Código: ${error.status || 'sem status'})`)
      } else {
        console.log('Login bem-sucedido:', data)
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      console.error('Erro de conexão no login:', err)
      setErro(`Erro de conexão: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center paper-bg px-4 relative overflow-hidden">
      {/* Decorative Glow Blurs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-violet-neon/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-[80px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-neon/10 rounded-full translate-x-1/3 translate-y-1/3 blur-[80px]" />

      {/* Futuristic lines */}
      <div className="absolute top-8 left-8 w-24 h-[1px] bg-violet-neon/30" />
      <div className="absolute top-8 left-8 w-[1px] h-24 bg-violet-neon/30" />
      <div className="absolute bottom-8 right-8 w-24 h-[1px] bg-cyan-neon/30" />
      <div className="absolute bottom-8 right-8 w-[1px] h-24 bg-cyan-neon/30" />

      <div className="w-full max-w-[400px] relative animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-neon to-cyan-neon shadow-xl shadow-violet-neon/20 mb-4 animate-float">
            <span className="font-heading text-3xl text-white font-bold tracking-tight">P</span>
          </div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white mb-1">
            <span className="text-gradient">Papelaria Arapoanga</span>
          </h1>
          <p className="text-sm text-cyan-neon/80 font-medium uppercase tracking-widest text-xs">Painel Administrativo</p>
        </div>

        {/* Login form (Glassmorphism) */}
        <div className="glass-card rounded-2xl border border-white/10 shadow-2xl p-8 relative overflow-hidden">
          {/* Subtle inside glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent via-violet-neon/50 to-transparent" />
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@papelaria.com"
                required
                autoComplete="email"
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-neon focus:ring-1 focus:ring-cyan-neon/30 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-11 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-neon focus:ring-1 focus:ring-cyan-neon/30 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="animate-fade-in bg-red-950/40 border border-red-500/30 text-red-300 text-xs px-4 py-3 rounded-xl backdrop-blur-md">
                {erro}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-violet-neon to-cyan-neon hover:opacity-90 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-violet-neon/20 hover:shadow-cyan-neon/30 transition-all border-0 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Conectando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest mt-8 font-semibold">
          Acesso restrito a administradores.
        </p>
      </div>
    </div>
  )
}
