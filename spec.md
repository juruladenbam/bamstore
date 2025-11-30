# 1. Functionality & User Stories

Here is the list of requirements from the user's perspective, broken down between Members (Guests) and Admins.

## A. Storefront Features (Member/Guest)

| Module | User Story | Functional Requirements |
| :--- | :--- | :--- |
| **Products & Variants** | As a Member, I can see the [READY STOCK] or [PRE-ORDER] status on every product. | Products must have a clear status badge. |
| **Multi-Recipient Cart** | Members can add products to the cart. If Quantity > 1, they can specify a recipient name for *each* item (e.g., 1 for Ahmad, 1 for Budi). | The cart must handle splitting items by recipient. If Qty is 2 and names are different, they become 2 separate cart lines. |
| **Minimalist Checkout** | Members can complete an order with just Name (Main Orderer), Phone No., and Qobilah. | Mandatory Form: Name (Main Orderer), Phone No. (Format validation), Qobilah (Dropdown). |
| **Qobilah Options** | I must choose one from the available list of Qobilahs. | **Mandatory Option List:**<br>1. QOBILAH MARIYAH<br>2. QOBILAH BUSYRI<br>3. QOBILAH MUZAMMAH<br>4. QOBILAH SULHAN<br>5. QOBILAH SHOLIHATUN<br>6. QOBILAH NURSIYAM<br>7. QOBILAH NI'MAH<br>8. QOBILAH ABD MAJID<br>9. QOBILAH SAIDAH<br>10. QOBILAH THOHIR AL ALY<br>11. QOBILAH ABD. ROHIM (NGAGLIK) |
| **Payment** | Members choose Bank Transfer (show account details) or Cash (show pickup instructions). | The method choice must be recorded in `Order.payment_method`. |
| **Checkout Confirmation** | Before finalizing, Members see a summary dialog to confirm details. | A modal dialog displays Item List, Total, Recipient, and Payment Method for final review. |
| **Order Confirmation** | After success, Members get a link/button to download order details (containing all items, recipient, and total) as an image (PNG). | React Frontend uses an image conversion library for the confirmation element. |
| **Order History** | Members can input Phone No. and view a list of connected orders. Each order can be clicked to view details. | The Backend must return a list of Orders matching the `phone_number`. |
| **Order Activity** | I can view a public order summary and search by name. | Public view only displays Orderer Name (`recipient_name` from `Order_Item`) and product/variant summary, **WITHOUT** displaying Phone Number/Price. |

### Detailed Explanation

| Module | Detailed User Story | Functional Requirements & UI |
| :--- | :--- | :--- |
| **Products & Variants** | Members can select products and multiple variants. Variants are grouped by **Type** (e.g., Size, Color) for easier selection. | The total unit price = Base Price + Sum of all selected variants' adjustments. UI displays variants in grouped sections. |
| **Multi-Recipient Cart** | Members can add products to the cart. If "For Others" is selected with Quantity > 1, the UI must provide input fields for *each* item's recipient. | The cart logic must split these into individual line items if the names differ. |
| **Minimalist Checkout** | Members can complete an order with just Name (Main Orderer), Phone No., and Qobilah. | Mandatory Form: Name (Main Orderer), Phone No. (Format validation), Qobilah (Dropdown). |
 |

### Detailed Explanation

| Module | Detailed User Story | Functional Requirements & UI |
| :--- | :--- | :--- |
| **Products & Variants** | Members can select products and variants (e.g., Size and Color) which affect the final product price in real-time. | The total unit price of the product must update automatically in the React frontend when a variant is selected. |
| **Multi-Recipient Cart** | Members can add products to the cart, selecting "For Myself" (name taken at checkout) or "For Others" (requires Recipient Name input when adding to cart). | The cart must group items based on `recipient_name`. |
| **Minimalist Checkout** | Members can complete an order with just Name (Main Orderer), Phone No., and Qobilah. | Mandatory Form: Name (Main Orderer), Phone No. (Format validation), Qobilah (Dropdown). |
| **Qobilah Options** | I must choose one from the available list of Qobilahs. | **Mandatory Option List:**<br>1. QOBILAH MARIYAH<br>2. QOBILAH BUSYRI<br>3. QOBILAH MUZAMMAH<br>4. QOBILAH SULHAN<br>5. QOBILAH SHOLIHATUN<br>6. QOBILAH NURSIYAM<br>7. QOBILAH NI'MAH<br>8. QOBILAH ABD MAJID<br>9. QOBILAH SAIDAH<br>10. QOBILAH THOHIR AL ALY<br>11. QOBILAH ABD. ROHIM (NGAGLIK) |
| **Payment** | Members choose Bank Transfer (show account details) or Cash (show pickup instructions). | The method choice must be recorded in `Order.payment_method`. |
| **Order Confirmation** | After success, Members get a link/button to download order details (containing all items, recipient, and total) as an image (PNG). | React Frontend uses an image conversion library for the confirmation element. |
| **Order History** | Members can input Phone No. and view a list of connected orders. Each order can be clicked to view details. | The Backend must return a list of Orders matching the `phone_number`. |
| **Order Activity** | I can view a public order summary and search by name. | Public view only displays Orderer Name (`recipient_name` from `Order_Item`) and product/variant summary, **WITHOUT** displaying Phone Number/Price. |

## B. Admin Management Features

| Module | User Story | Functional Requirements |
| :--- | :--- | :--- |
| **Complex Products** | As an Admin, I can manage status (Ready/PO), COGS/Vendor Price, Profit Margin, and variants/modifiers along with their flexible prices and stock. | Detailed product CRUD with dynamic forms for Variants and internal fields for Finance (`Product_Cost`). |
| **Order Management** | As an Admin, I can view, filter (by Qobilah/Status), and change order status (including Cash verification). | Comprehensive Order Status implementation (New, Paid, Processed, Ready for Pickup, etc.). |
| **Vendor & Payment** | As an Admin, I can manage Vendors and record DP, Installment, or Full Payment to them. | CRUD for Vendors and `Vendor_Payment` to track cash outflow. |
| **Member Data** | As an Admin, I can view member data collected from guest orders and utilize it for the auto-complete feature in the frontend. | Automatic population of the `Member_Data_Pool` table from every successful order. |
| **Product Reporting (PO)** | As an Admin, I can create a variant recapitulation report (e.g., total Red T-shirts size M) to be submitted to the Vendor. | The Report must be able to aggregate based on Product and Variant from all Paid Orders. |
| **Financial Reporting** | As an Admin, I can view Cash Flow reports (Order Income vs. Vendor Expenses) and Gross Profit (Gross Sales - COGS). | Reports that pull data from `Order`, `Order_Item`, `Product_Cost`, and `Vendor_Payment`. |

### Detailed Explanation

| Module | Detailed User Story | Functional Requirements & UI (Admin Panel React/Chakra UI) |
| :--- | :--- | :--- |
| **Product Management** | Admins can CRUD Products, manage Vendor Price (COGS) and Profit Margin (internal) fields, and set Status (Ready/PO). | **Implemented:** Support for **Simple Products** (single SKU/Stock) and **Variable Products** (multiple Variants/SKUs). Forms use hybrid validation. |
| **Dynamic Variants** | Admins can add/remove Variant rows dynamically and specify a **Type** (e.g., "Size", "Color") for each variant to group them in the storefront. | Admins input Name, Type, Price Adjustment, and Stock/Quota for each variant. |
| **Order Management** | Admins can filter orders by Qobilah and Status, and can verify Cash and Transfer payments. | "Verify Cash" or "Mark Transfer as Paid" buttons must be available in order details. |
| **Member Data** | Admins can view and export Name, Phone No., Qobilah data collected from all guest orders. This data also becomes the source for Auto-Complete in the frontend. | The `Member_Data_Pool` table is updated automatically when an order status becomes Paid. |
| **Vendor Management** | Admins can CRUD Vendors and record DP, Installment, Full Payment to Vendors, which connects to Financial Reports. | Payment entries must record `amount`, `date`, `type`, and `vendor_id`. |

# 2. Technical Specifications
Split deployment between React Frontend and Laravel Backend on Shared Hosting.

## A. Tech Stack (L.R.M.P)

| Component | Technology Choice | Purpose |
| :--- | :--- | :--- |
| **Backend/API** | Laravel (PHP) | Handles business logic, ORM (Eloquent), authentication (Sanctum/Passport), and API routing. |
| **Frontend/UI** | React 19 | Builds client-side UI for Storefront and Admin Panel. |
| **UI Components** | Chakra UI v3 | Ensures modern design, responsiveness, and accessibility. |
| **Database** | MySQL | Stores all Order, Product, and Financial data. |

## B. Data Structure Details (Critical Tables)

| Table | New/Critical Columns | Data Type | Detailed Description |
| :--- | :--- | :--- | :--- |
| **Product** | `vendor_id`, `status` | FK, Enum | Status: Ready Stock or Pre-Order. |
| **Product_Variant** | `type`, `price_adjustment`, `stock_or_quota` | String, Decimal, Integer | `type` categorizes variants (e.g., "Size"). `stock_or_quota` functions as stock for Ready and quota for PO. |
| **Product_Cost** | `vendor_price_per_unit`, `profit_margin` | Decimal | COGS and Profit per unit (only for Admin/Reports). |
| **Order** | `checkout_name`, `phone_number`, `qobilah` | String, String, String | Stores Main Orderer Name and Qobilah choice. |
| **Order_Item** | `recipient_name`, `unit_price_at_order` | String, Decimal | `recipient_name` is the Recipient Name (either Self or Other). Product price is frozen at order time. |
| **Vendor_Payment** | `amount`, `type` | Decimal, Enum | Type: DP, Installment, Full Payment. Used for Cash Outflow Reports. |
| **Member_Data_Pool** | `name`, `phone_number`, `qobilah`, `order_count` | String, String, String, Integer | Data source for auto-complete and Order Activity. |

## C. Critical API Endpoints (Laravel)

Laravel must provide the following RESTful endpoints (Minimal):

| Endpoint | Method | Description | Authorization |
| :--- | :--- | :--- | :--- |
| **Storefront** | | | |
| `/api/products` | GET | Get product list (Ready/PO). | Public |
| `/api/categories` | GET | Get category list. | Public |
| `/api/checkout` | POST | Process guest order and create entries in Order and Order_Item. | Public |
| `/api/history` | POST | Search order history based on `phone_number`. | Public |
| `/api/order-activity` | GET | Get data for Order Activity (Public). | Public |
| `/api/members/search` | GET | Search for auto-complete (if Phase 3). | Public |
| **Admin - Auth** | | | |
| `/api/admin/login` | POST | Admin Authentication and generate Token. | Public |
| **Admin - Core** | | | |
| `/api/admin/products` | CRUD | Management of products, variants, and internal prices. | Admin (Policy) |
| `/api/admin/categories` | CRUD | Management of categories. | Admin (Policy) |
| `/api/admin/orders` | GET | List all orders (filter by status/qobilah). | Admin (Policy) |
| `/api/admin/orders/{id}` | GET | Specific order details. | Admin (Policy) |
| `/api/admin/orders/{id}/status` | PUT | Update Order Status (including payment verification). | Admin (Policy) |
| `/api/admin/members` | GET | View `Member_Data_Pool` data. | Admin (Policy) |
| **Admin - Vendor & Finance** | | | |
| `/api/admin/vendors` | CRUD | Vendor data management. | Super Admin (Policy) |
| `/api/admin/vendor-payments` | POST | Input payment to vendor (DP/Full). | Super Admin (Policy) |
| `/api/admin/reports/finance` | GET | Generate profit/loss and cash flow reports. | Super Admin (Policy) |
| `/api/admin/reports/recap` | GET | Generate Pre-Order variant recapitulation report. | Admin (Policy) |

## D. Technical Security

1.  **Authentication:** Laravel uses Sanctum or Passport for Bearer Token-based Admin Authentication.
2.  **Authorization:** Implementation of Laravel Gates/Policies to limit Admin endpoint access based on roles (Super Admin vs Order Staff).
3.  **CORS:** Laravel configuration to only allow origins from the React frontend domain (`app.merchandise.org`).
4.  **Validation:** Hybrid approach. Frontend provides immediate feedback (Toasts, visual cues, file size/type checks) while Backend enforces strict data integrity. Frontend parses Backend errors to display human-readable messages.

**Implementation Details:**
*   **API Authentication:** Laravel Sanctum will be used. The React Frontend must store the Bearer Token and send it in the Authorization header for all Admin endpoints.
*   **Authorization:** `Product_Cost`, `Vendor_Payment`, and Financial Reports can only be accessed by the Super Admin role using Laravel Policies.
*   **CORS:** Laravel must be configured to only accept requests from `app.merchandise.org` (or your React subdomain).
*   **Validation:** Phone Number and Qobilah validation must be done on the Laravel server-side.

# 3. Roadmap & Development Strategy Breakdown

This strategy uses an MVP (Minimum Viable Product) approach followed by complex features, considering your hybrid deployment.

## Phase 1: Core MVP
**Goal:** Launch basic e-commerce for guest orders with ready stock products.

| Priority Item | Description |
| :--- | :--- |
| **Basic Data Structure** | Implementation of Category, Product, Product_Variant, Order, Order_Item. |
| **Basic Product CRUD** | Admin can add ready stock products and manage stock/variants. |
| **Checkout Flow** | Fully functional Guest checkout flow (without auto-complete) with Transfer/Cash payment options. |
| **Basic Storefront** | Product list and product detail views. |
| **Basic Order Management** | Admin can view new orders, change status to Paid (manual), and Processed. |
| **UX/UI Feedback System** | Implementation of Toast notifications for success/error states and Dialogs for critical actions (Delete, Confirm Order). |
| **Enhanced Validation** | Frontend file validation (size/type) and human-readable parsing of Backend validation errors. |
| **Hybrid Infrastructure** | Complete split deployment of React + Laravel on Shared Hosting. |

## Phase 2: Complex Features & Advanced Admin
**Goal:** Activate Pre-Order, Order Activity features, and basic reports.

| Priority Item | Description |
| :--- | :--- |
| **Pre-Order Management** | Frontend displays [PRE-ORDER] status. Backend manages quota (`stock_or_quota`). |
| **Cart Modification** | Implementation of "For Myself" vs "For Others" logic in cart (`recipient_name`). |
| **Vendor Management** | Vendor CRUD and recording of `Vendor_Payment` (DP/Installment). |
| **Member Data Collection** | Implementation of automatic population of `Member_Data_Pool` table. |
| **Order Activity Feature** | Implementation of endpoints and frontend for Order Activity. |
| **Image Download** | Integration of `html2canvas` in React for downloading order details. |

## Phase 3: Optimization & Reporting
**Goal:** Security and comprehensive reporting functionality.

| Priority Item | Description |
| :--- | :--- |
| **Financial Reports** | Creation of Gross Profit and Cash Flow Reports in Admin Panel. |
| **Vendor Reports** | Creation of Pre-Order Variant Recapitulation Report ready for export. |
| **Security** | Security review (Rate Limiting, Policy/Authorization). |
| **Auto-Complete** | Implementation of auto-complete from `Member_Data_Pool` in checkout form. |
