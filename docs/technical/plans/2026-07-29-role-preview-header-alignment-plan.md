# Role Preview Header Alignment Implementation Plan

**Goal:** Alinhar o controle desktop “Visualizar como” aos demais controles do cabeçalho sem alterar a apresentação móvel ou o comportamento da simulação.

**Architecture:** O componente existente continuará usando a prop `variant`. A variante desktop receberá uma estrutura horizontal compacta; a variante mobile conservará o rótulo empilhado e o seletor largo dentro da navegação.

**Tech Stack:** React 19, TypeScript, Zustand, i18next, CSS existente, Vitest e Testing Library.

## Global Constraints

- Desktop deve apresentar `Visualizar como: Admin ▾` em uma única cápsula horizontal.
- Mobile mantém o rótulo acima do seletor.
- Nome acessível, opções, persistência, permissões e backend não mudam.
- Sem overflow horizontal em 320px.
- Temas claro e escuro preservam contraste e foco.
- Nenhum push ou deploy.

---

### Task 1: Alinhar o controle por variante

**Files:**
- Modify: `frontend/src/components/RolePreviewControl.tsx`
- Modify: `frontend/src/components/RolePreviewControl.test.tsx`
- Modify: `frontend/src/index.css`

**Interfaces:**
- Consumes: `variant: 'desktop' | 'mobile'`.
- Produces: classes de variante `mm-role-preview-control--desktop` e `mm-role-preview-control--mobile`.

- [ ] **Step 1: Escrever teste que falha**

Adicionar testes que renderizam as duas variantes e verificam:

```tsx
expect(desktopControl).toHaveClass('mm-role-preview-control--desktop');
expect(mobileControl).toHaveClass('mm-role-preview-control--mobile');
expect(desktopLabel).toHaveClass('sr-only');
expect(mobileLabel).not.toHaveClass('sr-only');
```

O `<select>` desktop deve continuar com nome acessível “Visualizar como”, fornecido pelo `<label>` semanticamente associado.

- [ ] **Step 2: Confirmar RED**

Run:

```powershell
npm.cmd test -- src/components/RolePreviewControl.test.tsx
```

Expected: FAIL porque as classes de variante e o rótulo desktop visualmente oculto ainda não existem.

- [ ] **Step 3: Implementar estrutura mínima**

No componente:

```tsx
<div className={`mm-role-preview-control mm-role-preview-control--${variant}`}>
  <label className={variant === 'desktop' ? 'sr-only' : undefined} htmlFor={selectId}>
    {t('visualizarComo')}
  </label>
  <span className="mm-role-preview-control__desktop-prefix" aria-hidden="true">
    {t('visualizarComo')}:
  </span>
  <select>
```

Renderizar o prefixo visível somente na variante desktop. O `<label>` associado continua fornecendo o nome acessível; não adicionar `aria-label` duplicado.

- [ ] **Step 4: Aplicar layout**

Em `index.css`:

```css
.mm-role-preview-control--desktop {
  display: inline-flex;
  min-height: 44px;
  flex-direction: row;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
}

.mm-role-preview-control--desktop select {
  min-height: 40px;
  width: auto;
}

.mm-role-preview-control--mobile {
  align-items: stretch;
}

.mm-role-preview-control__desktop-prefix {
  display: none;
}

.mm-role-preview-control--desktop .mm-role-preview-control__desktop-prefix {
  display: inline;
}
```

Reutilizar tokens existentes; não introduzir cores novas.

- [ ] **Step 5: Confirmar GREEN**

Run:

```powershell
npm.cmd test -- src/components/RolePreviewControl.test.tsx
npm.cmd test
npm.cmd run check:contrast
npm.cmd run lint
npm.cmd run build
```

Expected: todos os testes e verificações passam.

- [ ] **Step 6: Verificação visual**

Testar no navegador:

- desktop 1280px, claro e escuro: controle em uma linha e alinhado aos demais;
- mobile 320px, claro e escuro: rótulo empilhado, menu acessível e zero overflow;
- seleção de Engenheiro e retorno ao Admin continuam funcionando.

- [ ] **Step 7: Integração local**

Copiar somente os três arquivos aprovados para `C:\Users\Leonardo\Documents\juliano\mm_system`, repetir a suíte completa nessa pasta e não realizar push ou deploy.
