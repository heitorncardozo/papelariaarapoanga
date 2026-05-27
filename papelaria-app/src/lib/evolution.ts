const BASE_URL = process.env.EVOLUTION_API_URL!
const API_KEY = process.env.EVOLUTION_API_KEY!
const INSTANCE = process.env.EVOLUTION_INSTANCE!

export async function enviarMensagem(telefone: string, texto: string) {
  try {
    const res = await fetch(`${BASE_URL}/message/sendText/${INSTANCE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: API_KEY,
      },
      body: JSON.stringify({
        number: telefone,
        text: texto,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Evolution] Erro ao enviar mensagem:', err)
    }
  } catch (err) {
    console.error('[Evolution] Erro ao enviar mensagem:', err)
  }
}
