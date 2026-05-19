# Pastil ni Liling Web Application Specification

## Project Overview
Development of an integrated web application for retail e-commerce, multi-channel branch Point-of-Sale (POS) operations, and franchise management. The platform facilitates direct-to-consumer online sales of pastil, bagoong, and chili oil; a robust multi-channel branch POS for local cashiers; centralized expense tracking to compute accurate net sales; and workflows for franchise applications and active franchise procurement.

## Design and Styling Parameters
- **Primary Color Palette:** Green (referencing the banana leaf motif) and Yellow (referencing the primary logo typography).
- **Typography:** Readable sans-serif for body text. Bold, stylized typography for headers to match the established brand identity.
- **Visual Assets:** Prominent integration of the brand logo featuring the chef mascot. High-resolution product photography for pastil variants and bottled items.
- **No Emojis Rule:** Strictly avoid decorative or inline emojis in the user interfaces (headers, buttons, navigation, status indicators) in favor of professional duotone vector icons.

## Consumer Retail Interface
- **Landing Page:** Hero section featuring top-selling pastil variants. Call-to-action buttons directing users to the retail catalog and franchise inquiry pages.
- **Product Catalog:** Grid layout displaying retail items. Required data fields include product name, price, description, and "Add to Cart" functionality. Filtering controls for categories (Pastil, Bagoong, Chili Oil).
- **Cart and Checkout Operations:** Session management for selected items. Input fields for delivery address and payment method selection. Order summary calculation including conditional delivery fees based on location.
- **Franchise Inquiry Portal:** Informational section detailing franchise requirements. Secure intake form collecting applicant name, contact details, proposed geographic location, and financial capacity parameters.

## Multi-Channel Branch POS System
- **Cashier Portal:** Dedicated interface designed for rapid local order recording.
- **Order Input:** Quick selection of products, quantities, and flavor modifiers (e.g. Spicy, Original, Toasted for Pastil Jars).
- **Transaction Channels & Modes:**
  - **Walk-in:** Local orders with payment method tracking (Cash or GCash).
  - **Delivery Integration:** High-speed logging for third-party channels (GrabFood, Foodpanda).
  - **Social Commerce Channel Logging:** Tracking entries for e-commerce hubs like Shopee and TikTok Shop specifically for multi-flavor Pastil Jars.
- **Expense Logging Module:**
  - Interface for cashiers or franchise partners to log daily operational expenses (e.g., ingredients, utilities, rent, packaging, employee salary).
  - Dynamic classification by expense category.

## Franchise & Central Administration Portal
- **Operator Authentication:** Secure login gateway for approved franchisee and cashier accounts.
- **Commissary Procurement:** Order interface for franchisees to request bulk supplies, packaging, and raw materials from the central administrative entity.
- **Financial Controls & Analytics:**
  - Aggregation of local branch transaction data and inventory depletion rates.
  - **Net Sales Intelligence:** Consolidated dashboard calculating Net Sales dynamically (`Gross POS & Online Revenue - Recorded Branch/HQ Expenses`).
- **Inventory Control:** CRUD interface for updating product availability, global pricing, and catalog descriptions.
- **Transaction Fulfillment:** Data table view of incoming consumer orders. Controls to modify order status (Pending, Processing, Dispatched, Completed).
- **Franchise Application Processing:** Queue for reviewing submitted franchise inquiries. Controls for approval, rejection, and account provisioning workflows.

## Role-Based Access Control (RBAC) & Multi-Tenant Hub Architecture
The system employs a strict multi-tenant branch architecture. Users are associated with specific physical franchise branches (Hubs):

- **Super Admin (HQ Operations):** Full global access. Manages products, reviews partner applications, configures all franchise hubs, and analyzes consolidated nationwide sales and expense data.
- **Franchise Partner (Branch Owner):** Associated with a specific branch (`hub_id`). Manages local commissary procurement, oversees branch employee accounts, enters local operational expenses, and views dedicated local branch financial reports.
- **Branch Cashier:** Associated with a specific branch (`hub_id`). Performs local POS transactions (Walk-in, Grab, Foodpanda, Shopee, TikTok Shop) and logs daily micro-expenses under the branch.
- **Customer:** Direct-to-consumer accounts for online catalog orders and purchase history.

---

## Database Entity Architecture

### Users
- Unique ID
- Name
- Email
- Password Hash
- Role (Admin, Franchisee, Cashier, Customer)
- Hub ID (nullable, foreign key referencing Hubs; links Franchisees and Cashiers to their specific branch)
- Timestamps

### Hubs (Franchise Branches)
- Unique ID
- Name
- Franchisee User ID (foreign key referencing Users; the Branch Owner)
- Address
- Status (Active, Inactive)
- Timestamps

### Products
- Unique ID
- Name
- Category (e.g., Pastil, Bagoong, Chili Oil, Pastil Jars)
- Price
- Description
- Stock Quantity
- Image URL
- Timestamps

### Orders / Transactions
- Unique ID
- User ID (nullable for walk-in POS)
- Hub ID (Branch where transaction occurred; links POS sales to the specific branch)
- Channel (walk_in, e_commerce, grab, foodpanda, shopee, tiktok)
- Total Amount
- Status (Pending, Completed, Dispatched, Cancelled)
- Shipping Address (nullable for walk-in POS)
- Payment Method (cash, gcash, grab_pay, foodpanda_pay, cod, online_card)
- Timestamps

### Order_Items
- Unique ID
- Order ID
- Product ID
- Quantity
- Flavor Modifier (e.g., Spicy, Original, Toasted - nullable)
- Price at Purchase
- Timestamps

### Expenses
- Unique ID
- Hub ID (nullable if central HQ expense; links operational expenses directly to the specific branch)
- Category (materials, utilities, rent, salary, marketing, logistics, other)
- Amount
- Date
- Description
- Timestamps

### Franchise_Applications
- Unique ID
- Applicant Name
- Email
- Phone
- Proposed Location
- Status (Pending, Under Review, Approved, Rejected)
- Timestamps

## Technical Architecture

### Frontend Presentation
- **Framework:** Next.js (React) - Priority for SEO, SSR, and dynamic admin dashboard views.
- **Styling:** Vanilla CSS & Tailwind CSS utility system - Rapid UI development with custom brand theme tokens.

### Backend & Authentication
- **Framework:** Headless REST API
- **Database Architecture:** MySQL (Local) / PostgreSQL (Production)
- **Migrations:** Strict additive migration policy (never run `migrate:fresh` or `db:wipe` on active servers).
