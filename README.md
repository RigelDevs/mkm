# PDAM H2H - MKM Middle Service

A Bun-based API middleware service using Elysia.js that follows MVC structure for MKM JSON Specification v2.6.

## Features

- ✅ Bun + Elysia.js framework
- ✅ MVC structure (controllers, services, routes, middlewares, models, utils)
- ✅ TOML configuration
- ✅ Request/Response logging middleware
- ✅ IP whitelist middleware
- ✅ Token authentication endpoint
- ✅ MKM transaction endpoints (inquiry, payment, advice)

## Installation

```bash
# Install dependencies
bun install

# Start the server
bun start

# Development mode with auto-reload
bun dev
```

## Configuration

Edit `config/default.toml` to configure:
- Server port and host
- Certificate file paths (public and private keys)
- MKM API settings
- Allowed IP addresses
- Logging preferences

### Certificate Files
The service includes certificate files in the `certs/` directory:
- `private_key.pem` - Private key for authentication
- `public_key.pem` - Public key for verification

These paths are configured in the TOML file under the `[certs]` section.

## API Endpoints

### Authentication
- `GET /api/token` - Get MKM authentication token

### Transactions
- `POST /api/inquiry` - Customer inquiry
- `POST /api/payment` - Process payment
- `POST /api/advice` - Transaction advice

## Example Requests

### Get Token
```bash
curl http://localhost:3000/api/token
```

### Inquiry
```bash
curl -X POST http://localhost:3000/api/inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "TXN123",
    "customer_id": "CUST001",
    "product_code": "WATER_BILL",
    "amount": 100000
  }'
```

### Payment
```bash
curl -X POST http://localhost:3000/api/payment \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "TXN123",
    "customer_id": "CUST001",
    "product_code": "WATER_BILL",
    "amount": 100000,
    "reference_number": "REF123456"
  }'
```

### Advice
```bash
curl -X POST http://localhost:3000/api/advice \
  -H "Content-Type: application/json" \
  -d '{
    "original_transaction_id": "TXN123",
    "reference_number": "REF123456",
    "status": "SUCCESS"
  }'
```

## Project Structure

```
pdam-h2h/
├── app/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── transaction.controller.ts
│   ├── middlewares/
│   │   ├── logger.ts
│   │   └── whitelist.ts
│   ├── models/mkm.model.ts
│   ├── routes/transaction.route.ts
│   ├── services/mkm.service.ts
│   └── utils/config.ts              # MOVED: From root utils/
├── certs/                           # NEW: Certificate files
│   ├── private_key.pem
│   └── public_key.pem
├── config/default.toml              # UPDATED: Added certs configuration
├── index.ts
├── tsconfig.json
├── package.json
├── README.md
└── MKM JSON Specification - 2.6.pdf
```