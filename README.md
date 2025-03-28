# Nexora

<p align="center">
  <img src="public/logo.png" alt="Nexora Logo" width="200" />
</p>

<p align="center">
  <strong>A modern multi-tenant Point of Sale (POS) system built with Next.js</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#license">License</a>
</p>

## Features

Nexora is a comprehensive POS solution designed for businesses of all sizes with multi-tenant capabilities:

- **Multi-Tenant Architecture**

  - Custom subdomains for each business
  - Isolated data storage with shared infrastructure
  - Tenant-specific configurations and branding

- **User Management**

  - Role-based access control (Admin, Staff, Manager)
  - Secure authentication with NextAuth
  - User profile management

- **Business Operations**

  - Inventory management
  - Order processing and history
  - Customer relationship management
  - Reporting and analytics

- **Subscription Plans**
  - Tiered pricing models
  - Usage limits based on subscription
  - Billing management

## Tech Stack

Nexora is built with modern technologies:

- **Frontend**

  - Next.js 13+ (App Router)
  - React 18
  - Tailwind CSS
  - Radix UI Components

- **Backend**

  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL Database

- **Authentication**

  - NextAuth.js
  - JWT with secure sessions

- **Infrastructure**
  - Vercel deployment
  - Database hosting (Supabase/Neon/PlanetScale)

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- PostgreSQL database
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nexora.git
   cd nexora
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update .env with your database connection details
   ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Architecture

Nexora follows a clean architecture pattern to maintain a scalable and maintainable codebase:

- **Presentation Layer**
  - Next.js App Router
  - React components
  - Tailwind CSS for styling
- **Application Layer**
  - Next.js API Routes
  - Prisma ORM
  - Business logic
- **Infrastructure Layer**
  - Vercel deployment
  - Database hosting (Supabase/Neon/PlanetScale)

## Deployment

Nexora is deployed on Vercel, a cloud platform for static sites and serverless functions.

## License

Nexora is licensed under the MIT License. See LICENSE for more information.
