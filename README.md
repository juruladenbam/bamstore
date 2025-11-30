# BAM Store

BAM Store is a modern e-commerce platform designed for managing merchandise sales (Ready Stock & Pre-Order) for the BAM Festival. It features a split-deployment architecture with a React frontend and a Laravel backend.

## 🚀 Tech Stack

*   **Frontend:** React 19, Chakra UI v3, Vite, TypeScript.
*   **Backend:** Laravel 12 (PHP 8.2+), MySQL/SQLite.
*   **Architecture:** REST API (Sanctum Auth).

## ✨ Key Features

### Storefront (Member/Guest)
*   **Product Catalog:** Browse products with clear [READY STOCK] or [PRE-ORDER] status.
*   **Variable Products:** Support for products with multiple variants (Size, Color, etc.) and dynamic pricing.
*   **Multi-Recipient Cart:** Add items for yourself or different recipients in a single cart.
*   **Minimalist Checkout:** Simple checkout process requiring only Name, Phone Number, and Qobilah.
*   **Order Confirmation:** Visual summary dialog before placing orders and downloadable order details.
*   **Order History:** Track orders via phone number.

### Admin Panel
*   **Dashboard:** Overview of orders and sales.
*   **Product Management:** CRUD for Simple and Variable products.
    *   **Hybrid Validation:** Frontend file checks (Size/Type) + Backend logic.
    *   **Inventory:** Manage stock for Ready items and quota for Pre-Orders.
*   **Order Management:** Filter by Status/Qobilah, verify payments (Cash/Transfer).
*   **Master Data:** Manage Categories, Vendors, and Member Data.

## 🛠️ Installation & Setup

### Prerequisites
*   Node.js (v18+) & npm
*   PHP (v8.2+) & Composer
*   Database (MySQL or SQLite)

### 1. Backend Setup (Laravel)

```bash
cd backend

# Install PHP dependencies
composer install

# Setup Environment
cp .env.example .env
# (Configure your database settings in .env)

# Generate App Key
php artisan key:generate

# Run Migrations & Seeders (Creates Admin, Categories, Products)
php artisan migrate --seed

# Start API Server
php artisan serve
```
*The backend will run at `http://localhost:8000`*

### 2. Frontend Setup (React)

```bash
cd frontend

# Install Node dependencies
npm install

# Start Development Server
npm run dev
```
*The frontend will run at `http://localhost:5173`*

## 🧪 Testing

*   **Admin Login:** (Check `DatabaseSeeder.php` for default credentials, usually `admin@example.com` / `password`)
*   **Guest Checkout:** Visit the storefront, add items to cart, and proceed to checkout.

## 📂 Project Structure

```
bamstore/
├── backend/       # Laravel API
│   ├── app/
│   ├── database/
│   └── routes/api.php
├── frontend/      # React App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/
│   └── package.json
└── spec_en.md     # Functional Specifications
```
