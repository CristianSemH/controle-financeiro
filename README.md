# 💰 Controle Financeiro

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)
![Docker](https://img.shields.io/badge/Docker-Container-2496ED)
![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8)
![Status](https://img.shields.io/badge/Status-Online-success)

Aplicação web moderna para **gestão de finanças pessoais**, permitindo
controle de gastos, entradas e metas financeiras com experiência estilo
super app.

Projeto desenvolvido com foco em:

-   Arquitetura escalável
-   Boas práticas fullstack
-   Experiência mobile-first
-   Preparação para produção com Docker

------------------------------------------------------------------------

# 🌐 Deploy em Produção

A aplicação está publicada e acessível via domínio próprio:

🔗 **https://financeiro.cristiansemh.com.br**

## Infraestrutura

-   🐧 VM Linux
-   🐳 Docker + Docker Compose
-   🔐 Cloudflare Tunnel
-   🌍 Domínio personalizado
-   🛡 SSL automático via Cloudflare

Arquitetura preparada para migração futura para VPS ou ambiente cloud
sem necessidade de alterações estruturais.

------------------------------------------------------------------------

# 🚀 Funcionalidades

## 📊 Gestão Financeira

-   ✅ Cadastro de entradas e despesas
-   ✅ Categorias personalizadas
-   ✅ Dashboard com resumo financeiro
-   ✅ Controle de saldo atualizado
-   ✅ Organização simples e intuitiva

## 🎯 Metas e Planejamento

-   ✅ Criação de metas financeiras
-   ✅ Reserva de valores para metas
-   ✅ Barra de progresso automática

## 🎨 Experiência do Usuário

-   ✅ Interface moderna
-   ✅ Modal de confirmação
-   ✅ Toasts de feedback
-   ✅ Layout responsivo
-   ✅ PWA instalável

------------------------------------------------------------------------

# 🧠 Arquitetura

-   **Frontend:** Next.js (App Router)
-   **Backend:** API Routes do Next.js
-   **Banco de Dados:** PostgreSQL
-   **ORM:** Prisma
-   **Estilização:** TailwindCSS
-   **Ícones:** Lucide
-   **Containerização:** Docker
-   **Tunnel:** Cloudflare
-   **PWA:** Manifest + Installable

------------------------------------------------------------------------

# 📂 Estrutura do Projeto

    src/
      app/
      components/
        ui/
      lib/
    prisma/
    public/
    Dockerfile
    docker-compose.yml

------------------------------------------------------------------------

# ⚙️ Configuração Local

## 1️⃣ Instalar dependências

``` bash
npm install
```

## 2️⃣ Configurar banco

Crie um arquivo `.env`:

``` env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/financeiro"
```

## 3️⃣ Rodar migrations

``` bash
npx prisma migrate dev
```

## 4️⃣ Iniciar projeto

``` bash
npm run dev
```

Acesse:

http://localhost:3000

------------------------------------------------------------------------

# 🐳 Executando com Docker

## Subir containers

``` bash
docker-compose up --build
```

## Parar containers

``` bash
docker-compose down
```

------------------------------------------------------------------------

# 🔐 Variáveis de Ambiente

  Variável       Descrição
  -------------- ------------------------
  DATABASE_URL   Conexão com PostgreSQL

------------------------------------------------------------------------

# 📈 Próximas Evoluções

-   🔄 Controle por mês
-   📊 Relatórios avançados
-   📈 Gráficos detalhados
-   🌙 Dark Mode
-   🔐 Autenticação multiusuário
-   ☁️ Deploy cloud estruturado
-   📤 Exportação CSV / PDF

------------------------------------------------------------------------

# 👨‍💻 Autor

Desenvolvido por **Cris**\
Programador Fullstack

------------------------------------------------------------------------

# 📄 Licença

Uso pessoal e educacional.
