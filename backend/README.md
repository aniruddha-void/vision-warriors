# Nova Insights Backend API

A lightweight, robust Node.js, Express, TypeScript, and MongoDB backend built specifically to power the **Nova Insights** privacy-first customer engagement, segmentation, and automated campaign platform.

---

## 🚀 Quick Start

### 1. Requirements
- **Node.js**: v18+ (tested on Node v22 / v23)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas connection string.

### 2. Configuration (`.env`)
The backend is pre-configured with `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/nova_insights
JWT_SECRET=super_secret_nova_insights_jwt_token_key_2026
FRONTEND_URL=http://localhost:5173
```

### 3. Run Development Server
```bash
# In c:\Users\aniru\vision_warrior\backend
npm run dev
```

### 4. Build & Production
```bash
npm run build
npm start
```

### 5. Manual Database Seed
If you ever want to reset or seed the database with the full mock dataset:
```bash
npm run seed
```
*(Note: The server also auto-seeds if it starts with an empty database!)*

---

## 📡 API Endpoints Reference

### 1. Health
- `GET /api/health` — Checks API status & uptime

### 2. Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new manager/owner (`email`, `password`, `name`, `role`)
- `POST /api/auth/login` — Login and receive JWT bearer token
- `GET /api/auth/me` — Get authenticated user details (Headers: `Authorization: Bearer <token>`)

### 3. QR Customer Check-In (`/api/checkin`)
- `POST /api/checkin`
  - Body:
    ```json
    {
      "contact": "9820110001",
      "name": "Aarav Sharma",
      "rating": 5,
      "review": "Best cutting chai in town!",
      "consentGranted": true
    }
    ```
  - Automatically handles:
    - Customer upsert (links by phone or email)
    - Visit count increment
    - Dynamic customer categorization (`NEW`, `REGULAR`, `IRREGULAR`, `needsAttention`)
    - Visit history recording
    - Review creation
    - DPDP/GDPR consent event logging
    - Audit log entry

### 4. Customers (`/api/customers`)
- `GET /api/customers` — List customers with optional filters:
  - `?category=NEW|REGULAR|IRREGULAR`
  - `?search=<name_phone_email_or_id>`
  - `?needsAttention=true`
- `GET /api/customers/:id` — Full customer detail with visit history, reviews, and sent offer records
- `PATCH /api/customers/:id/consent` — Update purpose/channel consent settings
- `DELETE /api/customers/:id` — **GDPR Right to Be Forgotten** (purges customer, visits, reviews & logs audit event)
- `GET /api/customers/:id/export` — **GDPR Data Portability** (downloads complete JSON export bundle)

### 5. Automated Category Offers & Email Dispatch (`/api/offers`)
- `GET /api/offers` — History of sent category offers
- `POST /api/offers/send` — Dispatches targeted offer:
  - Body: `{ "category": "REGULAR", "channel": "email" }`
  - When `channel: "email"`, invokes `sendOfferEmail` via Nodemailer
  - Validates customer master consent (`personalisedOffers`), channel consent (`consent.channels.email`), and email marketing consent (`consent.emailOffers`)
  - If personalization is disabled, dispatches a generic offer without personal preferences or purchase history
  - Returns `{ sentCount, excludedCount, totalCategoryMatches, emailStats }`

### 6. Email Service Verification (`/api/email`)
- `GET /api/email/status` — Checks if `EMAIL_USER` and `EMAIL_PASS` are configured and verifies the SMTP connection
- `POST /api/email/test` — Sends a test email to verify Gmail SMTP delivery
  - Body: `{ "to": "your_email@gmail.com" }`

### 6. Tasks & Next-Best Actions
- `GET /api/tasks` — List daily operational tasks
- `PATCH /api/tasks/:id/toggle` — Mark task complete / pending
- `GET /api/actions` — List AI Next-Best-Action recommendations
- `POST /api/actions/:id/complete` — Mark action completed & completes linked tasks

### 7. Message Templates & Reviews
- `GET /api/templates` & `PATCH /api/templates/:id` — Manage omnichannel messaging templates
- `GET /api/reviews` & `POST /api/reviews` — Fetch & submit cafe/store reviews

### 8. Compliance & Audit Logs (`/api/logs`)
- `GET /api/logs/consent` — Granular consent trail (Granted, Updated, Withdrawn, Exported, Deleted)
- `GET /api/logs/audit` — System-wide role-based access audit trail

### 9. Store Settings & Thresholds (`/api/settings`)
- `GET /api/settings` — Read shop settings & classification thresholds
- `PUT /api/settings` — Update retention periods, privacy mode, and visit thresholds

---

## 🔗 Frontend Integration

The frontend Vite dev server (`frontend/vite.config.ts`) has an automatic proxy configured:
```ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

You can use the ready-made typed client in `frontend/src/lib/api.ts`:
```ts
import { novaApi } from '@/lib/api';

// Example: Trigger QR check-in
const result = await novaApi.checkIn({
  contact: '9820110001',
  name: 'Aarav Sharma',
  consentGranted: true,
});
```
