# MM System Frontend Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize every MM System frontend screen with the approved spacious professional visual language while preserving all existing behavior.

**Architecture:** Establish theme tokens and reusable presentation patterns first, modernize the application shell and shared components second, then migrate page groups without changing their data flow. Verification is performed after each group and again across representative workflows in both themes and responsive widths.

**Tech Stack:** React 18, TypeScript 6, Vite 8, Tailwind CSS 4, React Router 6, Zustand, i18next, Oxlint.

## Global Constraints

- Keep all work local; do not push to GitHub or trigger Vercel/Railway deployments.
- Preserve routes, API contracts, authentication, permission checks, translations, state management, and business logic.
- Support both light and dark themes with the same hierarchy and behavior.
- Use the approved deep-teal/clear-blue professional direction, 12–18 px radii, restrained shadows, and generous spacing.
- Do not invent dashboard metrics that the backend does not provide.
- Maintain visible focus, adequate hit areas, contrast, responsive behavior, and reduced-motion support.
- Add no UI framework or icon dependency unless the existing code cannot express a required element.

---

### Task 1: Theme Foundation and Visual Primitives

**Files:**
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/App.css`
- Modify: `frontend/src/main.tsx`

**Interfaces:**
- Consumes: Existing `data-theme="dark"` behavior from `preferencesStore`.
- Produces: Stable classes `mm-surface`, `mm-card`, `mm-input`, `mm-btn`, `mm-btn-primary`, `mm-btn-danger`, `mm-page-header`, `mm-toolbar`, `mm-table-shell`, and `mm-empty-state`.

- [ ] **Step 1: Record the baseline**

Run:

```bash
cd frontend
npm run lint
npm run build
```

Expected: both commands exit successfully, or any pre-existing failures are recorded before styling begins.

- [ ] **Step 2: Replace the theme token set**

Define exact light and dark tokens in `src/index.css`, including:

```css
:root {
  --bg-page: #eef4f7;
  --bg-panel: #ffffff;
  --bg-elevated: #f8fbfc;
  --border: #d8e4e8;
  --text-primary: #102a32;
  --text-secondary: #3e5961;
  --text-muted: #6b8188;
  --accent: #087f8c;
  --accent-hover: #066b76;
  --accent-soft: #dff4f6;
  --header-bg: #0d2430;
  --danger: #c93c4a;
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 18px;
  --shadow-sm: 0 6px 20px rgb(15 42 50 / 7%);
  --shadow-md: 0 18px 48px rgb(15 42 50 / 12%);
}
```

Mirror every semantic token under `[data-theme='dark']` rather than using page-specific hard-coded colors.

- [ ] **Step 3: Implement shared interaction states**

Add consistent hover, active, focus-visible, disabled, loading, destructive, and reduced-motion rules. Inputs must use `min-height: 44px`; primary buttons must keep white text in both themes; all focusable controls must show a two-pixel accent focus ring.

- [ ] **Step 4: Remove unused Vite starter styling**

Delete the unused `.counter`, `.hero`, `#center`, `#next-steps`, `#docs`, `#spacer`, and `.ticks` rules from `src/App.css`. Keep `App.css` empty or remove its import if no application code uses it.

- [ ] **Step 5: Verify the foundation**

Run:

```bash
npm run lint
npm run build
```

Expected: successful exits with no new warnings.

- [ ] **Step 6: Create a local checkpoint**

```bash
git add frontend/src/index.css frontend/src/App.css frontend/src/main.tsx
git commit -m "style: establish modern theme foundation"
```

Do not run `git push`.

---

### Task 2: Responsive Application Shell

**Files:**
- Modify: `frontend/src/layouts/AppLayout.tsx`
- Modify: `frontend/src/components/Header.tsx`
- Modify: `frontend/src/components/Sidebar.tsx`

**Interfaces:**
- Consumes: Theme primitives from Task 1 and existing auth/preferences stores.
- Produces: Responsive shell with desktop sidebar and compact mobile navigation; no store or route API changes.

- [ ] **Step 1: Add local responsive menu state**

In `Header.tsx`, introduce `menuAberto: boolean` controlled through props from `AppLayout`. The header must continue to call the same `alternarTema`, `setIdioma`, and `logout` functions.

- [ ] **Step 2: Rebuild the shell spacing**

Change `AppLayout` to a full-height shell with a sticky header, a desktop grid of approximately `260px minmax(0, 1fr)`, a comfortable `max-w-[1480px]`, and `24–32px` page padding on desktop. Mobile must use `16px` padding.

- [ ] **Step 3: Modernize the header**

Group brand, language, theme, user identity, logout, and mobile navigation controls. Replace raw text density with compact pill controls and accessible `aria-label` values. Preserve all current text through `t(...)`.

- [ ] **Step 4: Modernize the sidebar**

Use one navigation item definition array and render `NavLink` items with a clear icon-free marker, label, and active state. Keep the admin route conditional on `usuario?.role === 'admin'`. Hide the desktop sidebar below the medium breakpoint and expose the same links in the mobile panel.

- [ ] **Step 5: Verify navigation**

Run the frontend locally and check `/home`, `/materials`, `/typical-details`, `/projects`, and `/admin/users-access` for authorized users. Confirm logout, theme, and language controls still call their original handlers.

- [ ] **Step 6: Create a local checkpoint**

```bash
git add frontend/src/layouts/AppLayout.tsx frontend/src/components/Header.tsx frontend/src/components/Sidebar.tsx
git commit -m "style: modernize responsive application shell"
```

Do not run `git push`.

---

### Task 3: Shared Tables, Modals, and Feedback

**Files:**
- Modify: `frontend/src/components/GenericTable.tsx`
- Modify: `frontend/src/components/Modal.tsx`
- Modify: `frontend/src/contexts/ToastContext.tsx`
- Modify: `frontend/src/index.css`

**Interfaces:**
- Consumes: Existing `GenericTableProps<T>`, `ModalProps`, and toast context API.
- Produces: The same public TypeScript interfaces with modern presentation and accessibility.

- [ ] **Step 1: Preserve public component signatures**

Do not rename `GenericTable`, `Modal`, `useToast`, `mostrarToast`, or any existing prop. This task is presentation-only.

- [ ] **Step 2: Modernize `GenericTable`**

Add a styled table header, 52-pixel minimum row height, hover feedback, clear cell alignment, and an accessible horizontally scrollable wrapper. Render `vazioTexto` inside `mm-empty-state`.

- [ ] **Step 3: Modernize `Modal`**

Add `role="dialog"`, `aria-modal="true"`, a labelled heading id, backdrop click handling that does not close when clicking the panel, Escape-key close handling, a maximum viewport height, and an internally scrollable body.

- [ ] **Step 4: Modernize toast feedback**

Keep success/error behavior intact while adding a clear status accent, rounded elevated surface, readable maximum width, and `role="status"` or `role="alert"` according to severity.

- [ ] **Step 5: Verify shared behavior**

Exercise a list with no rows, a populated list, a confirmation modal, and both success and error toasts. Run:

```bash
npm run lint
npm run build
```

- [ ] **Step 6: Create a local checkpoint**

```bash
git add frontend/src/components/GenericTable.tsx frontend/src/components/Modal.tsx frontend/src/contexts/ToastContext.tsx frontend/src/index.css
git commit -m "style: refine tables modals and feedback"
```

Do not run `git push`.

---

### Task 4: Authentication and Home Experience

**Files:**
- Modify: `frontend/src/pages/LoginPage.tsx`
- Modify: `frontend/src/pages/ChangePasswordPage.tsx`
- Modify: `frontend/src/pages/HomePage.tsx`

**Interfaces:**
- Consumes: Existing auth store methods, navigation destinations, translations, and toast behavior.
- Produces: Spacious authentication screens and a navigation-focused home page with no fabricated data.

- [ ] **Step 1: Modernize login without changing submission**

Keep the existing `onSubmit`, `login(email, senha)`, error handling, and language switching. Add a branded visual section, clear title/subtitle, grouped fields, and an accessible loading label instead of only `...`.

- [ ] **Step 2: Match password-change presentation**

Apply the same authentication shell to `ChangePasswordPage`. Preserve password validation, navigation, logout, and all handlers.

- [ ] **Step 3: Rebuild the home hierarchy**

Create a welcoming hero and four spacious action cards for materials, typical details, projects, and documents. Use the current routes and descriptions; do not display counts.

- [ ] **Step 4: Verify authentication and home**

Test invalid login feedback, successful login navigation, required password-change flow, light/dark theme rendering, and keyboard tab order.

- [ ] **Step 5: Create a local checkpoint**

```bash
git add frontend/src/pages/LoginPage.tsx frontend/src/pages/ChangePasswordPage.tsx frontend/src/pages/HomePage.tsx
git commit -m "style: modernize authentication and home"
```

Do not run `git push`.

---

### Task 5: Materials and Typical Details

**Files:**
- Modify: `frontend/src/pages/MaterialsPage.tsx`
- Modify: `frontend/src/pages/MaterialFormPage.tsx`
- Modify: `frontend/src/pages/MaterialDetailPage.tsx`
- Modify: `frontend/src/pages/TypicalDetailsPage.tsx`
- Modify: `frontend/src/pages/TypicalDetailsGalleryPage.tsx`
- Modify: `frontend/src/pages/TypicalDetailFormPage.tsx`
- Modify: `frontend/src/pages/TypicalDetailDetailPage.tsx`

**Interfaces:**
- Consumes: Existing material/detail services, permission hook, modal/table components, routes, and translations.
- Produces: Consistent catalogue list, form, gallery, and detail layouts with unchanged service calls.

- [ ] **Step 1: Standardize list-page headers and toolbars**

Apply `mm-page-header` and `mm-toolbar` to materials and typical details. Separate title, primary creation action, search/filter controls, results, and pagination. Preserve every existing handler and permission condition.

- [ ] **Step 2: Standardize forms**

Group identity, translated content, variants/BOM, and attachment fields into labelled cards. Convert language toggles into a consistent tab strip with `aria-selected`. Keep payload construction unchanged.

- [ ] **Step 3: Standardize detail and gallery pages**

Use summary cards, section headings, metadata grids, and consistent action groups. Gallery items must use responsive card widths and retain the same links and attachment behavior.

- [ ] **Step 4: Verify catalogue workflows**

Exercise search, pagination, create/edit navigation, variant modal, translated tabs, permission-hidden actions, gallery links, and detail loading. Run lint and build.

- [ ] **Step 5: Create a local checkpoint**

```bash
git add frontend/src/pages/MaterialsPage.tsx frontend/src/pages/MaterialFormPage.tsx frontend/src/pages/MaterialDetailPage.tsx frontend/src/pages/TypicalDetailsPage.tsx frontend/src/pages/TypicalDetailsGalleryPage.tsx frontend/src/pages/TypicalDetailFormPage.tsx frontend/src/pages/TypicalDetailDetailPage.tsx
git commit -m "style: modernize material and detail catalogues"
```

Do not run `git push`.

---

### Task 6: Projects and Document Workspaces

**Files:**
- Modify: `frontend/src/pages/ProjectsPage.tsx`
- Modify: `frontend/src/pages/ProjectFormPage.tsx`
- Modify: `frontend/src/pages/ProjectDocumentsWorkspacePage.tsx`
- Modify: `frontend/src/pages/DocumentsPage.tsx`
- Modify: `frontend/src/pages/DocumentsBalancePage.tsx`
- Modify: `frontend/src/pages/DocumentDetailPage.tsx`

**Interfaces:**
- Consumes: Existing project/document services, route state, permission checks, item forms, and calculations.
- Produces: Modern project, workspace, document-detail, and balance layouts with unchanged calculations and mutations.

- [ ] **Step 1: Modernize project list and form**

Apply the common page header, toolbar, table, pagination, and grouped form-card patterns. Preserve project filtering and role-dependent actions.

- [ ] **Step 2: Modernize the document workspace**

Make project context visible in a summary header. Present document-type navigation as accessible tabs or segmented controls, keep actions aligned, and allow document cards/tables to use the full content width.

- [ ] **Step 3: Modernize document detail**

Separate document identity, item-entry controls, line-item table, and total summary. Keep `totalDocumento`, item mutations, and permission visibility unchanged.

- [ ] **Step 4: Modernize balance view**

Give the wide comparison table a sticky first column where practical, clear numeric alignment, controlled horizontal scrolling, and a visible spread column.

- [ ] **Step 5: Verify project/document workflows**

Exercise project search, create/edit, workspace tabs, item addition/removal, totals, back navigation, balance calculations, and permission restrictions. Run lint and build.

- [ ] **Step 6: Create a local checkpoint**

```bash
git add frontend/src/pages/ProjectsPage.tsx frontend/src/pages/ProjectFormPage.tsx frontend/src/pages/ProjectDocumentsWorkspacePage.tsx frontend/src/pages/DocumentsPage.tsx frontend/src/pages/DocumentsBalancePage.tsx frontend/src/pages/DocumentDetailPage.tsx
git commit -m "style: modernize projects and document workspaces"
```

Do not run `git push`.

---

### Task 7: Administration, Responsive QA, and Final Local Verification

**Files:**
- Modify: `frontend/src/pages/AdminUsersAccessPage.tsx`
- Modify: `frontend/src/index.css`
- Modify only if a discovered visual inconsistency requires it: files changed in Tasks 1–6

**Interfaces:**
- Consumes: All modernized patterns and existing admin service behavior.
- Produces: Finished full-frontend redesign verified locally with no deployment.

- [ ] **Step 1: Modernize administration**

Separate page title, new-user form, search/filter toolbar, user table, pagination, audit note, delete confirmation, and temporary-password modal. Preserve role changes, project permissions, creation, deletion, copying, and all loading states.

- [ ] **Step 2: Run static verification**

```bash
cd frontend
npm run lint
npm run build
```

Expected: both commands exit zero.

- [ ] **Step 3: Start the local application**

```bash
npm run dev -- --host 127.0.0.1
```

Use the existing local `.env` API configuration. Do not alter `.env.production`.

- [ ] **Step 4: Perform desktop visual QA**

At approximately 1440×900, inspect login, home, one list, one form, one detail page, project documents workspace, a modal, and admin access in both themes. Confirm comfortable spacing and no compressed toolbar controls.

- [ ] **Step 5: Perform mobile visual QA**

At approximately 390×844, verify header controls, mobile navigation, forms, cards, modal height, table scrolling, and absence of page-level horizontal overflow.

- [ ] **Step 6: Perform behavior smoke tests**

Confirm login failure/success, logout, language switch, theme persistence, protected route behavior, list search, pagination, form submission, modal close, project/document navigation, and permission-hidden actions.

- [ ] **Step 7: Fix only verified regressions**

For each discovered issue, reproduce it, make the smallest local CSS/markup correction, and rerun the affected check plus lint/build.

- [ ] **Step 8: Create the final local checkpoint**

```bash
git add frontend/src
git commit -m "style: complete MM System frontend modernization"
git status --short
```

Expected: only intentionally uncommitted local files remain. Do not run `git push`, Vercel CLI, Railway CLI, or any deployment command.
