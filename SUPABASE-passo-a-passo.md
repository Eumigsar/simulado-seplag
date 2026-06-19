# Passo a passo — Login e progresso na nuvem com Supabase

Este guia configura o **Supabase** para que o Simulado SEPLAG-RJ tenha login
(e-mail + senha) e salve o progresso na nuvem, sincronizando entre celular,
notebook e qualquer dispositivo. É **gratuito** para o uso de uma pessoa ou de
um grupo pequeno de estudo.

> Você NÃO vai programar. Vai criar uma conta, clicar em algumas opções e
> copiar/colar dois trechos. Reserve uns 15–20 minutos e faça com calma.

Ao final, você terá em mãos **duas informações** (a URL do projeto e a chave
"anon public"). Guarde-as — é o que vou pedir para finalizar o código.

---

## Parte 1 — Criar a conta e o projeto

1. Acesse **https://supabase.com** e clique em **Start your project**.
2. Faça login com sua conta do **GitHub** (a mesma que você usou para o Pages) —
   é o jeito mais rápido. Autorize o acesso quando pedir.
3. Já dentro do painel, clique em **New project**.
4. Preencha:
   - **Organization**: pode usar a que aparece (seu usuário) ou criar uma; o nome
     não importa.
   - **Project name**: por exemplo `simulado-seplag`.
   - **Database Password**: clique em **Generate a password** e depois em
     **Copy** para guardá-la em algum lugar seguro. (Você provavelmente não vai
     precisar dela no dia a dia, mas não deixe de salvar.)
   - **Region**: escolha **South America (São Paulo)** — fica mais rápido no Brasil.
5. Clique em **Create new project**. Aguarde 1 a 2 minutos enquanto o Supabase
   prepara tudo (aparece "Setting up project...").

---

## Parte 2 — Ativar login por e-mail e senha (e simplificar o cadastro)

1. No menu lateral esquerdo, clique no ícone de **Authentication** (um cadeado /
   pessoa).
2. Dentro de Authentication, procure no submenu por **Sign In / Providers**
   (em algumas versões aparece como **Providers**).
3. Confira que **Email** está **habilitado** (Enabled). Em geral já vem ligado.
   Se houver um botão de ativar, ative.
4. Agora vamos tornar o cadastro instantâneo (sem precisar confirmar e-mail):
   - Ainda em Authentication, procure **Sign In / Providers → Email** e abra as
     opções desse provedor (ou vá em **Authentication → Settings**, conforme a
     versão do painel).
   - Localize a opção **Confirm email** (às vezes chamada "Enable email
     confirmations").
   - **DESLIGUE** essa opção (deixe o botão cinza/off) e clique em **Save**.
   - Com isso, quem digitar e-mail + senha entra na hora, sem ter que abrir o
     e-mail para clicar em link.

> Observação: desligar a confirmação é ótimo para um app de estudo entre
> conhecidos. Se um dia o app virar público para muita gente, o ideal é religar
> a confirmação para evitar cadastros falsos.

---

## Parte 3 — Criar a tabela que guarda o progresso

Aqui vamos criar o "lugar" no banco de dados onde o histórico e a revisão de
cada usuário ficam salvos. É só colar um trecho pronto.

1. No menu lateral esquerdo, clique em **SQL Editor** (ícone de "SQL" ou de um
   terminal).
2. Clique em **New query** (ou na folha em branco).
3. Apague qualquer coisa que estiver na caixa e **cole exatamente** o conteúdo
   abaixo:

```sql
-- Tabela de progresso, uma linha por usuário
create table if not exists public.progresso (
  user_id uuid primary key references auth.users(id) on delete cascade,
  historico jsonb default '{}'::jsonb,
  revisar   jsonb default '[]'::jsonb,
  atualizado_em timestamptz default now()
);

-- Liga a segurança por linha (cada um só vê o próprio progresso)
alter table public.progresso enable row level security;

-- Permite que o usuário leia o próprio registro
create policy "ler_proprio_progresso"
  on public.progresso for select
  using (auth.uid() = user_id);

-- Permite que o usuário crie o próprio registro
create policy "inserir_proprio_progresso"
  on public.progresso for insert
  with check (auth.uid() = user_id);

-- Permite que o usuário atualize o próprio registro
create policy "atualizar_proprio_progresso"
  on public.progresso for update
  using (auth.uid() = user_id);
```

4. Clique em **Run** (ou pressione Ctrl/Cmd + Enter).
5. Deve aparecer **Success. No rows returned** — significa que deu certo.
   Se aparecer erro em vermelho, confira se colou o trecho inteiro e rode de novo.

> O que isso faz, em linguagem simples: cria uma "ficha" de progresso por
> usuário e ativa uma trava de segurança para que cada pessoa só consiga ler e
> alterar a própria ficha — ninguém vê o progresso de ninguém.

---

## Parte 4 — Copiar as duas chaves (é isto que vou pedir)

1. No menu lateral, clique na engrenagem de **Project Settings** (lá embaixo).
2. Clique em **API** (ou **Data API**, conforme a versão).
3. Anote estas duas informações:
   - **Project URL** — algo como `https://abcdefghijklmnop.supabase.co`
   - **API Keys → anon public** — uma chave longa começando por `eyJ...`
     (é a chave PÚBLICA, pode ficar no código; **não** copie a "service_role").

> ⚠️ Importante: copie a chave **anon public**, NUNCA a **service_role**. A anon
> é feita para ficar no navegador; a service_role é secreta e daria acesso total
> ao banco. Para este projeto, só usamos a **anon public**.

---

## Parte 5 — Me enviar as chaves

Volte aqui na conversa e cole as duas informações neste formato:

```
URL: https://...supabase.co
ANON: eyJ...
```

Com isso, eu finalizo o `index.html` com:
- tela de login/cadastro por e-mail e senha;
- salvamento do progresso na nuvem a cada simulado;
- sincronização automática entre todos os dispositivos da pessoa;
- e um modo "continuar sem conta" para quem só quiser testar rápido.

Depois é só subir o `index.html` atualizado no GitHub, como você já fez antes.

---

## Dúvidas comuns

**Isso tem algum custo?** Não para este uso. O plano gratuito do Supabase cobre
com folga o progresso de uma pessoa ou de um grupo de estudo. Há limites
generosos de usuários e de banco de dados no plano free.

**As questões mudam?** Não. O `questoes.js` continua igual; o login só guarda o
progresso (acertos, erros, revisão). O banco de questões segue público no
GitHub.

**E se eu não quiser mais o login depois?** É só voltar a usar a versão sem
Supabase. Os dois formatos coexistem; nada se perde.

**Esqueci a senha do banco (Database Password).** Tranquilo — ela não é usada no
dia a dia do app. Dá para redefinir em Project Settings se um dia precisar.
