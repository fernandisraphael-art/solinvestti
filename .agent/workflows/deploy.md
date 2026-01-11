---
description: Como fazer o deploy da Solinvestti na Vercel
---

# Guia de Deploy na Vercel

Siga estes passos para colocar sua aplicação online:

### 1. Preparar o Repositório
Certifique-se de que todas as alterações (incluindo o `vercel.json`) foram commitadas e enviadas para o seu GitHub.

### 2. Importar Projeto na Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Clique em **"Add New..."** > **"Project"**.
3. Importe o repositório `solinvestti`.

### 3. Configurar Framework Preset
A Vercel deve detectar automaticamente o **Vite**. Se não, selecione **Vite** no menu "Framework Preset".

### 4. Configurar Variáveis de Ambiente (CRÍTICO)
Antes de clicar em Deploy, expanda a seção **"Environment Variables"** e adicione as seguintes chaves com os valores do seu arquivo `.env.local`:

- `VITE_SUPABASE_URL`: (Sua URL do Supabase)
- `VITE_SUPABASE_ANON_KEY`: (Sua Anon Key)
- `GEMINI_API_KEY`: (Sua chave da API Gemini)

### 5. Configurações de Build
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 6. Executar Deploy
Clique em **"Deploy"**. A Vercel irá compilar o projeto e fornecer uma URL pública (ex: `solinvestti.vercel.app`).

### 7. Testar Rotas
Navegue pelas páginas e atualize o navegador (F5). O arquivo `vercel.json` que criamos garantirá que você não receba erro 404.
