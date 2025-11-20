# 🏦 Nissmart Micro-Savings Platform

> A modern, secure, and scalable micro-savings and payout platform for empowering families and equipping institutions.

**Empowering Families. Equipping Institutions. Transforming Generations.**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Security & Transaction Safety](#security--transaction-safety)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

Nissmart is a full-stack micro-savings platform that enables users to:

- **Deposit** funds into their secure wallets
- **Transfer** money between users instantly
- **Withdraw** funds to external accounts
- **Track** transaction history with complete audit trails
- **Manage** operations through an intuitive admin dashboard

The platform is built with production-grade security, atomic transactions, and comprehensive logging for compliance and debugging.

---

## ✨ Features

### For Users

✅ Secure wallet management with UUID-based accounts  
✅ Instant internal transfers with real-time balance updates  
✅ Deposit simulation with automatic wallet crediting  
✅ Withdrawal requests with external system integration  
✅ Complete transaction history  
✅ Real-time balance checking

### For Operations/Admin

✅ System-wide dashboard with key metrics  
✅ Real-time transaction monitoring  
✅ User management and overview  
✅ Activity feed with audit logging  
✅ Advanced filtering and pagination  
✅ Transaction status tracking

### Technical Features

✅ **Transaction Safety**: Atomic operations, idempotency keys, optimistic locking  
✅ **Error Handling**: Comprehensive error messages and logging  
✅ **Scalability**: Database indexes on critical fields  
✅ **Compliance**: Full audit trail for every transaction  
✅ **Security**: CORS protection, input validation, SQL injection prevention

---

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: MySQL 8+
- **Logging**: Winston
- **Security**: CORS, UUID

### Frontend

- **Framework**: Next.js
- **Styling**: Tailwind CSS / Shadcn UI Modules

### DevOps

- **Version Control**: Git
- **Package Manager**: npm
- **Development**: nodemon
- **Database Migration**: Prisma Migrate

---

## 📁 Project Structure - Important Files

```
nissmart-micro-savings/
│
├── 📂 node-backend/                 # Express API Backend
│   ├── 📂 src/
│   │   ├── 📂 config/               # Configuration files
│   │   ├── 📂 routes/               # API endpoints
│   │   ├── 📂 services/             # Business logic
│   │   ├── 📂 middleware/           # Express middleware
│   │   ├── 📂 utils/
│   │   └── index.ts                # Entry point
│   ├── 📂 prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── 📂 migrations/           # Database migrations
│   ├── .env                         # Environment variables (local)
├── 📂 frontend/                     # React Frontend
│   ├── 📂 src/
|   |   |── 📂 app/
│   │   ├── 📂 components/           # Reusable components
│   │   ├── 📂 pages/                # Page components
│   │   ├── 📂 hooks/
│   │   ├── 📂 lib/                  # React context
│
├── 📂 docs/                         # Documentation
│   ├── architecture.md              # System design
│   ├── flow_diagram.md              # Process flows
│   └── API.md                       # API reference
│
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20 or higher
- **npm**: v10 or higher (comes with Node.js)
- **MySQL**: v8.0 or higher
- **Git**: v2.0 or higher

---

## 🚀 Installation

### 1️⃣ Clone or Create the Project

````bash
# Create project directory
mkdir nissmart-micro-savings
cd nissmart-micro-savings

### 2️⃣ Backend Setup


### 1️⃣ Backend Environment Setup

```bash
# Navigate to backend
cd node-backend

# Create .env file
# Database Configuration
DATABASE_URL="mysql://root:Qwerty123!@localhost:3306/nissmart"

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

````

### 3️⃣ Frontend Environment Setup

```bash
cd ../frontend

REACT_APP_API_URL=http://localhost:5000/api

```

### 2️⃣ Create Database

```
# Create the nissmart database
mysql -u root -pYOUR_PASSWORD -e "CREATE DATABASE IF NOT EXISTS nissmart;"

```

### 3️⃣ Run Prisma Migrations

```
# Navigate to backend
cd node-backend

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

```

---

## ▶️ Running the Application

### Option 1️⃣: Development Mode (Recommended)

#### Terminal 1 - Backend

```bash
cd node-backend

# Start backend with auto-reload
npm run dev

# Expected output:
# [nodemon] restarting due to changes...
# 🚀 Backend running at http://localhost:5000
# [nissmart-api] Starting server...
```

#### Terminal 2 - Frontend

```bash
cd frontend

# Start React development server
npm start

# Expected output:
# Compiled successfully!
# Webpack compiled with 1 warning
# You can now view nissmart-frontend in the browser.
# Local: http://localhost:3000
```

---
