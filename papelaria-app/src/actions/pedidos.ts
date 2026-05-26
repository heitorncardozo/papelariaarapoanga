'use server'

import { createSupabaseServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function atualizarStatus(
  id: string,
  status: string
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const supabase = await createSupabaseServer()

    const validStatuses = ['pendente', 'pago', 'cancelado', 'em_separacao', 'entregue']
    if (!validStatuses.includes(status)) {
      return { sucesso: false, erro: 'Status inválido.' }
    }

    const { error } = await supabase
      .from('pedidos')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar status:', error)
      return { sucesso: false, erro: 'Erro ao atualizar status. Tente novamente.' }
    }

    revalidatePath('/pedidos')
    revalidatePath(`/pedidos/${id}`)
    revalidatePath('/dashboard')
    return { sucesso: true }
  } catch (err) {
    console.error('Erro inesperado:', err)
    return { sucesso: false, erro: 'Erro inesperado. Tente novamente.' }
  }
}
