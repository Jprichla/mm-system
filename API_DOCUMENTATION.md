# 📘 Documentação da API REST — MM System

**Base URL**: `https://seu-backend.com/api/v1`

**Autenticação**: Bearer Token (JWT)

---

## Índice

1. [Autenticação](#autenticação)
2. [Usuários (Admin)](#usuários-admin)
3. [Categorias](#categorias)
4. [Materiais](#materiais)
5. [Variantes de Materiais](#variantes-de-materiais)
6. [Projetos](#projetos)
7. [Documentos](#documentos)
8. [Itens de Documento](#itens-de-documento)
9. [Detalhes Típicos](#detalhes-típicos)
10. [Componentes de Detalhes Típicos](#componentes-de-detalhes-típicos)
11. [Anexos](#anexos)
12. [Códigos de Status](#códigos-de-status)
13. [Níveis de Acesso (Roles)](#níveis-de-acesso-roles)

---

## Autenticação

### POST `/auth/login`
Autentica um usuário e retorna um token JWT.

**Request Body**:
```json
{
  "email": "admin@acme.com",
  "password": "senha123"
}
```

**Response** (200):
```json
{
  "mensagem": "Login realizado com sucesso.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@acme.com",
    "role": "admin",
    "companyId": "uuid"
  }
}
```

**Erros**:
- `401`: Credenciais inválidas

---

### POST `/auth/register`
Cria um novo usuário no sistema.

**Autenticação**: Não requerida

**Request Body**:
```json
{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "password": "senha123",
  "role": "usuario",
  "companyId": "uuid"
}
```

**Response** (201):
```json
{
  "mensagem": "Usuário cadastrado com sucesso.",
  "usuario": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "role": "usuario",
    "companyId": "uuid"
  }
}
```

**Erros**:
- `409`: E-mail já cadastrado

---

### GET `/auth/me`
Retorna os dados do usuário autenticado.

**Autenticação**: Requerida

**Response** (200):
```json
{
  "usuario": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@acme.com",
    "role": "admin",
    "companyId": "uuid",
    "createdAt": "2026-06-29T10:00:00Z"
  }
}
```

---

## Usuários (Admin)

### GET `/users`
Lista todos os usuários (somente admin).

**Autenticação**: Requerida (role: `admin`)

**Query Parameters**:
- `page` (number, default: 1)
- `pageSize` (number, default: 10)
- `search` (string): busca por nome ou e-mail

**Response** (200):
```json
{
  "dados": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "role": "usuario",
      "companyId": "uuid",
      "createdAt": "2026-06-29T10:00:00Z",
      "company": {
        "id": "uuid",
        "name": "Empresa XPTO"
      }
    }
  ],
  "paginacao": {
    "page": 1,
    "pageSize": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Erros**:
- `403`: Acesso negado (não é admin)

---

### PUT `/users/:id/access`
Atualiza o nível de acesso de um usuário (somente admin).

**Autenticação**: Requerida (role: `admin`)

**Request Body**:
```json
{
  "role": "gestor",
  "companyId": "uuid"
}
```

**Response** (200):
```json
{
  "mensagem": "Nível de acesso atualizado com sucesso.",
  "usuario": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "role": "gestor",
    "companyId": "uuid",
    "company": {
      "id": "uuid",
      "name": "Empresa XPTO"
    },
    "updatedAt": "2026-06-29T11:00:00Z"
  }
}
```

**Regras de Negócio**:
- Admin não pode alterar o próprio perfil
- Não pode remover o último admin do sistema

**Erros**:
- `400`: Tentativa de alterar próprio perfil ou remover último admin
- `404`: Usuário não encontrado

---

## Categorias

### GET `/categories`
Lista todas as categorias de materiais.

**Autenticação**: Requerida

**Response** (200):
```json
{
  "dados": [
    {
      "id": "uuid",
      "namePt": "Cabos",
      "nameEn": "Cables",
      "nameEs": "Cables"
    }
  ]
}
```

---

### POST `/categories`
Cria uma nova categoria.

**Autenticação**: Requerida (roles: `admin`, `gestor`)

**Request Body**:
```json
{
  "namePt": "Conectores",
  "nameEn": "Connectors",
  "nameEs": "Conectores"
}
```

**Response** (201):
```json
{
  "mensagem": "Categoria criada com sucesso.",
  "categoria": {
    "id": "uuid",
    "namePt": "Conectores",
    "nameEn": "Connectors",
    "nameEs": "Conectores"
  }
}
```

---

### PUT `/categories/:id`
Atualiza uma categoria existente.

**Autenticação**: Requerida (roles: `admin`, `gestor`)

**Request Body**: (mesmo formato do POST)

**Response** (200):
```json
{
  "mensagem": "Categoria atualizada com sucesso.",
  "categoria": { ... }
}
```

---

### DELETE `/categories/:id`
Remove uma categoria (soft delete).

**Autenticação**: Requerida (roles: `admin`, `gestor`)

**Response** (200):
```json
{
  "mensagem": "Categoria excluída com sucesso."
}
```

---

## Materiais

### GET `/materials`
Lista materiais com paginação e busca.

**Autenticação**: Requerida

**Query Parameters**:
- `page` (number, default: 1)
- `pageSize` (number, default: 10)
- `search` (string): busca por código ou nome

**Response** (200):
```json
{
  "dados": [
    {
      "id": "uuid",
      "code": "12.34",
      "codeWarning": "Código fora do padrão XX.XX",
      "namePt": "Cabo de Cobre 4mm",
      "nameEn": "Copper Cable 4mm",
      "nameEs": "Cable de Cobre 4mm",
      "descriptionPt": "Descrição detalhada",
      "categoryId": "uuid",
      "category": {
        "id": "uuid",
        "namePt": "Cabos"
      },
      "createdAt": "2026-06-29T10:00:00Z"
    }
  ],
  "paginacao": {
    "page": 1,
    "pageSize": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### GET `/materials/:id`
Detalha um material específico.

**Autenticação**: Requerida

**Response** (200):
```json
{
  "material": {
    "id": "uuid",
    "code": "12.34",
    "namePt": "Cabo de Cobre 4mm",
    "nameEn": "Copper Cable 4mm",
    "nameEs": "Cable de Cobre 4mm",
    "descriptionPt": "Descrição",
    "descriptionEn": "Description",
    "descriptionEs": "Descripción",
    "categoryId": "uuid",
    "category": {
      "namePt": "Cabos"
    },
    "createdAt": "2026-06-29T10:00:00Z",
    "updatedAt": "2026-06-29T10:00:00Z"
  }
}
```

---

### POST `/materials`
Cria um novo material.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`)

**Request Body**:
```json
{
  "code": "12.34",
  "namePt": "Cabo de Cobre 4mm",
  "nameEn": "Copper Cable 4mm",
  "nameEs": "Cable de Cobre 4mm",
  "descriptionPt": "Descrição detalhada",
  "descriptionEn": "Detailed description",
  "descriptionEs": "Descripción detallada",
  "categoryId": "uuid"
}
```

**Response** (201):
```json
{
  "mensagem": "Material criado com sucesso.",
  "material": { ... },
  "avisos": ["Código fora do padrão XX.XX"]
}
```

**Validação**:
- Padrão esperado do código: `XX.XX` (ex: `12.34`)
- Se fora do padrão, gera aviso mas permite cadastro

---

### PUT `/materials/:id`
Atualiza um material existente.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`)

**Request Body**: (mesmo formato do POST)

---

### DELETE `/materials/:id`
Remove um material (soft delete).

**Autenticação**: Requerida (roles: `admin`, `gestor`)

**Validação**: Verifica se há itens de documento referenciando este material

**Response** (200):
```json
{
  "mensagem": "Material excluído com sucesso."
}
```

**Erros**:
- `400`: Material está sendo usado em documentos

---

## Variantes de Materiais

### GET `/materials/:materialId/variants`
Lista variantes de um material.

**Autenticação**: Requerida

**Response** (200):
```json
{
  "dados": [
    {
      "id": "uuid",
      "materialId": "uuid",
      "code": "12.3401.01",
      "namePt": "Cabo 4mm Vermelho",
      "nameEn": "Cable 4mm Red",
      "nameEs": "Cable 4mm Rojo",
      "unit": "m",
      "createdAt": "2026-06-29T10:00:00Z"
    }
  ]
}
```

---

### POST `/materials/:materialId/variants`
Adiciona uma variante ao material.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`)

**Request Body**:
```json
{
  "code": "12.3401.01",
  "namePt": "Cabo 4mm Vermelho",
  "nameEn": "Cable 4mm Red",
  "nameEs": "Cable 4mm Rojo",
  "unit": "m"
}
```

**Response** (201):
```json
{
  "mensagem": "Variante criada com sucesso.",
  "variante": { ... },
  "avisos": ["Código fora do padrão XX.XXNN.XX"]
}
```

**Validação**:
- Padrão esperado: `XX.XXNN.XX` (ex: `12.3401.01`)

---

### PUT `/materials/:materialId/variants/:variantId`
Atualiza uma variante.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`)

---

### DELETE `/materials/:materialId/variants/:variantId`
Remove uma variante (soft delete).

**Autenticação**: Requerida (roles: `admin`, `gestor`)

**Validação**: Verifica se há itens de documento referenciando esta variante

---

## Projetos

### GET `/projects`
Lista projetos com paginação.

**Autenticação**: Requerida

**Query Parameters**:
- `page` (number)
- `pageSize` (number)
- `search` (string)

**Filtros por Role**:
- `cliente`: vê apenas projetos da sua empresa
- `usuario`: vê apenas projetos que criou
- `engenheiro`, `gestor`, `admin`: veem todos os projetos

**Response** (200):
```json
{
  "dados": [
    {
      "id": "uuid",
      "code": "PRJ-2026-001",
      "name": "Reforma Elétrica Prédio A",
      "description": "Descrição do projeto",
      "status": "ativo",
      "companyId": "uuid"
    }
  ],
  "paginacao": { ... }
}
```

---

### GET `/projects/:id`
Detalha um projeto.

**Autenticação**: Requerida

**Controle de Acesso**: Segue as mesmas regras do GET `/projects`

**Response** (200):
```json
{
  "projeto": {
    "id": "uuid",
    "code": "PRJ-2026-001",
    "name": "Reforma Elétrica Prédio A",
    "description": "Descrição",
    "status": "ativo",
    "companyId": "uuid",
    "createdById": "uuid",
    "createdAt": "2026-06-29T10:00:00Z"
  }
}
```

---

### POST `/projects`
Cria um novo projeto.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`, `usuario`, `cliente`)

**Request Body**:
```json
{
  "code": "PRJ-2026-002",
  "name": "Projeto de Iluminação",
  "description": "Descrição detalhada",
  "status": "ativo",
  "companyId": "uuid"
}
```

**Response** (201):
```json
{
  "mensagem": "Projeto criado com sucesso.",
  "projeto": { ... }
}
```

---

### PUT `/projects/:id`
Atualiza um projeto.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`, `usuario`, `cliente`)

**Controle de Acesso**: Usuários só podem editar projetos que criaram ou que pertencem à sua empresa

---

### DELETE `/projects/:id`
Remove um projeto (soft delete).

**Autenticação**: Requerida (roles: `admin`, `gestor`)

---

## Documentos

### GET `/documents`
Lista documentos.

**Autenticação**: Requerida

**Query Parameters**:
- `page`, `pageSize`, `search`
- `projectId` (uuid): filtra por projeto

**Controle de Acesso**:
- `cliente`: vê apenas documentos de projetos da sua empresa

**Response** (200):
```json
{
  "dados": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "code": "DOC-001",
      "title": "Lista de Materiais - Prédio A",
      "type": "lista_materiais",
      "revision": "R01",
      "project": {
        "code": "PRJ-2026-001",
        "name": "Reforma Elétrica"
      }
    }
  ],
  "paginacao": { ... }
}
```

---

### GET `/documents/:id`
Detalha um documento e seus itens.

**Autenticação**: Requerida

**Response** (200):
```json
{
  "documento": {
    "id": "uuid",
    "projectId": "uuid",
    "code": "DOC-001",
    "title": "Lista de Materiais",
    "type": "lista_materiais",
    "revision": "R01",
    "project": { ... },
    "items": [
      {
        "id": "uuid",
        "variantId": "uuid",
        "quantity": 100,
        "unitPrice": 5.50,
        "totalPrice": 550.00,
        "lineNumber": 1,
        "variant": {
          "code": "12.3401.01",
          "namePt": "Cabo 4mm Vermelho",
          "material": {
            "code": "12.34",
            "namePt": "Cabo de Cobre"
          }
        }
      }
    ]
  }
}
```

---

### POST `/documents`
Cria um novo documento.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`, `usuario`)

**Request Body**:
```json
{
  "projectId": "uuid",
  "code": "DOC-002",
  "title": "Lista Estimativa - Prédio B",
  "type": "lista_estimativa",
  "revision": "R00"
}
```

**Tipos de Documento**:
- `lista_materiais`
- `lista_estimativa`
- `lista_cabos`

**Response** (201):
```json
{
  "mensagem": "Documento criado com sucesso.",
  "documento": { ... }
}
```

---

### PUT `/documents/:id`
Atualiza um documento.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`, `usuario`)

---

### DELETE `/documents/:id`
Remove um documento (soft delete).

**Autenticação**: Requerida (roles: `admin`, `gestor`)

---

## Itens de Documento

### GET `/documents/:documentId/items`
Lista itens de um documento.

**Autenticação**: Requerida

**Response** (200):
```json
{
  "dados": [
    {
      "id": "uuid",
      "documentId": "uuid",
      "variantId": "uuid",
      "quantity": 100,
      "unitPrice": 5.50,
      "totalPrice": 550.00,
      "lineNumber": 1,
      "variant": {
        "code": "12.3401.01",
        "namePt": "Cabo 4mm Vermelho",
        "material": {
          "namePt": "Cabo de Cobre"
        }
      }
    }
  ]
}
```

---

### POST `/documents/:documentId/items`
Adiciona um item ao documento.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`, `usuario`)

**Request Body**:
```json
{
  "variantId": "uuid",
  "quantity": 100,
  "unitPrice": 5.50,
  "totalPrice": 550.00
}
```

**Response** (201):
```json
{
  "mensagem": "Item adicionado com sucesso.",
  "item": { ... }
}
```

---

### PUT `/documents/:documentId/items/:itemId`
Atualiza um item do documento.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`, `usuario`)

---

### DELETE `/documents/:documentId/items/:itemId`
Remove um item do documento.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`, `usuario`)

---

## Detalhes Típicos

### GET `/typical-details`
Lista detalhes típicos.

**Autenticação**: Requerida

**Query Parameters**:
- `page`, `pageSize`, `search`

**Response** (200):
```json
{
  "dados": [
    {
      "id": "uuid",
      "code": "TYP-001",
      "namePt": "Painel de Distribuição 12 Disjuntores",
      "nameEn": "Distribution Panel 12 Breakers",
      "nameEs": "Panel de Distribución 12 Interruptores",
      "descriptionPt": "Kit completo",
      "createdAt": "2026-06-29T10:00:00Z"
    }
  ],
  "paginacao": { ... }
}
```

---

### GET `/typical-details/:id`
Detalha um detalhe típico e seus componentes.

**Autenticação**: Requerida

**Response** (200):
```json
{
  "detalheTypico": {
    "id": "uuid",
    "code": "TYP-001",
    "namePt": "Painel de Distribuição",
    "components": [
      {
        "id": "uuid",
        "variantId": "uuid",
        "quantity": 12,
        "lineNumber": 1,
        "variant": {
          "code": "34.5601.02",
          "namePt": "Disjuntor 20A",
          "material": {
            "namePt": "Disjuntores"
          }
        }
      }
    ],
    "attachments": [
      {
        "id": "uuid",
        "fileName": "diagrama.pdf",
        "fileType": "pdf",
        "isMainImage": false
      }
    ]
  }
}
```

---

### POST `/typical-details`
Cria um novo detalhe típico.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`)

**Request Body**:
```json
{
  "code": "TYP-002",
  "namePt": "Ponto de Iluminação Completo",
  "nameEn": "Complete Lighting Point",
  "nameEs": "Punto de Iluminación Completo",
  "descriptionPt": "Kit padrão"
}
```

**Response** (201):
```json
{
  "mensagem": "Detalhe típico criado com sucesso.",
  "detalheTypico": { ... }
}
```

---

### PUT `/typical-details/:id`
Atualiza um detalhe típico.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`)

---

### DELETE `/typical-details/:id`
Remove um detalhe típico (soft delete).

**Autenticação**: Requerida (roles: `admin`, `gestor`)

---

## Componentes de Detalhes Típicos

### POST `/typical-details/:typicalDetailId/components`
Adiciona um componente ao detalhe típico.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`)

**Request Body**:
```json
{
  "variantId": "uuid",
  "quantity": 5
}
```

**Response** (201):
```json
{
  "mensagem": "Componente adicionado com sucesso.",
  "componente": {
    "id": "uuid",
    "variantId": "uuid",
    "quantity": 5,
    "lineNumber": 2
  }
}
```

---

### PUT `/typical-details/:typicalDetailId/components/:componentId`
Atualiza um componente.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`)

---

### DELETE `/typical-details/:typicalDetailId/components/:componentId`
Remove um componente.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`)

---

## Anexos

### POST `/typical-details/:typicalDetailId/attachments`
Faz upload de um anexo (PDF, DWG, imagem, etc.).

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`)

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: arquivo (required)
- `fileType`: tipo do arquivo (pdf, dwg, jpg, png, etc.)
- `description`: descrição (opcional)
- `language`: idioma do arquivo (pt, en, es) (opcional)

**Response** (201):
```json
{
  "mensagem": "Anexo enviado com sucesso.",
  "anexo": {
    "id": "uuid",
    "fileName": "diagrama.pdf",
    "filePath": "/uploads/...",
    "fileSize": 524288,
    "mimeType": "application/pdf",
    "isMainImage": false
  }
}
```

---

### PATCH `/typical-details/:typicalDetailId/attachments/:attachmentId/set-main`
Define um anexo como imagem principal.

**Autenticação**: Requerida (roles: `admin`, `gestor`, `engenheiro`)

**Response** (200):
```json
{
  "mensagem": "Imagem principal definida com sucesso.",
  "anexo": { ... }
}
```

---

### DELETE `/typical-details/:typicalDetailId/attachments/:attachmentId`
Remove um anexo.

**Autenticação**: Requerida (roles: `admin`, `gestor`)

---

## Códigos de Status

| Código | Significado |
|--------|-------------|
| `200` | Sucesso |
| `201` | Criado com sucesso |
| `400` | Erro de validação ou requisição inválida |
| `401` | Não autenticado (token ausente/inválido) |
| `403` | Acesso negado (sem permissão) |
| `404` | Recurso não encontrado |
| `409` | Conflito (ex: e-mail já cadastrado) |
| `500` | Erro interno do servidor |

---

## Níveis de Acesso (Roles)

| Role | Descrição | Permissões |
|------|-----------|------------|
| `admin` | Administrador | Acesso total, incluindo gestão de usuários |
| `gestor` | Gestor | Criar/editar/excluir materiais, projetos, documentos |
| `engenheiro` | Engenheiro | Criar/editar materiais, documentos, detalhes típicos |
| `usuario` | Usuário | Criar projetos e documentos (limitado aos próprios) |
| `cliente` | Cliente | Visualizar apenas projetos/documentos da própria empresa |

---

## Headers Padrão

Todas as requisições autenticadas devem incluir:

```
Authorization: Bearer <token_jwt>
Content-Type: application/json
```

---

## Exemplos de Uso

### Login e uso de endpoint protegido

```bash
# 1. Login
curl -X POST https://api.exemplo.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","password":"senha123"}'

# Resposta contém o token:
# {"token": "eyJhbGciOiJI..."}

# 2. Usar token em requisição protegida
curl -X GET https://api.exemplo.com/api/v1/materials \
  -H "Authorization: Bearer eyJhbGciOiJI..."
```

---

## Auditoria

Todas as operações mutáveis (`POST`, `PUT`, `PATCH`, `DELETE`) são registradas automaticamente na tabela `audit_logs` com:
- Usuário que executou
- Método HTTP
- URL acessada
- Dados antes/depois (quando aplicável)
- Timestamp

---

## Soft Delete

As seguintes entidades usam soft delete (campo `deletedAt`):
- Users
- Companies
- MaterialCategories
- Materials
- MaterialVariants
- Projects
- Documents
- TypicalDetails

Registros deletados não aparecem nas listagens padrão mas permanecem no banco para auditoria.

---

## Suporte

Para dúvidas ou problemas, consulte:
- [README.md](./README.md)
- [DEPLOY.md](./DEPLOY.md)
- [DEPLOY_VERCEL_RAILWAY.md](./DEPLOY_VERCEL_RAILWAY.md)

---

**Versão**: Fase 1 (MVP)  
**Última atualização**: 29 de junho de 2026
