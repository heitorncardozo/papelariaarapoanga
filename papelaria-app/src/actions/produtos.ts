'use server'

import { createSupabaseServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function criarProduto(formData: FormData): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const supabase = await createSupabaseServer()

    const nome = formData.get('nome') as string
    const descricao = formData.get('descricao') as string | null
    const categoria = formData.get('categoria') as string
    const preco = parseFloat(formData.get('preco') as string)
    const estoque = parseInt(formData.get('estoque') as string, 10)
    const unidade = formData.get('unidade') as string
    const ativo = formData.get('ativo') === 'true'

    if (!nome || !categoria || isNaN(preco) || isNaN(estoque)) {
      return { sucesso: false, erro: 'Preencha todos os campos obrigatórios.' }
    }

    if (preco < 0) {
      return { sucesso: false, erro: 'Preço não pode ser negativo.' }
    }

    if (estoque < 0) {
      return { sucesso: false, erro: 'Estoque não pode ser negativo.' }
    }

    const { error } = await supabase.from('produtos').insert({
      nome,
      descricao: descricao || null,
      categoria,
      preco,
      estoque,
      unidade,
      ativo,
    })

    if (error) {
      console.error('Erro ao criar produto:', error)
      return { sucesso: false, erro: 'Erro ao criar produto. Tente novamente.' }
    }

    revalidatePath('/produtos')
    revalidatePath('/dashboard')
    return { sucesso: true }
  } catch (err) {
    console.error('Erro inesperado:', err)
    return { sucesso: false, erro: 'Erro inesperado. Tente novamente.' }
  }
}

export async function atualizarProduto(id: string, formData: FormData): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const supabase = await createSupabaseServer()

    const nome = formData.get('nome') as string
    const descricao = formData.get('descricao') as string | null
    const categoria = formData.get('categoria') as string
    const preco = parseFloat(formData.get('preco') as string)
    const estoque = parseInt(formData.get('estoque') as string, 10)
    const unidade = formData.get('unidade') as string
    const ativo = formData.get('ativo') === 'true'

    if (!nome || !categoria || isNaN(preco) || isNaN(estoque)) {
      return { sucesso: false, erro: 'Preencha todos os campos obrigatórios.' }
    }

    if (preco < 0) {
      return { sucesso: false, erro: 'Preço não pode ser negativo.' }
    }

    if (estoque < 0) {
      return { sucesso: false, erro: 'Estoque não pode ser negativo.' }
    }

    const { error } = await supabase
      .from('produtos')
      .update({
        nome,
        descricao: descricao || null,
        categoria,
        preco,
        estoque,
        unidade,
        ativo,
      })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar produto:', error)
      return { sucesso: false, erro: 'Erro ao atualizar produto. Tente novamente.' }
    }

    revalidatePath('/produtos')
    revalidatePath('/dashboard')
    return { sucesso: true }
  } catch (err) {
    console.error('Erro inesperado:', err)
    return { sucesso: false, erro: 'Erro inesperado. Tente novamente.' }
  }
}

export async function excluirProduto(id: string): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    const supabase = await createSupabaseServer()

    const { error } = await supabase.from('produtos').delete().eq('id', id)

    if (error) {
      console.error('Erro ao excluir produto:', error)
      return { sucesso: false, erro: 'Erro ao excluir produto. Tente novamente.' }
    }

    revalidatePath('/produtos')
    revalidatePath('/dashboard')
    return { sucesso: true }
  } catch (err) {
    console.error('Erro inesperado:', err)
    return { sucesso: false, erro: 'Erro inesperado. Tente novamente.' }
  }
}

export async function toggleAtivo(id: string, ativo: boolean): Promise<{ sucesso: boolean }> {
  try {
    const supabase = await createSupabaseServer()

    const { error } = await supabase
      .from('produtos')
      .update({ ativo })
      .eq('id', id)

    if (error) {
      console.error('Erro ao alterar status:', error)
      return { sucesso: false }
    }

    revalidatePath('/produtos')
    revalidatePath('/dashboard')
    return { sucesso: true }
  } catch {
    return { sucesso: false }
  }
}
