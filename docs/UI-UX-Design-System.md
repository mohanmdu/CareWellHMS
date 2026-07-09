# Navjeevan HMS — UI/UX Design System & Frontend Architecture

Companion to [`HMS-Struts-to-Angular-SpringBoot-Migration.md`](./HMS-Struts-to-Angular-SpringBoot-Migration.md) §6.1
("Angular frontend structure"). That document specified the folder layout
(`core/`, `shared/`, `features/`, `layout/`) and named two shared building
blocks up front — a generic `MasterCrudComponent<T>` and a wizard/stepper
base. This document is the concrete design system and component
architecture that fills in that structure: color, type, spacing, the shared
component library, and the page templates every feature screen should
converge on.

Before this pass, `hms-web` had no UI library and no shared components —
every one of its 20 feature screens hand-rolled its own `<table>`, `<form>`,
and status text against ~100 lines of global tag-selector CSS
(`table { ... }`, `.tile { ... }`, etc.). That's the inconsistency this
document (and the code that implements it) addresses.

**Status: fully rolled out.** All 20 feature screens now use this design
system (see §10); there is no remaining bare-HTML/legacy-compat styling
anywhere in the app.

## 1. Foundation choice

**Angular Material 18 + CDK**, themed to the hospital's brand rather than
used out of the box. Rationale: Material's form fields, tables, dialogs,
menus and overlays ship with keyboard navigation, focus trapping and ARIA
wiring already solved — building an equivalently accessible set of
primitives from scratch is a much larger, higher-risk effort for a
clinical system than re-skinning an existing, audited component set.
Custom shared components (page header, stat tile, status badge, the
generic master/detail screen) sit on top for the patterns Material doesn't
provide out of the box.

## 2. Design tokens

Single source of truth: [`src/styles/_tokens.scss`](../hms-web/src/styles/_tokens.scss),
exposed as CSS custom properties (`--hms-*`) so both Material component
styles and hand-written component SCSS read from the same palette.

| Category | Tokens | Notes |
|---|---|---|
| Brand color | `--hms-color-primary` (#0b5fa6, clinical blue), `--hms-color-tertiary` (#0e8074, teal) | Drives the Angular Material theme (see §3) and every custom component |
| Semantic status | `--hms-color-success` / `-warning` / `-danger` / `-info` (+ `-container` tints) | Used by `StatusBadgeComponent` and `StatTileComponent`; never hardcode a status color in a feature component |
| Neutrals | `--hms-color-surface`, `-surface-alt`, `-surface-sunken`, `-border`, `-text`, `-text-muted` | Page/card backgrounds and body text |
| Typography | `--hms-font-family` (system font stack — no external font download required), `--hms-font-size-xs…3xl`, weight tokens | No custom font is loaded for body text, so the app has no network dependency for its primary typeface |
| Spacing | `--hms-space-1` (4px) … `--hms-space-12` (48px) | 4px base scale; always prefer a token over a raw px value |
| Radius / elevation | `--hms-radius-sm/md/lg/full`, `--hms-shadow-sm/md/lg` | |
| Layout | `--hms-shell-header-height`, `--hms-shell-sidenav-width`, `--hms-content-max-width` (1440px) | |

Breakpoints are SCSS variables (`$hms-bp-mobile: 599px`, `$hms-bp-tablet: 959px`)
matching Angular CDK's `Breakpoints.Handset`/`.Tablet`, so `@media` queries
in component SCSS and `BreakpointObserver` checks in TypeScript agree.

## 3. Theming

[`src/styles/_theme.scss`](../hms-web/src/styles/_theme.scss) builds a
Material M3 theme via `mat.define-theme()` using the `azure` (primary) and
`cyan` (tertiary) M3 palettes — the closest built-in match to the brand
tokens above — with a `-1` density (a hospital back-office screen is
mouse/keyboard-driven and data-dense; full comfortable density wastes
vertical space). `src/styles.scss` includes `mat.core()` and
`mat.all-component-themes()` once, globally; **no feature component should
`@include` Material theme mixins itself.**

To retint the app (e.g. a different hospital brand), change the palette
names and the matching hex values in `_tokens.scss` — everything else
(shared components, Material chrome) follows from those two files.

## 4. Component architecture

```
src/app/
  layout/
    app-shell/            AppShellComponent — responsive sidenav + toolbar + user menu.
                           Rendered as the routed component for every authenticated
                           route (see app.routes.ts); /login sits outside it.
    nav-config.ts          Grouped nav model consumed by the shell.
  shared/
    ui/
      page-header/         Title + subtitle + projected action buttons. Every
                            feature page opens with this instead of a bare <h2>.
      empty-state/         Standard "nothing here yet" panel for empty tables.
      stat-tile/            KPI tile (icon/value/label/tone) for dashboards.
      status-badge/         Semantic pill (Active/Inactive, invoice/claim status, ...).
      confirm-dialog/       Generic Material yes/no confirm dialog.
      prompt-dialog/         Generic 1-N field input dialog (see below).
      patient-search/        Search-by-name patient picker (see below).
    services/
      notification.service.ts     Success/error snackbar helpers.
      confirm-dialog.service.ts   Opens ConfirmDialogComponent, returns Observable<boolean>.
      prompt-dialog.service.ts    Opens PromptDialogComponent, returns Observable<Values | undefined>.
    master-crud/
      master-crud.model.ts        MasterCrudConfig<T> contract.
      master-crud.component.ts    Generic list + inline add + deactivate screen
                                   for any { id, name, active } entity. Supports an
                                   `[embedded]="true"` mode (no outer page wrapper/H1)
                                   for composition inside a larger page - see Billing
                                   Catalog's two-column layout.
  features/…                       Unchanged feature module boundaries.
```

Two shared components were added during the full rollout (§10) once the same
patterns showed up in enough screens to justify extracting them, rather than
being built speculatively up front:

- **`PatientSearchComponent`** — every workflow that starts against a patient
  (invoicing, lab requisitions, pharmacy dispense, IP admission, insurance
  claims, appointment booking) had hand-rolled an identical search-by-name
  form + result list. Parents mount it only while no patient is selected and
  remove it once one is (`@if (!selectedPatient()) { <app-patient-search .../> }`),
  which resets its internal state for free instead of needing an explicit
  `reset()` method.
- **`PromptDialogComponent` / `PromptDialogService`** — replaces every
  remaining `prompt()` call in the app (cancellation/rejection reasons,
  approved amounts, discharge figures, lab result entry) with one
  accessible, focus-trapped Material dialog taking a declarative list of
  fields (`{ key, label, type: 'text' | 'number' | 'textarea', required, min }`)
  instead of a bespoke dialog component per screen.

Import shared components by relative path (`../../../shared/ui/...`); there
is no barrel `index.ts` re-exporting everything, so unused components are
tree-shaken and it stays obvious where each import comes from.

## 5. Page templates

Every feature screen is one of four shapes. Pick the matching template
instead of inventing a new layout:

### 5.1 Simple master list (name + active only)

Use `<app-master-crud [config]="config" />` directly — see
`features/masters-admin/departments/department-list.component.ts` and
`.../roles/role-list.component.ts`. Total component code for a new entity
of this shape is the `MasterCrudConfig<T>` object (title, entity label, the
three service calls, three field accessors) — no template, no table
wiring, no dialog wiring.

### 5.2 Richer master/worklist (extra fields, still list + form + status)

Hand-built screen, but composed from the same primitives: `<app-page-header>`,
a `.hms-card-surface` for the form (`mat-form-field` grid via `.hms-form-grid`),
a `mat-table` with `<app-status-badge>` in the status column, `ConfirmDialogService`
before any destructive action, `NotificationService` for success/error
feedback instead of an inline `<p class="error">`. Reference:
`features/masters-admin/consultants/consultant-list.component.*`.

### 5.3 Multi-step / line-item entry (wizards, invoice/requisition creation)

`<app-page-header>` + sectioned `.hms-card-surface` cards for each logical
step (`<app-patient-search>` → line items → totals), a `mat-table` for the
in-progress line items, running total pinned at the bottom. Reference:
`features/billing-receipts/invoices/invoice-create.component.*` (and the
same shape in `lab-radiology/requisitions/requisition-create` and
`pharmacy/sales/sale-create`). For screens with strictly sequential, gated
steps (not these — patient search and item entry are two panels, not a
gate), use Angular Material's `MatStepper` instead of stacked cards, as in
`appointments/booking/booking-wizard.component.*`.

### 5.4 Dashboard / summary

`<app-page-header>` + a CSS grid of `<app-stat-tile>`. Reference:
`features/reports-mis/dashboard/dashboard.component.*`.

### 5.5 Expandable table rows (detail-in-place, e.g. a receipt under its invoice)

`mat-table` with `multiTemplateDataRows`, two `*matRowDef` templates over
the same data source (main row + a full-width detail row), toggled by a
component-level signal and a CSS `max-height` transition — no extra HTTP
call, no navigation. Reference: `invoice-list.component.html` and
`pharmacy/sales/sale-list.component.html` (identical recipe, different
data). Reuse this for any future worklist that needs "expand for detail"
rather than inventing a new one.

## 6. Navigation

`AppShellComponent` replaces the old always-expanded, ungrouped nav bar
(every one of 17 links in a single flat row) with:
- Grouped `mat-nav-list` (Overview, Registration & Appointments, Billing &
  Insurance, Lab & Radiology, Pharmacy, IP Admission, Masters & Admin),
  defined in `layout/nav-config.ts`.
- `mode="side"` sidenav on desktop, `mode="over"` (auto-closing) below the
  CDK `Handset` breakpoint, toggled from the toolbar's menu button.
- A user menu (previously missing entirely) with a working **Sign out**
  action.
- A skip-to-content link and a landmark `<main id="main-content">` for
  keyboard/screen-reader users.

## 7. Forms, tables, dialogs — conventions

- **Forms**: `mat-form-field appearance="outline"`, one `<mat-label>` per
  field (never a placeholder-only field — placeholders disappear on focus
  and fail accessibility guidance), grouped in `.hms-form-grid` for
  multi-field forms so fields wrap responsively.
- **Tables**: `mat-table` over a plain array (no `MatTableDataSource`
  needed for read-only, non-sortable lists); status columns always use
  `<app-status-badge>`; destructive row actions always go through
  `ConfirmDialogService`, never a bare `(click)` handler.
- **Feedback**: `NotificationService.success()/.error()` snackbars for
  transient feedback. No feature component should render its own
  `<p class="error">` banner or call `confirm()`/`prompt()` — both were
  present throughout the pre-redesign code (cancellation reasons, approved
  amounts, discharge figures, lab results all used `prompt()`) and neither
  is accessible or stylable. Zero native `confirm()`/`prompt()` calls remain
  anywhere in the app.
- **Dialogs**: `ConfirmDialogService.confirm({ title, message, destructive })`
  for yes/no confirmations; `PromptDialogService.prompt({ title, fields, destructive })`
  for anything that also needs to capture input (a reason, an amount, a
  multi-field result entry) — see §4 for the field contract. Don't add a
  new bespoke dialog component for an input-capturing confirmation; extend
  `PromptDialogField`'s `type` union if a genuinely new input shape is
  needed. An entity with real per-field validation and typed dropdowns
  (not just 1-N generic text/number fields) still gets its own dedicated
  dialog component - see `PatientFormDialogComponent`, which is reused for
  both Add and Edit (an `isEdit` flag driven by whether `MAT_DIALOG_DATA`
  carries a `patient`) rather than two near-duplicate dialogs.
- **Soft delete**: entities with a restore/permanent-delete lifecycle (not
  just active/inactive toggle) get an `active` flag plus three operations -
  `softDelete`/`restore`/`permanentDelete` - and, where the operation
  history itself matters, an audit log table populated server-side from
  the authenticated principal (`SecurityContextHolder`), not a client-sent
  "who did this" field. See Patient Registration (`features/registration/patients`)
  for the reference shape: an Active/Inactive `mat-tab-group` on one
  screen, a separate Logs screen reading the audit trail.

## 8. Accessibility checklist (apply to every new/migrated screen)

- Every interactive element is a real `<button>`/`<a>`, never a `<div>` with a click handler.
- Every form control has a `<mat-label>` or equivalent associated label.
- Destructive actions are confirmed via `ConfirmDialogService`, which uses
  Material's focus-trapped, `cdkFocusInitial`-directed dialog.
- Color is never the only signal — `<app-status-badge>` pairs color with a
  text label; icons in the nav always carry `aria-hidden="true"` alongside
  a visible text label.
- Keyboard focus is visible everywhere (`:focus-visible` outline in
  `_base.scss`) and a skip link is the first tab stop on every page.

## 9. Responsive behavior

- Sidenav collapses to an overlay below 599px (CDK `Breakpoints.Handset`).
- `.hms-page` centers content up to `--hms-content-max-width` (1440px) and
  the shell's `<main>` padding drops from `--hms-space-6` to `--hms-space-4`
  under 599px.
- Tables scroll horizontally within their own card (`overflow-x: auto`) on
  narrow viewports rather than squeezing columns or breaking page layout.

## 10. Rollout status

All 20 feature screens are migrated. `src/styles/_legacy-compat.scss` (the
interim tokenized re-skin of the old global `table`/`form`/`.tile` rules)
has been deleted now that nothing depends on it — do not reintroduce bare,
unstyled `<table>`/`<form>` markup; every screen below composes the shared
kit.

| Module | Screen | Template (§5) |
|---|---|---|
| Shell | App shell / navigation | — (§6) |
| Auth | Login | — |
| Patient Registration | Patients (Active/Inactive tabs, add/edit dialog) | 5.2 variant with `mat-tab-group` + soft-delete lifecycle (§7) |
| Patient Registration | Logs | New template: flat audit-trail table (S.No/Operation/Patient Name/Date/Created By), no add/edit/delete actions |
| Reports/MIS | Dashboard | 5.4 |
| Masters-Admin | Departments | 5.1 (generic `MasterCrudComponent<T>`) |
| Masters-Admin | Roles | 5.1 (generic `MasterCrudComponent<T>`) |
| Masters-Admin | Consultants | 5.2 |
| Appointments | Appointment list | 5.2 |
| Appointments | Booking wizard | 5.3 (`MatStepper`) |
| Billing | Billing Catalog (categories + items) | 5.1 embedded (categories) + 5.2 (items), two-column |
| Billing | New Invoice | 5.3 |
| Billing | Invoices & Receipts | 5.5 (expandable rows) |
| Lab & Radiology | New Requisition | 5.3 |
| Lab & Radiology | Lab Worklist | Card-per-requisition with a nested `mat-table` (a §5.2/5.5 hybrid — one card per parent record since each has its own item collection, rather than one flat table) |
| Pharmacy | Drugs | 5.2 |
| Pharmacy | Stock / Batches | 5.2 variant with no status column (batches are an append-only ledger; no deactivate concept) |
| Pharmacy | Dispense / Sale create | 5.3 |
| Pharmacy | Pharmacy Sales | 5.5 (expandable rows) |
| IP Admission | Room Catalog (types + rooms) | Hand-built two-column (no deactivate endpoint on either entity, so not `MasterCrudComponent<T>`) |
| IP Admission | IP Admissions | 5.2 |
| Insurance | Insurance Claims | 5.2 |

Master data entities that fit `MasterCrudConfig<T>` (`{ id, name, active }` +
list/create/deactivate) exactly: Departments, Roles, and Billing Categories
(the last embedded in a two-column layout — see §4's `embedded` mode).
Everything else with extra fields or without a deactivate endpoint is
hand-built from the same primitives rather than forced into the generic
component.

## 11. Adding a new simple master entity

1. Model + service as today (`{ id, name, active }` shape, `list/create/deactivate`).
2. In the route's list component, build one `MasterCrudConfig<T>` object (see
   `department-list.component.ts` for the ~15-line reference) and render
   `<app-master-crud [config]="config" />`.
3. No new template, no new table/dialog/snackbar wiring required.

## 12. Follow-ups intentionally out of scope here

- **Self-host the Material Icons font** for fully air-gapped/offline
  hospital network deployments — it currently loads from
  `fonts.googleapis.com` (see `index.html`), the standard approach, but an
  offline deployment should vendor the font file instead.
- **Unit tests** for the shared components (`MasterCrudComponent`,
  `PageHeaderComponent`, `PatientSearchComponent`, `PromptDialogComponent`,
  etc.) — none existed for the pre-redesign components either, but the
  shared components are now load-bearing for every screen in the app and
  are worth covering first, before any individual feature component.
- **Sorting/pagination** for worklists that can grow large in production
  (Invoices, Pharmacy Sales, Lab Worklist, IP Admissions) — `mat-table` is
  wired up plainly today (no `MatSort`/`MatPaginator`); add them once real
  data volumes make an unpaginated list impractical, rather than
  speculatively now.
