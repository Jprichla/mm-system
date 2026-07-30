# Admin “Visualizar como” Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que somente um administrador simule visualmente os perfis Gestor, Engenheiro, Usuário e Cliente sem trocar identidade, token ou autorização no backend.

**Architecture:** O estado de autenticação continuará armazenando a identidade real e ganhará um perfil visual opcional, validado e persistido localmente. Permissões, menus e proteções visuais usarão o perfil efetivo, enquanto verificações de segurança do próprio recurso usarão exclusivamente o perfil real. Um seletor e uma faixa persistente no shell autenticado deixarão a simulação explícita e reversível.

**Tech Stack:** React 19, TypeScript, Zustand, React Router, Vitest, Testing Library, CSS existente do MM System.

## Global Constraints

- Somente uma conta real com `role === 'admin'` pode ativar a simulação.
- A simulação é exclusivamente visual e nunca altera token, headers, parâmetros, payloads ou identidade no backend.
- Perfis disponíveis: `admin`, `gestor`, `engenheiro`, `usuario` e `cliente`.
- O perfil simulado persiste após atualização da página e é removido no logout.
- Valores inválidos ou definidos por contas não administrativas são ignorados e removidos.
- A interface deve manter os temas claro/escuro e continuar organizada em desktop e dispositivos móveis.
- Nenhum deploy ou push para GitHub faz parte deste plano.

---

### Task 1: Estado seguro do perfil visual

**Files:**
- Create: `frontend/src/store/authStore.test.ts`
- Modify: `frontend/src/store/authStore.ts`
- Modify: `frontend/package.json`

**Interfaces:**
- Consumes: `Role` e `Usuario` de `frontend/src/types/index.ts`.
- Produces: `roleVisualizado: Role | null`, `roleEfetivo: Role`, `definirRoleVisualizado(role: Role): void`, `voltarAoAdmin(): void` e `isAdminReal: boolean` no estado de autenticação.

- [ ] **Step 1: Adicionar o executor de testes**

Atualizar `frontend/package.json`:

```json
{
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.9.1",
    "jsdom": "^26.1.0",
    "vitest": "^3.2.4"
  }
}
```

Executar:

```powershell
npm install
```

Expected: dependências instaladas e `package-lock.json` atualizado.

- [ ] **Step 2: Escrever testes que falham para validação e ciclo de vida**

Criar `frontend/src/store/authStore.test.ts` cobrindo:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('authStore role visual', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('permite que um admin real visualize como engenheiro e persiste a escolha', async () => {
    const { useAuthStore } = await import('./authStore');
    useAuthStore.setState({
      usuario: { id: '1', name: 'Admin', email: 'admin@acme.com', role: 'admin' },
    });
    useAuthStore.getState().definirRoleVisualizado('engenheiro');
    expect(useAuthStore.getState().roleEfetivo).toBe('engenheiro');
    expect(localStorage.getItem('mm_role_visualizado')).toBe('engenheiro');
  });

  it('ignora simulação quando a conta real não é admin', async () => {
    localStorage.setItem('mm_role_visualizado', 'admin');
    const { useAuthStore } = await import('./authStore');
    useAuthStore.setState({
      usuario: { id: '2', name: 'Gestor', email: 'gestor@acme.com', role: 'gestor' },
    });
    useAuthStore.getState().validarRoleVisualizado();
    expect(useAuthStore.getState().roleVisualizado).toBeNull();
    expect(localStorage.getItem('mm_role_visualizado')).toBeNull();
  });

  it('remove a simulação no logout', async () => {
    const { useAuthStore } = await import('./authStore');
    useAuthStore.setState({
      usuario: { id: '1', name: 'Admin', email: 'admin@acme.com', role: 'admin' },
    });
    useAuthStore.getState().definirRoleVisualizado('cliente');
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().roleVisualizado).toBeNull();
    expect(localStorage.getItem('mm_role_visualizado')).toBeNull();
  });
});
```

- [ ] **Step 3: Executar os testes e confirmar a falha**

Run:

```powershell
npm test -- authStore.test.ts
```

Expected: FAIL porque os campos e métodos do perfil visual ainda não existem.

- [ ] **Step 4: Implementar o estado mínimo**

Em `frontend/src/store/authStore.ts`, adicionar:

```ts
const ROLE_VISUAL_STORAGE_KEY = 'mm_role_visualizado';
const ROLES: Role[] = ['admin', 'gestor', 'engenheiro', 'usuario', 'cliente'];

function lerRoleVisualizado(): Role | null {
  const value = localStorage.getItem(ROLE_VISUAL_STORAGE_KEY);
  return ROLES.includes(value as Role) ? (value as Role) : null;
}
```

Estender `AuthState` com:

```ts
roleVisualizado: Role | null;
roleEfetivo: Role;
isAdminReal: boolean;
definirRoleVisualizado: (role: Role) => void;
voltarAoAdmin: () => void;
validarRoleVisualizado: () => void;
```

Nas ações, aplicar estas regras:

```ts
definirRoleVisualizado: (role) => {
  if (get().usuario?.role !== 'admin' || !ROLES.includes(role)) return;
  const roleVisualizado = role === 'admin' ? null : role;
  if (roleVisualizado) localStorage.setItem(ROLE_VISUAL_STORAGE_KEY, roleVisualizado);
  else localStorage.removeItem(ROLE_VISUAL_STORAGE_KEY);
  set({ roleVisualizado, roleEfetivo: roleVisualizado ?? 'admin' });
},
voltarAoAdmin: () => {
  localStorage.removeItem(ROLE_VISUAL_STORAGE_KEY);
  set({ roleVisualizado: null, roleEfetivo: get().usuario?.role ?? 'cliente' });
},
validarRoleVisualizado: () => {
  const usuario = get().usuario;
  const roleVisualizado = usuario?.role === 'admin' ? lerRoleVisualizado() : null;
  if (!roleVisualizado) localStorage.removeItem(ROLE_VISUAL_STORAGE_KEY);
  set({
    roleVisualizado,
    roleEfetivo: roleVisualizado ?? usuario?.role ?? 'cliente',
    isAdminReal: usuario?.role === 'admin',
  });
},
```

Chamar `validarRoleVisualizado()` depois de `login` e `carregarPerfil`. Limpar `mm_role_visualizado` no `logout`.

- [ ] **Step 5: Executar testes e verificações**

Run:

```powershell
npm test -- authStore.test.ts
npm run lint
npm run build
```

Expected: testes passam; lint sem erros; build concluído.

- [ ] **Step 6: Commit local**

```powershell
git add frontend/package.json frontend/package-lock.json frontend/src/store/authStore.ts frontend/src/store/authStore.test.ts
git commit -m "feat: add admin visual role state"
```

Se a pasta `.git` continuar bloqueada pelo Windows, registrar a limitação e manter as alterações locais sem commit.

---

### Task 2: Permissões e rotas baseadas no perfil visual

**Files:**
- Create: `frontend/src/hooks/usePermissoes.test.tsx`
- Modify: `frontend/src/hooks/usePermissoes.ts`
- Modify: `frontend/src/components/AdminOnlyRoute.tsx`
- Modify: `frontend/src/components/RoleRoutes.tsx`

**Interfaces:**
- Consumes: `roleEfetivo` e `isAdminReal` produzidos pela Task 1.
- Produces: permissões de apresentação baseadas no perfil efetivo e a distinção `isAdminReal`.

- [ ] **Step 1: Escrever testes que falham para permissões simuladas**

Criar `frontend/src/hooks/usePermissoes.test.tsx`:

```tsx
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '../store/authStore';
import { usePermissoes } from './usePermissoes';

describe('usePermissoes com perfil visual', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      usuario: { id: '1', name: 'Admin', email: 'admin@acme.com', role: 'admin' },
      roleVisualizado: null,
      roleEfetivo: 'admin',
      isAdminReal: true,
    });
  });

  it('apresenta permissões de engenheiro mantendo a identidade real de admin', () => {
    useAuthStore.setState({ roleVisualizado: 'engenheiro', roleEfetivo: 'engenheiro' });
    const { result } = renderHook(() => usePermissoes());
    expect(result.current.role).toBe('engenheiro');
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isAdminReal).toBe(true);
    expect(result.current.podeGerenciarUsuarios).toBe(false);
    expect(result.current.podeCriarProjeto).toBe(true);
  });
});
```

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run:

```powershell
npm test -- usePermissoes.test.tsx
```

Expected: FAIL porque o hook ainda lê `usuario.role` e não expõe `isAdminReal`.

- [ ] **Step 3: Atualizar o hook de permissões**

Em `frontend/src/hooks/usePermissoes.ts`, substituir a origem do perfil:

```ts
const role = useAuthStore((s) => s.roleEfetivo);
const isAdminReal = useAuthStore((s) => s.isAdminReal);
```

Manter todas as regras existentes e adicionar `isAdminReal` ao retorno. `isAdmin` continuará significando que a interface está no perfil Admin.

- [ ] **Step 4: Ajustar as proteções visuais de rota**

Em `AdminOnlyRoute.tsx` e `RoleRoutes.tsx`, usar `roleEfetivo` para decidir se a rota aparece durante a simulação. Não alterar `ProtectedRoute`, token ou chamadas da API.

Ao trocar para um perfil que não permite a rota atual, redirecionar para `/` usando os mecanismos já existentes do React Router.

- [ ] **Step 5: Executar testes e verificações**

Run:

```powershell
npm test -- usePermissoes.test.tsx
npm run lint
npm run build
```

Expected: teste passa; lint sem erros; build concluído.

- [ ] **Step 6: Commit local**

```powershell
git add frontend/src/hooks/usePermissoes.ts frontend/src/hooks/usePermissoes.test.tsx frontend/src/components/AdminOnlyRoute.tsx frontend/src/components/RoleRoutes.tsx
git commit -m "feat: apply visual role to interface permissions"
```

Se a pasta `.git` continuar bloqueada pelo Windows, registrar a limitação e manter as alterações locais sem commit.

---

### Task 3: Seletor e faixa de simulação

**Files:**
- Create: `frontend/src/components/RolePreviewControl.tsx`
- Create: `frontend/src/components/RolePreviewControl.test.tsx`
- Modify: `frontend/src/components/Header.tsx`
- Modify: `frontend/src/layouts/AppLayout.tsx`
- Modify: `frontend/src/i18n/index.ts`
- Modify: `frontend/src/index.css`

**Interfaces:**
- Consumes: `usuario`, `roleVisualizado`, `roleEfetivo`, `isAdminReal`, `definirRoleVisualizado` e `voltarAoAdmin`.
- Produces: seletor exclusivo do Admin e faixa persistente do modo visual.

- [ ] **Step 1: Escrever testes que falham para a interface**

Criar `RolePreviewControl.test.tsx` cobrindo:

```tsx
it('não renderiza para uma conta real não administrativa', () => {
  useAuthStore.setState({
    usuario: { id: '2', name: 'Gestor', email: 'gestor@acme.com', role: 'gestor' },
    isAdminReal: false,
    roleEfetivo: 'gestor',
  });
  const { queryByLabelText } = render(<RolePreviewControl />);
  expect(queryByLabelText('Visualizar como')).not.toBeInTheDocument();
});

it('permite ao admin selecionar engenheiro e voltar ao admin', async () => {
  const user = userEvent.setup();
  render(<RolePreviewControl />);
  await user.selectOptions(screen.getByLabelText('Visualizar como'), 'engenheiro');
  expect(screen.getByText(/Modo de visualização: Engenheiro/)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Voltar ao Admin' }));
  expect(screen.queryByText(/Modo de visualização/)).not.toBeInTheDocument();
});
```

Adicionar `@testing-library/user-event` às dependências de desenvolvimento.

- [ ] **Step 2: Executar e confirmar a falha**

Run:

```powershell
npm test -- RolePreviewControl.test.tsx
```

Expected: FAIL porque o componente ainda não existe.

- [ ] **Step 3: Implementar o componente**

Criar `RolePreviewControl.tsx` com um `<select>` rotulado, opções baseadas em `Role`, retorno `null` quando `isAdminReal` for falso e faixa com `role="status"` enquanto `roleVisualizado` estiver ativo.

Estrutura:

```tsx
const ROLE_OPTIONS: Array<{ value: Role; labelKey: string }> = [
  { value: 'admin', labelKey: 'roleAdmin' },
  { value: 'gestor', labelKey: 'roleGestor' },
  { value: 'engenheiro', labelKey: 'roleEngenheiro' },
  { value: 'usuario', labelKey: 'roleUsuario' },
  { value: 'cliente', labelKey: 'roleCliente' },
];
```

O texto da faixa deve usar:

```tsx
t('modoVisualizacaoAtivo', { role: t(roleLabelKey) })
```

- [ ] **Step 4: Integrar ao shell e localizar**

Adicionar o seletor ao `Header` no desktop e à área móvel existente. Renderizar a faixa no `AppLayout`, acima do conteúdo principal.

Adicionar em português, inglês e espanhol:

```ts
visualizarComo
modoVisualizacaoAtivo
contaContinuaAdmin
voltarAoAdmin
roleAdmin
roleGestor
roleEngenheiro
roleUsuario
roleCliente
```

- [ ] **Step 5: Estilizar sem amontoar**

Em `index.css`, criar classes `mm-role-preview-control` e `mm-role-preview-banner` usando tokens existentes. Garantir:

- altura mínima de controles de 44px;
- foco visível;
- contraste mínimo de 4.5:1 para texto;
- quebra em coluna abaixo do breakpoint móvel;
- ausência de overflow horizontal em 320px.

- [ ] **Step 6: Executar testes e verificações**

Run:

```powershell
npm test -- RolePreviewControl.test.tsx
npm run check:contrast
npm run lint
npm run build
```

Expected: testes passam; contraste passa; lint sem erros; build concluído.

- [ ] **Step 7: Commit local**

```powershell
git add frontend/package.json frontend/package-lock.json frontend/src/components/RolePreviewControl.tsx frontend/src/components/RolePreviewControl.test.tsx frontend/src/components/Header.tsx frontend/src/layouts/AppLayout.tsx frontend/src/i18n/index.ts frontend/src/index.css
git commit -m "feat: add admin role preview controls"
```

Se a pasta `.git` continuar bloqueada pelo Windows, registrar a limitação e manter as alterações locais sem commit.

---

### Task 4: Teste integrado e verificação final

**Files:**
- Create: `frontend/src/components/RolePreview.integration.test.tsx`
- Modify: `frontend/src/store/authStore.ts` somente se o teste revelar uma falha de ciclo de vida.
- Modify: `frontend/src/components/RolePreviewControl.tsx` somente se o teste revelar uma falha de interação.

**Interfaces:**
- Consumes: estado, permissões e componentes entregues pelas Tasks 1–3.
- Produces: cobertura integrada do fluxo completo sem qualquer mudança no backend.

- [ ] **Step 1: Escrever o teste integrado**

Criar `RolePreview.integration.test.tsx` com `MemoryRouter`, simulando:

```tsx
it('mantém token e identidade reais enquanto alterna a apresentação', async () => {
  localStorage.setItem('mm_token', 'token-admin');
  useAuthStore.setState({
    token: 'token-admin',
    usuario: { id: '1', name: 'Admin', email: 'admin@acme.com', role: 'admin' },
    roleVisualizado: null,
    roleEfetivo: 'admin',
    isAdminReal: true,
  });

  render(<AuthenticatedShellForTest />);
  await userEvent.selectOptions(screen.getByLabelText('Visualizar como'), 'cliente');

  expect(useAuthStore.getState().usuario?.role).toBe('admin');
  expect(useAuthStore.getState().token).toBe('token-admin');
  expect(useAuthStore.getState().roleEfetivo).toBe('cliente');
  expect(screen.queryByText('Administração')).not.toBeInTheDocument();
  expect(screen.getByText(/Sua conta continua sendo Admin/)).toBeInTheDocument();
});
```

Adicionar casos para persistência após reinicialização do store, logout e armazenamento manipulado por não administrador.

- [ ] **Step 2: Executar o teste e observar o resultado**

Run:

```powershell
npm test -- RolePreview.integration.test.tsx
```

Expected: PASS. Se falhar, corrigir somente a causa demonstrada pelo caso.

- [ ] **Step 3: Executar a suíte completa**

Run:

```powershell
npm test
npm run check:contrast
npm run lint
npm run build
```

Expected: zero testes com falha, contraste aprovado, lint sem erros e build concluído.

- [ ] **Step 4: Teste manual local**

Com PostgreSQL, backend e frontend locais ativos:

1. Entrar como `admin@acme.com`.
2. Alternar entre Admin, Gestor, Engenheiro, Usuário e Cliente.
3. Confirmar menus, rotas e ações visíveis de cada perfil.
4. Atualizar a página durante uma simulação e confirmar persistência.
5. Confirmar que o token não muda.
6. Clicar em “Voltar ao Admin”.
7. Sair e entrar como Gestor; confirmar ausência do recurso.
8. Repetir em tema claro, escuro, desktop e viewport móvel.

Expected: todos os critérios de aceite da especificação são atendidos sem chamadas novas ou alterações no backend.

- [ ] **Step 5: Inspecionar alterações**

Run:

```powershell
git diff --check
git status --short
```

Expected: nenhuma falha de whitespace; somente arquivos previstos no plano aparecem modificados.

- [ ] **Step 6: Commit local**

```powershell
git add frontend/src/components/RolePreview.integration.test.tsx
git commit -m "test: cover admin role preview flow"
```

Se a pasta `.git` continuar bloqueada pelo Windows, registrar a limitação e manter todas as alterações locais sem commit.
