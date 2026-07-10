# MM System — Fase 1 (MVP)

Implementação inicial do MM System conforme ADR aprovado, com backend em **Node.js + Express + TypeScript + Prisma + PostgreSQL** e frontend em **React 18 + Vite + Tailwind CSS + TypeScript**.

## Visão geral da Fase 1

### Backend
- Autenticação JWT (`/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/me`)
- RBAC com perfis: `admin`, `gestor`, `engenheiro`, `usuario`, `cliente`
- CRUD de:
  - Categorias
  - Materiais (com i18n em colunas PT/EN/ES)
  - Variantes de materiais (filhos)
  - Projetos (com filtragem por role)
  - Documentos
- Administração de usuários (somente `admin`):
  - Listagem paginada de usuários
  - Atualização de nível de acesso (`role`)
  - Regras de segurança para não remover o último admin
- Auditoria automática de operações mutáveis (`POST/PUT/PATCH/DELETE`) em `audit_logs`
- Soft delete em entidades críticas
- Validação não bloqueante de códigos:
  - Material Pai: padrão esperado `XX.XX`
  - Variante: padrão esperado `XX.XXNN.XX`

### Frontend
- Login com seleção de idioma
- Header com:
  - Alternância de tema claro/escuro
  - Alternância de idioma PT/EN/ES
  - Usuário logado + logout
- Rotas protegidas
- Home/Hub de navegação
- CRUD de Materiais com:
  - Formulário com abas de idioma (PT/EN/ES)
  - Lista com busca e paginação
  - Gestão de variantes em modal
- CRUD de Projetos com lista, formulário e paginação
- Área exclusiva de administrador para gestão de níveis de acesso dos usuários
- Componentes reutilizáveis: Header, Sidebar, Tabela Genérica, Modal, Toast

## Estrutura de pastas

```bash
/home/ubuntu/mm_system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── contexts/
    │   ├── services/
    │   ├── i18n/
    │   ├── styles/
    │   └── App.tsx
    ├── package.json
    └── vite.config.ts
```

## Pré-requisitos
- Node.js 20+
- npm 10+
- PostgreSQL 15+

## Configuração do backend

```bash
cd /home/ubuntu/mm_system/backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Backend disponível em: `http://localhost:4000`

## Configuração do frontend

```bash
cd /home/ubuntu/mm_system/frontend
cp .env.example .env
npm install
npm run dev
```

Frontend disponível em: `http://localhost:3000`

## Build de produção

```bash
cd /home/ubuntu/mm_system/backend && npm run build
cd /home/ubuntu/mm_system/frontend && npm run build
```

## Observações importantes
- O gestor cadastra manualmente os materiais nas 3 línguas (PT/EN/ES).
- A tradução automática é aplicada somente na interface (labels/textos), não nos dados de materiais.
- Todos os campos e mensagens do sistema foram organizados para suportar i18n desde o MVP.
 
