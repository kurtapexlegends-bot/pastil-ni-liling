# Project: Pastil ni Liling Repository Overhaul

## Architecture
- **Backend**: Laravel 13 (PHP 8.3+), headless REST API, Sanctum authentication, Spatie Permission RBAC, multi-tenant Hub architecture.
  - **Controllers**: Slim orchestrators (<50 lines per method) in `app/Http/Controllers/{Admin, Analytics, Auth, Compliance, Franchise, Payroll}`.
  - **Service Layer**: Dedicated domain services in `app/Services/`.
  - **Validation**: Strict Form Requests in `app/Http/Requests/`.
  - **Database**: Additive migrations only. Soft deletes on core entities. ACID transactions for multi-step state mutations.
- **Frontend**: Next.js 16 App Router, React 19, Tailwind CSS v4.
  - **Components**: Modular (<500 lines per file) strictly grouped into `frontend/components/{admin, consumer, franchise, layout, ui}`.
  - **Design System**: Brand tokens (`--background`: #fcfaf6, `--foreground`: #171211, `--brand-green`: #7ca33a, `--brand-yellow`: #d1a340, `--brand-earth`: #1b2d16, `--brand-red`: #a82e1a, `--brand-gray`: #efebe4). Fonts: `Plus Jakarta Sans`, `Outfit`.
  - **Icons**: Phosphor Icons (`@phosphor-icons/react`). Zero decorative emojis or makeshift text characters.
  - **Accessibility**: Minimum 44px tap targets, 16px font-size on inputs.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Baseline Compliance Audit | Comprehensive survey of backend controllers, services, queries, and frontend UI | M1 | Survey |
| 2 | Additive Database Migrations | Add `hub_id` to `users`, add `softDeletes()` to `orders`, `products`, `expenses`, `hubs` | M2 | Survey |
| 3 | Model Soft Deletes & Relationships | Update `User`, `Order`, `Product`, `Expense`, `Hub` with `SoftDeletes` and relationships | M2 | Survey |
| 4 | Cache Invalidation Trait | Add `InvalidatesAnalyticsCache` to `ProductIngredient`, `HubInventory`, `Payout` | M2 | Survey |
| 5 | Multi-Tenant Cashier Isolation | Eliminate `Hub::first()` fallback in `FranchiseController`; return 403 on unclocked sessions | M2 | Survey |
| 6 | POS Sync Cashier Support | Support `Branch Cashier` in `syncPOSOrders`, set `cashier_id`, fix commission calculation | M2 | Survey |
| 7 | Cross-Tenant Privacy Controls | Scope `EmployeeController` and `Admin\HubController` queries to franchisee's branch | M2 | Survey |
| 8 | Payroll & Compliance Scoping | Enforce hub authorization checks on `calculatePayout`, `storePayout`, and `ComplianceAudit` | M2 | Survey |
| 9 | Analytics POS Status Fix | Align POS query with `'status' => 'completed'` to correctly compute POS revenue and COGS | M2 | Survey |
| 10 | ACID Transaction Wrapping | Wrap `OrderFulfillmentService::fulfillOrder` and `PayrollController::storePayout` in `DB::transaction()` | M2 | Survey |
| 11 | Form Requests Implementation | Create 15+ dedicated Form Requests in `app/Http/Requests/{Admin, Franchise}` to eliminate inline validations | M3 | Survey |
| 12 | Service Extraction: Settings | Create `WebsiteSettingService` and reduce `WebsiteSettingController` methods to <50 lines | M3 | Survey |
| 13 | Service Extraction: Expenses | Create `ExpenseService` and reduce `ExpenseController` methods to <50 lines | M3 | Survey |
| 14 | Service Extraction: Employees | Create `EmployeeService` and reduce `EmployeeController` methods to <50 lines | M3 | Survey |
| 15 | Slim Franchise Order Fulfillment | Refactor `FranchiseController::updateHubOrderStatus` to <50 lines | M3 | Survey |
| 16 | Frontend ESLint Fixes | Fix all 13 ESLint syntax & render purity errors so `npm run lint` exits with 0 errors | M4 | Survey |
| 17 | Emoji & Symbol Elimination | Replace all decorative emojis (`📢`, `✨`, `🎁`, `🔥`) and makeshift unicode (`✕`, `☰`, `▲`, `▼`, `✓`, `➔`, `+`, `-`, `×`) with `@phosphor-icons/react` | M4 | Survey |
| 18 | Brand Color Token Adherence | Replace hardcoded `bg-[#fafafa]` with `bg-background` (`#fcfaf6`) or `bg-brand-gray` (`#efebe4`) | M4 | Survey |
| 19 | Touch & Mobile Accessibility | Remove conflicting `text-[10px]` on inputs; enforce min 44px tap targets on POS & checkout buttons | M4 | Survey |
| 20 | Frontend Architecture & Modularization | Move `usePayroll.ts` to `hooks/admin/`, decompose large inline pages, standardize `@/` imports | M4 | Survey |
| 21 | Multi-Tenant Test Suite Expansion | Add feature tests for multi-tenant isolation, cashier POS commissions, and compliance | M5 | Survey |
| 22 | Full Quality Gate Verification | Deterministic verification via `php artisan test`, `npm run lint`, `npm run build` | M5 | Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Compliance Audit Synthesis | Complete full-stack audit synthesis and record baseline evidence | none | DONE |
| M2 | Backend Multi-Tenant & Database Overhaul | Additive migrations, soft deletes, hub_id scoping, POS sync fixes, ACID transactions | M1 | DONE |
| M3 | Backend Controller Slimming & Services | Dedicated Form Requests, WebsiteSettingService, ExpenseService, EmployeeService, <50 lines/method | M2 | DONE |
| M4 | Frontend Componentization & Brand Overhaul | ESLint purity fixes, Phosphor icons, brand tokens, touch targets, modularization | M1 | IN_PROGRESS |
| M5 | Quality Gate & Deterministic Verification | Test suite expansion, full artisan test, npm lint, npm build, forensic integrity audit | M2, M3, M4 | PLANNED |

## Interface Contracts
### Multi-Tenant Hub Scoping ↔ Franchise & POS
- Franchisee: `Hub::where('franchisee_id', $user->id)->firstOrFail()`
- Cashier: `$user->hub_id ?? $activeShift->hub_id ?? abort(403, 'No active shift or assigned branch.')`
- Never fallback to `Hub::first()`!

### Order Creation ↔ Cashier Commission
- `Order::create([... 'cashier_id' => $user->hasRole('Branch Cashier') ? $user->id : null, ...])`
- `PayrollService::calculateUserPayout` aggregates `Order::where('cashier_id', $targetUserId)`

### Form Request Contracts
- All admin and franchise endpoints must validate via `app/Http/Requests/...` throwing standard Laravel 422 JSON payloads on validation failure.

## Code Layout
- Backend:
  - `backend/app/Http/Controllers/{Admin, Analytics, Auth, Compliance, Franchise, Payroll}/`
  - `backend/app/Http/Requests/{Admin, Franchise}/`
  - `backend/app/Services/`
  - `backend/app/Models/`
  - `backend/database/migrations/`
  - `backend/tests/Feature/`
- Frontend:
  - `frontend/app/`
  - `frontend/components/{admin, consumer, franchise, layout, ui}/`
  - `frontend/hooks/{admin, ...}/`
  - `frontend/lib/`
