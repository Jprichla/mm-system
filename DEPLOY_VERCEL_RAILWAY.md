# Deploy permanente (Vercel + Railway)

Este guia deixa o MM System com URL pública permanente (sem depender da VM temporária).

## 1) Backend no Railway

### 1.1 Subir código no GitHub
1. Crie um repositório no GitHub (ou use um existente).
2. Faça push da pasta `mm_system`.

### 1.2 Criar projeto Railway (backend)
1. Acesse Railway e clique em **New Project**.
2. Escolha **Deploy from GitHub repo**.
3. Selecione o repositório e o diretório `backend`.
4. O Railway usará automaticamente o arquivo `backend/railway.json`.

### 1.3 Configurar variáveis de ambiente no Railway
Defina:
- `DATABASE_URL` = string PostgreSQL gerada no Railway
- `JWT_SECRET` = chave forte (mín. 32 caracteres)
- `JWT_EXPIRES_IN` = `15m`
- `NODE_ENV` = `production`
- `PORT` = `4000` (opcional, Railway já injeta automaticamente)

### 1.4 Banco PostgreSQL no Railway
1. No mesmo projeto, adicione serviço **PostgreSQL**.
2. Copie a `DATABASE_URL` do plugin PostgreSQL para o serviço backend.
3. Faça um novo deploy (ou redeploy) para executar migrations automaticamente.

### 1.5 Teste backend
- URL health: `https://SEU_BACKEND.up.railway.app/health`
- Deve retornar status `ok`.

---

## 2) Frontend no Vercel

### 2.1 Importar projeto
1. Acesse Vercel e clique em **Add New Project**.
2. Importe o mesmo repositório GitHub.
3. Em **Root Directory**, escolha `frontend`.
4. O Vercel utilizará o arquivo `frontend/vercel.json`.

### 2.2 Variável de ambiente do frontend
No projeto da Vercel, configure:
- `VITE_API_BASE_URL` = `https://SEU_BACKEND.up.railway.app/api/v1`

### 2.3 Deploy
1. Clique em **Deploy**.
2. Após concluir, acesse a URL gerada pela Vercel.

---

## 3) Domínio customizado

### Opção A: domínio da Vercel
- Use `nome-do-projeto.vercel.app` (automático).

### Opção B: domínio próprio
1. Em Vercel: **Settings > Domains**.
2. Adicione seu domínio.
3. Configure os registros DNS solicitados.

---

## 4) Checklist de produção

- [ ] Login funcionando
- [ ] CRUD de projetos funcionando
- [ ] Workspace de documentos por projeto funcionando
- [ ] Relatório de balanço funcionando
- [ ] Tela admin de gestão de acessos funcionando
- [ ] Atualização de perfil de usuário (admin) funcionando

---

## 5) Arquivos de suporte já criados no projeto

- `frontend/vercel.json`
- `backend/railway.json`
- `frontend/.env.example` (com exemplo de URL de API em produção)

---

## Observação

Se quiser, no próximo passo eu posso te guiar **clicando tela a tela** no processo (Railway e Vercel) até ficar com URL final pública e estável.
