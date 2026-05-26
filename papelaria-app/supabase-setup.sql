-- ============================================
-- PAPELARIA ARAPOANGA — SCHEMA DO SUPABASE
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Habilitar UUID
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
