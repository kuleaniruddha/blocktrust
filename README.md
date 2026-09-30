# BlockTrust

BlockTrust is a full-stack blockchain donation transparency platform for a BE Computer Engineering major project. It separates the project into frontend, backend, blockchain, AI, database, docs, API docs, presentation, screenshots, and deployment modules.

## Modules

- `frontend`: React + Vite + Tailwind dashboard, donation flow, wallet connection, UPI QR, charts, admin views.
- `backend`: Node.js + Express + Firebase Firestore REST API with JWT auth, role checks, PDF receipts, QR payment intents, analytics, audit logs.
- `blockchain`: Solidity + Hardhat contracts for donations, treasury balance, spending records, and role-based authorization.
- `ai`: Python Isolation Forest anomaly detection for suspicious expenses.
- `api_docs`: Swagger and Postman starter docs.
- `database`: SQL reference schema and Firebase seed script.
- `deployment`: Nginx, Vercel, Render, and GitHub Actions examples.

## Quick Start

```bash
npm run install:all
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
npm run dev
```

Set your payment details in `backend/.env`:

```env
PAYMENT_UPI_ID=your-upi-id@bank
PAYMENT_PAYEE_NAME=Your Name Or Trust Name
DONATION_WALLET_ADDRESS=0xYourSepoliaTreasuryWallet
```

## Smart Contracts

```bash
cd blockchain
npm install
npx hardhat test
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the deployed donation contract address into `backend/.env` and `frontend/.env`.

## Backend

```bash
cd backend
npm install
npm run dev
```

API runs on `http://localhost:5000/api`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:5173`.
