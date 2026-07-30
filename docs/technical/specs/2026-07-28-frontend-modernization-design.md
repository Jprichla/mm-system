# MM System Frontend Modernization Design

## Objective

Modernize the complete MM System frontend while preserving all routes, business
rules, permissions, API integrations, translations, and existing workflows. The
new interface will follow the approved “professional modern” direction and will
support both light and dark themes.

## Scope

The redesign covers the full React frontend:

- application shell, header, sidebar, and responsive navigation;
- login and password-related screens;
- home page and navigation cards;
- lists, tables, searches, filters, and pagination;
- create and edit forms;
- detail pages, galleries, document workspaces, and balance views;
- administrative access management;
- modals, toasts, empty states, loading states, and error feedback.

The backend, endpoints, authorization rules, route structure, and persisted data
formats remain unchanged.

## Visual Direction

The interface will use a professional corporate palette based on deep teal and
clear blue accents. Surfaces will have restrained shadows, visible but subtle
borders, and rounded corners between 12 and 18 pixels. Layouts will use generous
spacing and readable widths; the compact brainstorming mockup is not a density
target.

Light and dark themes will share the same hierarchy and component behavior.
Theme tokens will define page, panel, elevated surface, border, text, accent,
success, warning, and danger colors, plus radii and shadows.

## Architecture

The implementation will retain React, TypeScript, Vite, Tailwind CSS, React
Router, Zustand, i18next, and the existing service layer. Reusable visual
primitives and global theme tokens will provide a consistent foundation without
introducing another UI framework.

Existing shared components will be modernized first. Pages will then be updated
to use those conventions. This minimizes duplicated styling and avoids changing
working application behavior.

## Application Shell

The header will have a clearer brand area and a visually quieter set of user,
language, theme, and logout controls. The desktop sidebar will use comfortable
spacing and a distinct active state. On smaller screens, navigation will become
compact and remain keyboard accessible.

The content container will use a comfortable maximum width, larger section gaps,
and consistent page headers. It will not squeeze cards or controls into narrow
columns.

## Page Patterns

- Login uses a focused panel, subtle background depth, and strong field states.
- Home uses spacious navigation cards and does not invent backend metrics.
- List pages separate the title, filters, actions, and result table.
- Tables prioritize scanning, row spacing, clear headers, and controlled mobile
  overflow or compact presentation.
- Forms group related fields, use clear labels, and distinguish primary and
  secondary actions.
- Detail and workspace pages organize content into sections, cards, and visible
  tabs.
- Modals use a clear overlay, rounded elevated panel, obvious close control, and
  consistent footer actions.
- Toasts, validation errors, loading states, and empty states preserve current
  behavior while receiving a consistent presentation.

## Responsiveness and Accessibility

The redesign will support desktop, tablet, and mobile widths. Keyboard focus
will remain visible. Controls will have adequate hit areas, text contrast will
be maintained in both themes, and motion will be subtle and respect reduced
motion preferences.

## Error Handling and Data Flow

No API or state-management contracts will change. Existing service calls,
authentication state, permission checks, validation, and toast flows will remain
the source of application behavior. Styling changes must not mask validation
messages, loading indicators, disabled states, or destructive actions.

## Verification

Verification will include:

- lint and TypeScript/Vite production build;
- local frontend startup against the configured backend;
- visual review of login, home, representative list, form, detail, workspace,
  modal, and administration screens;
- checks in light and dark themes;
- checks at desktop and mobile viewport widths;
- confirmation that navigation, forms, permissions, and existing API workflows
  still behave as before.

## Success Criteria

The frontend presents a cohesive, modern, spacious interface across every page;
both themes work consistently; important workflows remain unchanged; the layout
is usable on mobile and desktop; and lint/build verification succeeds.
