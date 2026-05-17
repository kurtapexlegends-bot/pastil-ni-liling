# Pastil ni Liling Web Application Specification

## Project Overview
Development of an integrated web application for retail e-commerce and franchise operations management. The platform facilitates direct-to-consumer sales of pastil, bagoong, and chili oil, alongside workflows for franchise application intake and active franchise inventory procurement.

## Design and Styling Parameters
- **Primary Color Palette:** Green (referencing the banana leaf motif) and Yellow (referencing the primary logo typography).
- **Typography:** Readable sans-serif for body text. Bold, stylized typography for headers to match the established brand identity.
- **Visual Assets:** Prominent integration of the brand logo featuring the chef mascot. High-resolution product photography for pastil variants and bottled items.

## Consumer Retail Interface
- **Landing Page:** Hero section featuring top-selling pastil variants. Call-to-action buttons directing users to the retail catalog and franchise inquiry pages.
- **Product Catalog:** Grid layout displaying retail items. Required data fields include product name, price, description, and "Add to Cart" functionality. Filtering controls for categories (Pastil, Bagoong, Chili Oil).
- **Cart and Checkout Operations:** Session management for selected items. Input fields for delivery address and payment method selection. Order summary calculation including conditional delivery fees based on location.
- **Franchise Inquiry Portal:** Informational section detailing franchise requirements. Secure intake form collecting applicant name, contact details, proposed geographic location, and financial capacity parameters.

## Franchise Operations Portal
- **Operator Authentication:** Secure login gateway for approved franchisee accounts.
- **Commissary Procurement:** Order interface for franchisees to request bulk supplies, packaging, and raw materials from the central administrative entity.
- **Localized Reporting:** Aggregation of local branch transaction data and inventory depletion rates.

## Central Administration Operations
- **Inventory Control:** CRUD interface for updating product availability, global pricing, and catalog descriptions.
- **Transaction Fulfillment:** Data table view of incoming consumer orders. Controls to modify order status (Pending, Processing, Dispatched, Completed).
- **Franchise Application Processing:** Queue for reviewing submitted franchise inquiries. Controls for approval, rejection, and account provisioning workflows.

## Database Entity Architecture

### Users
- Unique ID
- Name
- Email
- Password Hash
- Role (Admin, Franchisee, Customer)
- Timestamps

### Products
- Unique ID
- Name
- Category
- Price
- Description
- Stock Quantity
- Image URL

### Orders
- Unique ID
- User ID
- Total Amount
- Status
- Shipping Address
- Payment Method

### Order_Items
- Unique ID
- Order ID
- Product ID
- Quantity
- Price at Purchase

### Franchise_Applications
- Unique ID
- Applicant Name
- Email
- Phone
- Proposed Location
- Status (Pending, Under Review, Approved, Rejected)

## Technical Architecture (Initial Recommendation)

### Frontend Presentation
- **Framework:** Next.js (React) - Priority for SEO and SSR.
- **Styling:** Tailwind CSS - Rapid UI development with brand palette.

### Backend & Authentication
- **Framework:** Laravel 12 (Headless API)
- **Authentication:** Laravel Sanctum (SPA Authentication)
- **Role Management:** Spatie Laravel-Permission (Admin, Franchisee, Customer)

### Database Architecture
- **Engine:** MySQL (Local) / PostgreSQL (Production)
- **Migrations:** Strict additive migration policy (no `migrate:fresh`)
