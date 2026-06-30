# 🚀 Documentação de Deploy - MM System

## ✅ Sistema em Produção

O MM System foi implantado com sucesso em **modo produção** e está totalmente funcional!

---

## 🌐 URLs de Acesso

### URL Principal (Frontend)
**https://f902bb962.na112.preview.abacusai.app**

Esta URL dá acesso à interface web completa do sistema.

### URL da API (Backend)
**https://f902bb962-4000.na112.preview.abacusai.app/api/v1**

Endpoint para integrações e consumo de API.

### Health Check
**https://f902bb962-4000.na112.preview.abacusai.app/health**

---

## 👥 Credenciais de Acesso

Todos os usuários compartilham a senha: **`senha123`**

| E-mail | Papel | Permissões |
|--------|-------|------------|
| `admin@acme.com` | Administrador | Acesso total ao sistema |
| `gestor@acme.com` | Gestor | Gerenciar projetos e equipes |
| `engenheiro@acme.com` | Engenheiro | Criar/editar materiais e documentos |
| `usuario@acme.com` | Usuário | Criar projetos e documentos |
| `cliente@externa.com` | Cliente | Visualizar apenas seus projetos |

---

## 📦 Arquitetura Implantada

### Serviços Rodando

1. **PostgreSQL 17** (porta 5432)
   - Banco de dados: `mm_system`
   - Usuário: `mm_user`
   - Com dados de seed populados

2. **Backend Node.js** (porta 4000)
   - Express + TypeScript
   - API REST completa
   - Autenticação JWT
   - RBAC (Role-Based Access Control)

3. **Frontend React** (porta 3000)
   - React 18 + Vite + TypeScript
   - Tailwind CSS
   - i18n (PT/EN/ES)
   - Tema dark/light

### Tecnologias

- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Banco**: PostgreSQL 17
- **Autenticação**: JWT
- **Deploy**: Servidor estático (serve) + Node.js

---

## 🎯 Funcionalidades Implementadas

### ✅ Navegação por Projetos
- Documentos agora são organizados **dentro de cada projeto**
- Botão "📁 Documentos" em cada projeto leva ao workspace

### ✅ Workspace de Documentos do Projeto
Com 4 abas principais:

1. **Lista de Materiais**
   - Criar e gerenciar listas de materiais do projeto
   
2. **Lista Estimativa**
   - Documentos de estimativas de custos

3. **Lista de Cabos**
   - Especificações de cabeamento

4. **Relatório de Balanço**
   - Comparação entre Listas de Materiais vs Estimativas
   - Análise de spreads e diferenças

### ✅ Visual Atualizado
- Header com "SYSTEM" em azul industrial (#00b4d8)
- Layout seguindo arquivos de referência HTML
- Tema escuro consistente

### ✅ Controle de Acesso
- Clientes veem apenas documentos de seus projetos
- Outras roles têm acesso baseado em permissões

---

## 🛠️ Scripts de Controle

### Iniciar Sistema
```bash
/home/ubuntu/mm_system/start.sh
```

Inicia todos os serviços (PostgreSQL, Backend, Frontend).

### Parar Sistema
```bash
/home/ubuntu/mm_system/stop.sh
```

Para todos os serviços em execução.

### Ver Logs

**Backend:**
```bash
tail -f /home/ubuntu/backend.log
```

**Frontend:**
```bash
tail -f /home/ubuntu/frontend.log
```

### Verificar Processos
```bash
lsof -i :4000 -i :3000
```

---

## 📂 Estrutura de Diretórios

```
/home/ubuntu/mm_system/
├── backend/              # API Node.js + Express
│   ├── src/             # Código TypeScript
│   ├── dist/            # Código compilado (produção)
│   ├── prisma/          # Schema e migrations
│   └── .env             # Variáveis de ambiente
├── frontend/            # Aplicação React
│   ├── src/             # Código fonte
│   ├── dist/            # Build de produção
│   ├── .env             # Desenvolvimento
│   └── .env.production  # Produção
├── start.sh             # Script de inicialização
├── stop.sh              # Script de parada
└── DEPLOY.md            # Esta documentação
```

---

## 🔄 Manutenção e Rebuild

### Rebuild do Backend
```bash
cd /home/ubuntu/mm_system/backend
npm run build
```

### Rebuild do Frontend
```bash
cd /home/ubuntu/mm_system/frontend
npm run build
```

### Aplicar Migrations do Banco
```bash
cd /home/ubuntu/mm_system/backend
npx prisma migrate deploy
```

### Popular Banco com Dados de Teste
```bash
cd /home/ubuntu/mm_system/backend
npx tsx prisma/seed-simple.ts
```

---

## 📊 Banco de Dados

### Conexão
```
postgresql://mm_user:mm_pass123@localhost:5432/mm_system
```

### Acessar via psql
```bash
psql -U mm_user -d mm_system
```

### Status do PostgreSQL
```bash
sudo service postgresql status
```

---

## 🔐 Segurança

### Variáveis Sensíveis
Todas as credenciais estão em arquivos `.env` que **não são versionados no Git**.

- `JWT_SECRET`: Chave para assinatura de tokens
- `DATABASE_URL`: String de conexão do banco

### CORS
Configurado para aceitar requisições do frontend em produção.

---

## 🚨 Troubleshooting

### Sistema não inicia
```bash
# Verificar se PostgreSQL está rodando
sudo service postgresql status

# Verificar portas ocupadas
lsof -i :4000 -i :3000

# Ver logs de erro
tail -50 /home/ubuntu/backend.log
tail -50 /home/ubuntu/frontend.log
```

### Erro de conexão com banco
```bash
# Reiniciar PostgreSQL
sudo service postgresql restart

# Verificar se o banco existe
sudo -u postgres psql -c "\l" | grep mm_system
```

### Frontend não carrega
```bash
# Verificar build
ls -lh /home/ubuntu/mm_system/frontend/dist/

# Rebuild
cd /home/ubuntu/mm_system/frontend
npm run build

# Reiniciar serviço
/home/ubuntu/mm_system/stop.sh && /home/ubuntu/mm_system/start.sh
```

---

## 📝 Notas Importantes

⚠️ **Localhost do Abacus AI Agent VM**  
As URLs `localhost:3000` e `localhost:4000` referem-se ao computador virtual do Abacus AI Agent, **não ao seu computador local**.

🌐 **URLs de Preview**  
As URLs `https://f902bb962*.na112.preview.abacusai.app` são públicas e acessíveis pela internet enquanto a VM estiver ativa.

⏱️ **Lifecycle da VM**  
A VM desliga automaticamente após período de inatividade. Os serviços precisarão ser reiniciados com `/home/ubuntu/mm_system/start.sh`.

📦 **Download dos Arquivos**  
Para rodar localmente na sua máquina, baixe todos os arquivos usando o botão "Files" no canto superior direito da interface do Abacus AI.

---

## ✅ Próximos Ajustes

Agora que o deploy está funcional, podemos:

1. **Refinamentos Visuais** - Ajustes pixel-perfect vs arquivos HTML
2. **Funcionalidades Extras** - Exportar PDFs, filtros avançados, etc.
3. **Performance** - Otimizações e caching
4. **Deploy Externo** - Configurar em servidor próprio (AWS, DigitalOcean, etc.)

---

**Deploy realizado em**: 29 de junho de 2026  
**Versão**: Fase 1 MVP  
**Status**: ✅ Produção - Totalmente Funcional
