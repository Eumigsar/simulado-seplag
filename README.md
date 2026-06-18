# Simulado SEPLAG-RJ · FGV 2026

Página web de questões de concurso (banco fixo), pronta para o **GitHub Pages**.
Funciona no navegador, no computador ou no celular, **sem login e sem chave de API**.


## Status do banco — COMPLETO

**314 questões** nas 14 matérias do edital:

| Matéria | Questões |
|---|---|
| Língua Portuguesa | 20 |
| Raciocínio Lógico-Quantitativo | 20 |
| Direito Administrativo | 19 |
| Direito Constitucional | 20 |
| Administração e Governança Pública | 20 |
| Finanças Públicas / AFO | 20 |
| Políticas Públicas | 20 |
| Economia | 20 |
| Ciência Política | 20 |
| Realidade Brasileira e do RJ | 20 |
| Gestão de Pessoas | 20 |
| Tecnologia da Informação | 19 |
| Ética e Legislação | 20 |
| Estatuto dos Servidores / Regime Jurídico | 19 |

Mix de dificuldade: **69 fáceis · 138 médias · 70 difíceis**. 163 marcadas como "alta incidência" (🔥).

Todos os gabaritos foram revisados (conferência de correção factual, lógica das questões "exceto/incorreto" e recálculo independente das questões numéricas). 82 comentários trazem nota explícita sobre **como o tema costuma ser cobrado pela FGV**.

---

## Login e progresso na nuvem (Supabase)

Esta versão tem **login por e-mail e senha** via Supabase. O progresso (histórico
e revisão) é salvo na nuvem e sincroniza entre celular, notebook e qualquer
dispositivo. Há também a opção **"Continuar sem conta"**, que salva só no aparelho.

As chaves do Supabase já estão configuradas dentro do `index.html` (a chave usada
é a **anon public**, que é segura para ficar no código — a proteção real vem das
políticas de segurança RLS criadas no banco). Configuração detalhada em
`SUPABASE-passo-a-passo.md`.



### Questões estilo FGV (novo)
Há **37 questões no formato real da banca FGV**: enunciados longos com contexto, formato "analise as afirmativas I, II, III", "à exceção de uma, assinale-a" e casos concretos pedindo aplicação. Elas aparecem marcadas com 📋 e podem ser filtradas no início (filtro **Estilo das questões → Só estilo FGV**). As 277 questões diretas continuam disponíveis para fixação rápida.



### Alternativas embaralhadas (anti-vício)
A ordem das alternativas é **sorteada a cada vez** que a questão aparece — assim a resposta certa nunca fica viciada numa mesma letra (ex.: sempre "B"). Os comentários descrevem a resposta pelo conteúdo, não pela letra.



### Identidade visual: "Cultivo & Hype" 💜
Tema original que mescla a estética da China clássica (tinta sumi-ê, jade, dourado, nós chineses, caracteres decorativos) com a energia carinhosa e roxa do fandom K-pop. Traz um **mascote original** — Yùtù, o coelho de jade — que dá mensagens de reforço positivo com humor, em três humores (feliz, neutro, encorajando). As frases motivacionais são originais. Nenhuma imagem, personagem, rosto ou letra de música protegidos por direitos autorais é utilizada — tudo é ilustração vetorial própria (SVG).

## O que tem

Dois modos de praticar:
- **📖 Modo Estudo** — sem tempo. Você confirma cada resposta e vê o gabarito comentado na hora. Para aprender e fixar.
- **⏱ Simulado de Prova** — cronometrado, no formato FGV. Sem gabarito durante a prova; você responde tudo, pode marcar questões para revisar (☆), navega livremente entre elas por uma grade, e só vê o resultado e o gabarito comentado ao entregar. O relógio encerra a prova sozinho quando o tempo acaba.

Formatos de simulado prontos (espelham a prova real da FGV):
- **Conhecimentos Gerais** — 40 questões / 4h30
- **Conhecimentos Específicos** — 60 questões / 4h00
- **Treino rápido** — 20 questões / 1h
- **Personalizado** — você escolhe quantidade e tempo

Mais:
- **Modo Revisão** — as questões que você erra ficam guardadas com o gabarito comentado
- **Desempenho** — gráfico por matéria e aproveitamento geral
- Filtros de matéria, dificuldade e foco no que mais cai (🔥) valem para os dois modos
- Progresso salvo no próprio navegador (localStorage)

## Arquivos
```
simulado-seplag/
├── index.html     ← a página (abre direto no navegador)
├── questoes.js    ← o banco de questões (edite aqui para adicionar/trocar)
└── README.md      ← este arquivo
```

---

## Como publicar no GitHub Pages (grátis)

1. Crie uma conta em **github.com** (se ainda não tiver).
2. Clique em **New repository**. Dê um nome, por exemplo `simulado-seplag`. Deixe **Public**. Clique em **Create repository**.
3. Na página do repositório, clique em **Add file → Upload files**.
4. Arraste os arquivos `index.html` e `questoes.js` (e o README, se quiser). Clique em **Commit changes**.
5. Vá em **Settings** (do repositório) → no menu lateral, **Pages**.
6. Em **Branch**, escolha `main` e a pasta `/ (root)`. Clique em **Save**.
7. Aguarde cerca de 1 minuto. A página ficará disponível em:
   ```
   https://SEU-USUARIO.github.io/simulado-seplag/
   ```
   É esse o link que você compartilha com a Aymara.

> Dica: qualquer alteração que você suba no `questoes.js` aparece no site em 1–2 minutos.

---

## Como adicionar mais questões

Abra o `questoes.js`. Copie um bloco de questão e cole no final, antes do `]`:

```js
{
  mat: "dadmin",          // id da matéria (ver lista abaixo)
  dif: "Médio",           // "Fácil" | "Médio" | "Difícil"
  hot: true,              // true = tema que mais cai; false = comum
  q:  "Enunciado da questão...",
  alt: ["alternativa A","B","C","D","E"],
  cor: 2,                 // índice da correta: 0=A, 1=B, 2=C, 3=D, 4=E
  com: "Comentário/gabarito explicando a resposta."
},
```

### IDs das matérias
`port` Língua Portuguesa · `racioc` Raciocínio Lógico · `dadmin` Direito Administrativo ·
`dconst` Direito Constitucional · `admgov` Administração e Gov. Pública ·
`finpub` Finanças Públicas/AFO · `polpub` Políticas Públicas · `econ` Economia ·
`ciepol` Ciência Política · `realrj` Realidade Brasileira e do RJ ·
`tic` Tecnologia da Informação · `gestpess` Gestão de Pessoas ·
`etica` Ética e Legislação · `legserv` Estatuto dos Servidores RJ

Só aparecem no menu as matérias que já têm pelo menos uma questão cadastrada.

---

*陈情令 · The Untamed · 修道 — estude com disciplina de cultivador.*
