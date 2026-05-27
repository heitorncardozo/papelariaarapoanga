import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { groq } from '@/lib/groq'
import { buildSystemPrompt } from '@/lib/bot-prompt'
import { enviarMensagem } from '@/lib/evolution'

// Supabase com service role para o bot (sem RLS bloqueando)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // adicionar no .env
)

// Histórico em memória por sessão (reinicia ao reiniciar o server)
// Para produção, migrar para Redis ou tabela no Supabase
const historico: Record<string, { role: 'user' | 'assistant'; content: string }[]> = {}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Formato padrão da Evolution API v2
    const telefone: string = body?.data?.key?.remoteJid?.replace('@s.whatsapp.net', '')
    const mensagem: string = body?.data?.message?.conversation || body?.data?.message?.extendedTextMessage?.text

    // Ignorar mensagens sem texto ou do próprio bot
    if (!telefone || !mensagem || body?.data?.key?.fromMe) {
      return NextResponse.json({ ok: true })
    }

    // Buscar produtos ativos com estoque
    const { data: produtos, error } = await supabase
      .from('produtos')
      .select('nome, categoria, preco, estoque, unidade')
      .eq('ativo', true)
      .gt('estoque', 0)

    if (error) throw error

    // Inicializar histórico da conversa
    if (!historico[telefone]) historico[telefone] = []

    historico[telefone].push({ role: 'user', content: mensagem })

    // Limitar histórico a 10 trocas (20 mensagens)
    if (historico[telefone].length > 20) {
      historico[telefone] = historico[telefone].slice(-20)
    }

    // Chamar Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: buildSystemPrompt(produtos || []) },
        ...historico[telefone],
      ],
      max_tokens: 512,
      temperature: 0.5,
    })

    const resposta = completion.choices[0]?.message?.content || 'Desculpe, não entendi. Pode repetir?'

    historico[telefone].push({ role: 'assistant', content: resposta })

    // Checar se é confirmação de pedido
    if (resposta.includes('PEDIDO_CONFIRMADO|')) {
      await processarPedido(resposta, telefone)
      // Enviar mensagem de confirmação limpa para o cliente
      const confirmacao = '✅ Pedido recebido! Em breve entraremos em contato para combinar a retirada ou entrega. Obrigada pela preferência! 🛍️'
      await enviarMensagem(telefone, confirmacao)
    } else {
      await enviarMensagem(telefone, resposta)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Webhook] Erro:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

async function processarPedido(resposta: string, telefone: string) {
  try {
    // Parsear: PEDIDO_CONFIRMADO|nome:João|itens:Caderno:2,Caneta:3|total:29.00
    const partes = Object.fromEntries(
      resposta
        .replace('PEDIDO_CONFIRMADO|', '')
        .split('|')
        .map((p) => p.split(':').map((v, i) => (i === 0 ? v : v)))
        .map(([k, ...v]) => [k, v.join(':')])
    )

    const itensRaw = partes['itens'] || ''
    const itens = itensRaw.split(',').map((item) => {
      const [nome, qtd] = item.split(':')
      return { nome: nome?.trim(), qtd: parseInt(qtd) || 1 }
    })

    // Buscar preços dos produtos
    const { data: produtos } = await supabase
      .from('produtos')
      .select('id, nome, preco')
      .in('nome', itens.map((i) => i.nome))

    const itensFormatados = itens.map((item) => {
      const produto = produtos?.find((p) => p.nome === item.nome)
      const preco_unit = produto?.preco || 0
      return {
        produto_id: produto?.id || null,
        nome: item.nome,
        qtd: item.qtd,
        preco_unit,
        subtotal: preco_unit * item.qtd,
      }
    })

    const valor_total = parseFloat(partes['total']) ||
      itensFormatados.reduce((acc, i) => acc + i.subtotal, 0)

    await supabase.from('pedidos').insert({
      cliente_nome: partes['nome'] || null,
      cliente_telefone: telefone,
      itens: itensFormatados,
      valor_total,
      status: 'pendente',
    })

    console.log(`[Bot] Pedido registrado — ${telefone}`)
  } catch (err) {
    console.error('[Bot] Erro ao processar pedido:', err)
  }
}
