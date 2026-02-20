# 💰 Controle Financeiro

Aplicação web para gerenciamento de gastos, entradas e metas
financeiras.

Projeto desenvolvido com **Next.js + Prisma + PostgreSQL**, com
arquitetura pronta para Docker e PWA.

------------------------------------------------------------------------

## 🚀 Funcionalidades

-   ✅ Cadastro de entradas e despesas
-   ✅ Categorias personalizadas
-   ✅ Dashboard com resumo financeiro
-   ✅ Metas financeiras com progresso
-   ✅ Reservas para metas
-   ✅ Modal de confirmação
-   ✅ Toast de feedback
-   ✅ Design moderno estilo super app
-   ✅ PWA instalável
-   ✅ Docker ready

------------------------------------------------------------------------

## 🧱 Tecnologias Utilizadas

-   **Next.js (App Router)**
-   **TypeScript**
-   **Prisma ORM**
-   **PostgreSQL**
-   **TailwindCSS**
-   **Lucide Icons**
-   **Docker**
-   **PWA (Manifest + Installable)**

------------------------------------------------------------------------

## 📦 Estrutura do Projeto

    src/
      app/
      components/
        ui/
    prisma/
    public/
    Dockerfile
    docker-compose.yml

------------------------------------------------------------------------

## ⚙️ Configuração Local

### 1️⃣ Instalar dependências

``` bash
npm install
```

### 2️⃣ Configurar banco

Crie um arquivo `.env`:

    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/financeiro"

### 3️⃣ Rodar migrations

``` bash
npx prisma migrate dev
```

### 4️⃣ Iniciar projeto

``` bash
npm run dev
```

Acesse:

    http://localhost:3000

------------------------------------------------------------------------

## 🐳 Rodando com Docker

### Subir containers

``` bash
docker-compose up --build
```

Acesse:

    http://localhost:3000

### Parar containers

``` bash
docker-compose down
```

------------------------------------------------------------------------

## 📱 PWA (Instalável)

O projeto possui:

-   `manifest.json`
-   Ícones 192x192 e 512x512
-   Theme color configurado

Para instalar:

-   Abra no Chrome
-   Clique em "Instalar app"
-   Ou "Adicionar à tela inicial"

------------------------------------------------------------------------

## 🔐 Variáveis de Ambiente

  Variável       Descrição
  -------------- ------------------------
  DATABASE_URL   Conexão com PostgreSQL

------------------------------------------------------------------------

## 📌 Próximas Evoluções

-   🔄 Controle por mês
-   📊 Relatórios avançados
-   🌙 Dark mode
-   📈 Gráficos mais detalhados
-   🔐 Autenticação multiusuário
-   ☁️ Deploy cloud

------------------------------------------------------------------------

## 👨‍💻 Autor

Projeto desenvolvido como sistema pessoal de controle financeiro e
evolução técnica em arquitetura fullstack moderna.

------------------------------------------------------------------------

## 📄 Licença

Uso pessoal.
