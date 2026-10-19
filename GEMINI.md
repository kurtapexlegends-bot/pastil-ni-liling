# Gemini Project Rules: Pastil ni Liling

> **Core Philosophy:** Direct, disciplined, high-signal engineering. Deliver production-grade code, preserve multi-tenant hub boundaries, eliminate conversational waste, avoid over-engineering, and prioritize production reliability over speculative complexity.

---

## 1. Zero Fluff, Production Focus & Anti-Over-Engineering
- **Direct Communication:** Start immediately with the answer or action. No pleasantries, apologies, robotic confirmations, or conversational filler.
- **Production Focus & Anti-Over-Engineering:** Prioritize shipping reliable, production-tested solutions over theoretical abstractions (KISS & YAGNI). Do not introduce premature optimizations, unnecessary architectural layers, or unprompted dependencies when standard Laravel and Next.js primitives solve the problem. Build only what is needed for production stability and business value.
- **No Lazy Placeholders:** Never use placeholders (e.g., `// TODO`, `/* implement later */`, `...rest of code...`). Always provide complete, working, and syntactically valid implementations.
- **Clickable File & Symbol Links:** Format all referenced files and code symbols as clickable markdown links (e.g., `[OrderService.php](file:///c:/laragon/www/Pastil%20ni%20Liling/backend/app/Services/OrderService.php)` or [`OrderService`](file:///c:/laragon/www/Pastil%20ni%20Liling/backend/app/Services/OrderService.php#L15-L40)).
- **Scope Discipline:** Focus strictly on the assigned task. Never perform unsolicited refactoring, reformatting, or dependency changes on adjacent files.
- **Trade-offs Before Code:** State the core architectural rationale and trade-offs in 1–2 bullet points before executing structural changes.

---

## 2. Technology Stack & Directory Conventions

### Backend (Laravel 13 & PHP 8.3+)
- **Location:** `backend/`
- **Authentication & RBAC:** Laravel Sanctum + Spatie Permission (`spatie/laravel-permission`).
- **Architecture:** Headless REST API.
  - **Controllers:** Slim orchestrators only (maximum 50 lines per method). Grouped by functional namespace under `app/Http/Controllers/{Admin, Analytics, Auth, Compliance, Franchise, Payroll}`.
  - **Service Layer:** Encapsulate all business logic, calculations, batching, and side-effects in `app/Services/` (e.g., `OrderService`, `CommissaryOrderService`, `AnalyticsService`, `PayrollService`).
  - **Request Validation:** Strict validation inside dedicated `app/Http/Requests/` classes. Never validate directly inside controller methods.
  - **Analytics Cache:** Utilize `InvalidatesAnalyticsCache` trait on mutating models to ensure real-time reporting accuracy.

### Frontend (Next.js 16, React 19, Tailwind CSS v4)
- **Location:** `frontend/`
- **Routing:** Next.js App Router (`frontend/app/`).
- **Icons:** Phosphor Icons (`@phosphor-icons/react`). Strictly ban inline or decorative emojis.
- **Data Fetching:** SWR (`swr`) for client-side state and caching; Sonner (`sonner`) for toast notifications.
- **Componentization Limits:** Keep component files modular and under 500 lines. Group components strictly by domain inside `frontend/components/{admin, consumer, franchise, layout, ui}`. Never place large feature orchestrators loose at domain roots.
- **Path Aliases:** Use absolute aliases (`@/components/...`, `@/lib/...`, `@/types/...`).

### Production Hosting & Deployment Topology
- **Frontend (`frontend/`):** **Deploy on Vercel**. First-class support for Next.js 16 App Router, edge caching, serverless SSR, and automatic image optimization.
- **Backend (`backend/`):** **Deploy on Managed Server / VPS / Container** (e.g., Laravel Forge, Railway, Render, Fly.io, or DigitalOcean). Laravel requires persistent PHP 8.3 FPM processes, database connection pooling, persistent background queue workers (`php artisan queue:work`), and scheduled tasks. Never attempt to force-bundle stateful Laravel operations into Vercel serverless functions.

---

## 3. Domain & Business Logic Rules

### Multi-Tenant Hub Architecture
- The system operates as a multi-tenant franchise network. Branches are designated as **Hubs** (`Hub`).
- **User Roles:**
  - `Super Admin`: Global HQ operations, system-wide analytics, franchise application approvals, master product catalog.
  - `Franchise Partner`: Branch owner bound to a specific `hub_id`. Manages commissary procurement, branch staff, local expenses, and hub net sales.
  - `Branch Cashier`: Operates local POS bound to a specific `hub_id`. Records walk-in and delivery sales; logs micro-expenses.
  - `Customer`: Direct-to-consumer online store shopper.
- **Strict Query Scoping:** Every Eloquent query executed for a Franchise Partner or Cashier **must be scoped by `hub_id`**. Never leak cross-hub orders, expenses, or inventory batches.

### POS & Multi-Channel Transactions
- **Supported Channels:**
  - `walk_in`: Local physical counter orders (Cash, GCash).
  - `grab` & `foodpanda`: Delivery aggregators with external reference tracking.
  - `shopee` & `tiktok`: Social commerce order logging for bottled pastil jars.
  - `e_commerce`: Direct consumer web checkout.
- **Offline Resilience & Anomaly Tracking:** All POS batch syncs must validate idempotency and log conflicting or out-of-order records into `PosSyncAnomaly` rather than silently dropping data.

### Financial Controls & Net Sales Formula
- **Net Sales Calculation:**
  $$\text{Net Sales} = \text{Gross POS \& Online Revenue} - \text{Recorded Operational Expenses}$$
- Dynamic expense categorization: `materials`, `utilities`, `rent`, `salary`, `marketing`, `logistics`, `other`.
- Central HQ expenses (`hub_id = null`) apply to nationwide reports; branch expenses apply to local hub net calculations.

### Commissary & Inventory Batching
- Franchisees order supplies and packaging through `CommissaryOrder`.
- Inventory depletion and stock deductions must route through `InventoryBatchService` with FIFO or batch-level traceability.

---

## 4. UI/UX Design & Brand Tokens (Anti- "AI Slop")

### High-Level Aesthetic
- Clean, minimalist, modern Filipino heritage aesthetic.
- Prioritize whitespace, clear visual hierarchy, and balanced proportions. Avoid oversized elements or heavy clutter.
- Mobile-first layouts: All POS and retail interfaces must be fully responsive, touch-optimized (minimum 44px tap targets, 16px font-size on inputs to prevent mobile browser zoom).

### Brand Color Tokens (Defined in `frontend/app/globals.css`)
| Token | Hex Value | Name / Role |
| :--- | :--- | :--- |
| `--background` | `#fcfaf6` | Steamed Jasmine White |
| `--foreground` | `#171211` | Mindanao Charcoal |
| `--brand-green` | `#7ca33a` | Young Sprout Lime |
| `--brand-yellow` | `#d1a340` | Toasted Garlic Gold |
| `--brand-earth` | `#1b2d16` | Banana Leaf Dark |
| `--brand-red` | `#a82e1a` | Toasted Chili Red |
| `--brand-gray` | `#efebe4` | Steamed Rice Bone Gray |

### Typography
- **Body & Controls:** `Plus Jakarta Sans` (`--font-sans`)
- **Display & Headers:** `Outfit` (`--font-display` / `font-display`)

### Anti- "AI Slop" Guardrails
- **No Multi-Color Gradients:** Never apply multi-color gradient border accents or gradient top stripes to cards, modals, or banners (e.g., yellow-to-green-to-brown linear stripes).
- **Zero Decorative Emojis:** Strictly ban emojis in headers, buttons, navigation items, and alerts. Use vector icons from `@phosphor-icons/react`.
- **High-Signal Copy:** Omit redundant helper text and micro-captions under self-explanatory inputs. Use real-world business terms instead of developer variable names.

---

## 5. Database Safety & Data Integrity
- **PERMANENT COMMAND BAN:**
  - `php artisan migrate:fresh` — **PERMANENTLY BANNED**
  - `php artisan migrate:reset` — **PERMANENTLY BANNED**
  - `php artisan db:wipe` — **PERMANENTLY BANNED**
- **Strictly Additive Migrations:** All schema changes must be created via new, non-destructive migration files (`php artisan make:migration`).
- **ACID Transactions:** Wrap all multi-step state mutations (order creation + inventory depletion + payment recording) in `DB::transaction()`.
- **Audit Preservation:** Use soft deletes (`SoftDeletes`) on core business entities (`Order`, `Product`, `Expense`, `Hub`).

---

## 6. Execution & Verification Commands

All shell commands must be written for native **Windows PowerShell**.

### Running the Development Environment
Run both backend (Laravel) and frontend (Next.js) concurrently:
```powershell
.\dev.ps1
```
*If execution policy restricts the script:*
```powershell
PowerShell -ExecutionPolicy Bypass -File .\dev.ps1
```

### Backend Commands (run inside `backend/`)
- **Run tests:**
  ```powershell
  php artisan test
  ```
- **Code formatting (Laravel Pint):**
  ```powershell
  vendor/bin/pint
  ```
- **Create additive migration:**
  ```powershell
  php artisan make:migration add_field_to_table
  ```
- **Run migrations safely:**
  ```powershell
  php artisan migrate
  ```

### Frontend Commands (run inside `frontend/`)
- **Run development server:**
  ```powershell
  npm run dev
  ```
- **Type-check and lint:**
  ```powershell
  npm run lint
  ```
- **Production build check:**
  ```powershell
  npm run build
  ```

---

## 7. Quality Assurance & Deterministic Verification
- **Inspect State First:** Never guess file contents or rely on conversational memory. Always inspect target files prior to edits.
- **Deterministic Verification:** Never declare a task complete or a bug fixed without running terminal verification (`npm run lint`, `npm run build`, or `php artisan test`) and validating exit codes.
- **Preserve Codebase Context:** Keep existing functions, comments, and docstrings intact when modifying existing files.