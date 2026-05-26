

Prompt: Admin Panel — Bot de Vendas Papelaria
Construa um Admin Panel completo, funcional e pronto para produção para o sistema de bot de vendas no WhatsApp de uma papelaria. Este painel é usado internamente pela dona da papelaria — ela não é técnica, então a interface precisa ser simples, clara e sem ambiguidade.

Stack obrigatória

Next.js 14 com App Router
Supabase para banco de dados, autenticação e Row Level Security
Tailwind CSS para estilos
shadcn/ui para componentes (instale via npx shadcn@latest init)
Deploy-ready para Vercel

Não use nenhuma outra biblioteca de UI além do shadcn/ui. Não use Redux ou Zustand — estado local com useState é suficiente. Para fetch de dados, use as Server Actions do Next.js 14.

Contexto do sistema
Este painel conecta diretamente ao Supabase, que também é consultado pelo bot de WhatsApp (via n8n). Qualquer produto marcado como ativo = false é ignorado pelo bot. Qualquer pedido criado pelo bot aparece aqui em tempo real.
A dona da papelaria acessa o painel pelo celular ou computador para:

Cadastrar e atualizar produtos e preços
Ver os pedidos que chegaram pelo WhatsApp
Atualizar o status dos pedidos manualmente


Schema completo do Supabase
Crie e forneça este SQL exato para rodar no Supabase SQL Editor:
sql-- Habilitar UUID
create extension if not exists "pgcrypto";

-- Tabela de produtos
create table produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  categoria text not null,
  preco numeric(10,2) not null check (preco >= 0),
  estoque int not null default 0 check (estoque >= 0),
  unidade text not null default 'unidade', -- ex: unidade, folha, pacote, caixa
  ativo boolean not null default true,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Tabela de pedidos
create table pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_nome text,
  cliente_telefone text not null,
  itens jsonb not null,
  -- Formato dos itens:
  -- [{ "produto_id": "uuid", "nome": "Caderno", "qtd": 2, "preco_unit": 12.50, "subtotal": 25.00 }]
  valor_total numeric(10,2) not null,
  status text not null default 'pendente'
    check (status in ('pendente', 'pago', 'cancelado', 'em_separacao', 'entregue')),
  link_pagamento text,
  observacao text,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Trigger para atualizar atualizado_em automaticamente
create or replace function update_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

create trigger produtos_atualizado_em
  before update on produtos
  for each row execute function update_atualizado_em();

create trigger pedidos_atualizado_em
  before update on pedidos
  for each row execute function update_atualizado_em();

-- Row Level Security
alter table produtos enable row level security;
alter table pedidos enable row level security;

-- Política: só usuários autenticados leem e escrevem
create policy "Autenticados podem tudo em produtos"
  on produtos for all
  to authenticated
  using (true) with check (true);

create policy "Autenticados podem tudo em pedidos"
  on pedidos for all
  to authenticated
  using (true) with check (true);

-- Política separada para o bot (anon) poder LER produtos ativos
create policy "Bot pode ler produtos ativos"
  on produtos for select
  to anon
  using (ativo = true);

-- Política para o bot (anon) poder INSERIR pedidos
create policy "Bot pode inserir pedidos"
  on pedidos for insert
  to anon
  with check (true);

-- Dados de exemplo para testar
insert into produtos (nome, descricao, categoria, preco, estoque, unidade) values
('Caderno universitário 96 folhas', 'Caderno espiral capa dura', 'Cadernos', 12.50, 30, 'unidade'),
('Caneta BIC azul', 'Caneta esferográfica ponta média', 'Canetas', 2.00, 100, 'unidade'),
('Canetinha 12 cores', 'Estojo com 12 canetinhas coloridas', 'Canetas', 8.90, 15, 'unidade'),
('Folha A4 avulsa', 'Papel sulfite A4 75g', 'Papéis', 0.25, 500, 'folha'),
('Pacote A4 500 folhas', 'Resma papel A4 75g 500 folhas', 'Papéis', 22.00, 20, 'pacote'),
('Borracha branca', 'Borracha macia para lápis', 'Material escolar', 1.50, 80, 'unidade'),
('Lápis HB', 'Lápis grafite HB número 2', 'Material escolar', 1.00, 120, 'unidade'),
('Régua 30cm', 'Régua plástica transparente', 'Material escolar', 3.50, 40, 'unidade');

Estrutura de pastas
Gere exatamente esta estrutura:
/app
  /login
    page.tsx
  /dashboard
    page.tsx         ← Server Component com dados reais
  /produtos
    page.tsx         ← listagem
    /novo
      page.tsx       ← formulário de criação
    /[id]
      page.tsx       ← formulário de edição
  /pedidos
    page.tsx         ← listagem com filtros
    /[id]
      page.tsx       ← detalhe do pedido
  layout.tsx         ← layout raiz
  globals.css

/components
  /ui                ← gerado pelo shadcn (não edite)
  sidebar.tsx        ← navegação lateral
  header.tsx         ← header com nome da página e botão de logout
  produto-form.tsx   ← formulário reutilizável para criar e editar
  pedido-status-badge.tsx ← badge colorido por status
  stats-card.tsx     ← card de métrica do dashboard
  estoque-alerta.tsx ← banner de alerta de estoque baixo

/lib
  supabase-server.ts ← cliente Supabase para Server Components e Actions
  supabase-client.ts ← cliente Supabase para Client Components
  utils.ts           ← formatBRL, formatDate, cn()

/actions
  produtos.ts        ← Server Actions de CRUD de produtos
  pedidos.ts         ← Server Actions de atualização de pedidos

middleware.ts        ← proteção de rotas autenticadas
.env.example

Detalhamento de cada página
/login

Formulário centralizado na tela com logo "Papelaria — Painel Admin"
Campos: email, senha
Botão "Entrar" com loading state enquanto autentica
Erro claro se credenciais erradas: "Email ou senha incorretos"
Após login bem-sucedido, redireciona para /dashboard
Se já autenticado, redireciona direto para /dashboard
Sem link de cadastro — o admin é criado manualmente no Supabase

/dashboard
Métricas do dia (calcule com queries no Supabase, não no front):

Pedidos hoje — count de pedidos com criado_em = hoje
Faturamento hoje — soma de valor_total dos pedidos com status pago de hoje
Pedidos pendentes — count de pedidos com status pendente
Produtos ativos — count de produtos com ativo = true

Seções abaixo das métricas:

Alerta de estoque baixo — lista de produtos com estoque < 5, mostrando nome, categoria e estoque atual. Se não houver, não exibe a seção.
Últimos 10 pedidos — tabela com: data/hora, telefone do cliente, total, status (badge colorido). Clicar na linha vai para /pedidos/[id].

Atualiza os dados a cada 30 segundos usando revalidatePath ou router.refresh() num useEffect.
/produtos
Tabela completa com todas as colunas:
NomeCategoriaPreçoEstoqueUnidadeAtivoAções

Busca por nome em tempo real (filtra client-side)
Filtro por categoria (select com as categorias existentes, gerado dinamicamente)
Filtro por status: Todos / Ativos / Inativos
Ordenação por nome ou preço (clique no cabeçalho da coluna)
Badge verde para Ativo, cinza para Inativo
Botão "Novo produto" no canto superior direito → vai para /produtos/novo
Ações por linha: botão Editar (→ /produtos/[id]) e botão Excluir

Excluir abre um AlertDialog do shadcn pedindo confirmação: "Tem certeza? Esta ação não pode ser desfeita."
Ao excluir, o produto some da listagem imediatamente (optimistic update)



/produtos/novo e /produtos/[id]
Formulário com os campos:
Nome *                → input text, obrigatório, max 100 chars
Descrição             → textarea, opcional, max 500 chars
Categoria *           → input text com datalist das categorias existentes
Preço (R$) *          → input number, min 0, step 0.01, formato BRL no blur
Estoque *             → input number, min 0, inteiro
Unidade *             → select: unidade / folha / pacote / caixa / rolo / metro
Ativo                 → toggle switch (shadcn Switch)
Validação client-side antes de submeter:

Nome obrigatório
Preço deve ser maior que zero
Estoque não pode ser negativo

Ao salvar:

Chama Server Action
Mostra toast de sucesso ou erro
Redireciona para /produtos após sucesso

Na página de edição (/produtos/[id]):

Carrega os dados atuais do produto via params.id
Preenche o formulário com os valores existentes
Botão "Salvar alterações" e botão "Cancelar" (volta para /produtos)
Mostra a data de criação e última atualização no rodapé do formulário

/pedidos
Tabela com colunas:
| Data/hora | Cliente | Telefone | Itens (resumo) | Total | Status | Ações |

Filtro por status (tabs ou select): Todos / Pendente / Pago / Em separação / Entregue / Cancelado
Filtro por data: Hoje / Últimos 7 dias / Últimos 30 dias / Todos
Busca por telefone do cliente
Paginação: 20 pedidos por página
Clicar na linha abre /pedidos/[id]
Badge de status com cores:

pendente → amarelo
pago → verde
em_separacao → azul
entregue → verde escuro
cancelado → vermelho



/pedidos/[id]
Detalhe completo do pedido:

Cabeçalho: número do pedido (primeiros 8 chars do UUID), data/hora, status atual
Dados do cliente: nome (se disponível) e telefone
Tabela de itens do pedido (parsear o campo itens JSONB):

Nome do produto
Quantidade
Preço unitário
Subtotal


Rodapé da tabela com o valor total
Link de pagamento (se existir): botão "Abrir link" que abre em nova aba
Observação do bot (se existir)
Select para atualizar o status — ao mudar, chama Server Action imediatamente sem necessidade de botão "Salvar"
Botão "Voltar para pedidos"


Componentes compartilhados
sidebar.tsx

Logo da papelaria no topo (texto simples, personalizável)
Links de navegação com ícone e label:

Dashboard (ícone: LayoutDashboard)
Produtos (ícone: Package)
Pedidos (ícone: ShoppingCart)


Link ativo destacado visualmente
No mobile: sidebar escondida, abre via hamburguer no header

header.tsx

Nome da página atual à esquerda
Email do usuário logado + botão "Sair" à direita
No mobile: ícone de hamburguer para abrir sidebar


Server Actions
/actions/produtos.ts
typescript// Implemente estas funções como Server Actions ('use server')
criarProduto(formData: FormData): Promise<{ sucesso: boolean; erro?: string }>
atualizarProduto(id: string, formData: FormData): Promise<{ sucesso: boolean; erro?: string }>
excluirProduto(id: string): Promise<{ sucesso: boolean; erro?: string }>
toggleAtivo(id: string, ativo: boolean): Promise<{ sucesso: boolean }>
/actions/pedidos.ts
typescriptatualizarStatus(id: string, status: string): Promise<{ sucesso: boolean; erro?: string }>

Autenticação e proteção de rotas
middleware.ts deve:

Verificar sessão do Supabase em cada request
Qualquer rota exceto /login redireciona para /login se não autenticado
Se autenticado e acessar /login, redireciona para /dashboard

Use o helper createMiddlewareClient do @supabase/auth-helpers-nextjs.

Variáveis de ambiente
Gere o .env.example:
envNEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

UX e detalhes de qualidade

Todo botão de ação destrutiva (excluir, cancelar pedido) pede confirmação via AlertDialog
Todo submit de formulário desabilita o botão e mostra spinner enquanto aguarda
Toasts de feedback em todas as ações (sucesso em verde, erro em vermelho) usando sonner ou o toast do shadcn
Campos de preço sempre exibem no formato R$ 12,50
Datas sempre no formato DD/MM/YYYY HH:mm
Tabelas com muitos dados mostram skeleton loading enquanto carregam
Se uma tabela estiver vazia, mostre um estado vazio com mensagem e ícone, não apenas vazio
Responsivo: funciona bem em tela de 375px (iPhone SE) e 1440px (desktop)


Instruções de deploy
Ao final, forneça o passo a passo completo:

Criar projeto no Supabase e rodar o SQL do schema
Criar o usuário admin via Supabase Authentication (email/senha)
Instalar dependências (npm install)
Configurar .env.local com as variáveis
Rodar localmente com npm run dev
Deploy no Vercel: conectar repositório, adicionar as variáveis de ambiente, deploy automático


Entregue o projeto inteiro de uma vez, arquivo por arquivo, pronto para rodar. Não resuma nem omita código. Cada arquivo deve estar completo e funcional