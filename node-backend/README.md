# NisSmart Backend

A Node.js backend for the NisSmart micro-savings application built with Express, Prisma ORM, and MySQL.

## Features

- Express.js REST API
- Prisma ORM for database management
- MySQL database support
- TypeScript support
- Hot reload development with Nodemon

## Prerequisites

- Node.js 16+ and npm
- MySQL 8.0+

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure your database:

   - Update the `DATABASE_URL` in `.env` with your MySQL connection string

3. Generate Prisma Client:

```bash
npm run prisma:generate
```

4. Run database migrations:

```bash
npm run prisma:migrate
```

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will be available at `http://localhost:3000`

## Build

Build the TypeScript project:

```bash
npm run build
```

## Production

Run the built project:

```bash
npm start
```

## Prisma Studio

Open Prisma Studio to manage your database:

```bash
npm run prisma:studio
```

## Project Structure

```
├── src/
│   └── index.ts          # Main application file
├── prisma/
│   └── schema.prisma     # Database schema
├── dist/                 # Compiled JavaScript (generated)
├── .env                  # Environment variables
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```
