# ChefShift NL — Starter Kit

> Platform voor ZZP-koks en horeca in Nederland. Volledige stack: Next.js 14 + TypeScript + Prisma + PostgreSQL + NextAuth + Docker.

---

## 🚀 Snelstart (1 commando)

```bash
# 1. Clone en installeer
git clone <repo-url> chefshift
cd chefshift

# 2. Kopieer env en start alles
cp .env.example .env
docker-compose up -d

# 3. Database migreren en seeden (eenmalig)
npm install
npx prisma migrate dev --name init
npx prisma db seed

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Projectstructuur

```
chefshift-starter-kit/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # NextAuth + Register
│   │   │   ├── shifts/        # CRUD + Apply + Confirm + Complete
│   │   │   ├── notifications/ # Meldingen
│   │   │   ├── invoices/      # Facturen
│   │   │   └── admin/         # Admin stats
│   │   ├── (auth)/            # Login / Register pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   └── admin/             # Admin panel
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   │   ├── prisma.ts         # Database client
│   │   ├── auth.ts           # NextAuth config
│   │   └── utils.ts          # Helpers
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Demo data
├── docker/
│   └── Dockerfile            # App container
├── docker-compose.yml         # Full stack (app + db + redis)
├── package.json
├── tailwind.config.ts
└── .env.example
```

---

## 🔧 Omgevingsvariabelen

Kopieer `.env.example` naar `.env` en vul in:

| Variabele | Beschrijving | Voorbeeld |
|-----------|-------------|-----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://chefshift:...` |
| `NEXTAUTH_URL` | App URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | JWT secret (genereer met `openssl rand -base64 32`) | `...` |
| `MOLLIE_API_KEY` | Mollie API key (test) | `test_...` |
| `RESEND_API_KEY` | Resend API key voor email | `re_...` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |

---

## 👤 Demo Accounts

Na `npm run db:seed`:

| Rol | Email | Wachtwoord |
|-----|-------|------------|
| Horeca | `info@degoudenlepel.nl` | `demo123` |
| Kok | `mark@devrieskok.nl` | `demo123` |
| Admin | `admin@chefshift.nl` | `admin123` |

---

## 🐳 Docker Commands

```bash
# Start alles (app + PostgreSQL + Redis)
docker-compose up -d

# Stop alles
docker-compose down

# Database reset
docker-compose down -v
docker-compose up -d
npx prisma migrate dev
npx prisma db seed

# Logs bekijken
docker-compose logs -f app
```

---

## 🛠️ Belangrijke Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server

# Database
npm run db:generate      # Prisma client genereren
npm run db:migrate       # Migratie uitvoeren
npm run db:studio        # Prisma Studio openen
npm run db:seed          # Demo data inladen
npm run db:reset         # Reset + seed

# Setup (eenmalig)
npm run setup            # Install + Docker + Migrate + Seed
```

---

## 🌐 Deployment

### Option 1: Vercel (Frontend) + Railway (Database)

1. **Push naar GitHub**
2. **Vercel**: Import repo → Framework preset: Next.js
3. **Railway**: New Project → PostgreSQL + Redis
4. **Environment variables** in Vercel kopiëren van Railway

### Option 2: VPS (DigitalOcean / Hetzner)

```bash
# Op server
git clone <repo>
cd chefshift
cp .env.example .env
# Edit .env met productie waarden
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Option 3: Render.com

1. New Web Service → Connect GitHub repo
2. Build command: `npm install && npx prisma generate && npm run build`
3. Start command: `npm start`
4. Add PostgreSQL managed database

---

## 📊 Database Schema

![Schema](prisma/schema.prisma)

Belangrijkste entiteiten:
- **User** (HORECA / KOK / ADMIN)
- **HorecaProfile** / **KokProfile**
- **Shift** (met status: OPEN → CONFIRMED → COMPLETED)
- **Application** (kok reageert op shift)
- **Invoice** (automatische facturering)
- **Review** (beoordelingen)
- **Message** (chat)
- **Notification** (meldingen)

---

## 🔐 Security

- ✅ Password hashing met bcrypt (cost 12)
- ✅ JWT sessions met NextAuth
- ✅ Role-based access control (HORECA / KOK / ADMIN)
- ✅ Input validatie met Zod
- ✅ SQL injection protection via Prisma
- ✅ XSS protection via React escaping

---

## 📝 API Endpoints

| Endpoint | Methode | Auth | Beschrijving |
|----------|---------|------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | - | Login / Logout / Session |
| `/api/auth/register` | POST | - | Nieuwe gebruiker |
| `/api/shifts` | GET | ✓ | Lijst shifts |
| `/api/shifts` | POST | Horeca | Nieuwe shift |
| `/api/shifts/[id]` | GET | ✓ | Shift detail |
| `/api/shifts/[id]/apply` | POST | Kok | Reageren op shift |
| `/api/shifts/[id]/confirm` | POST | Horeca | Kok kiezen |
| `/api/shifts/[id]/complete` | POST | ✓ | Shift voltooien |
| `/api/notifications` | GET | ✓ | Meldingen |
| `/api/notifications` | PATCH | ✓ | Gelezen markeren |
| `/api/invoices` | GET | ✓ | Facturen |
| `/api/admin` | GET | Admin | Stats + data |

---

## 🎯 Roadmap

- [ ] Mollie iDEAL integratie (betalingen)
- [ ] Resend email templates
- [ ] Socket.io real-time chat
- [ ] Bull queue voor achtergrond jobs
- [ ] Elasticsearch voor zoeken
- [ ] PWA + push notificaties
- [ ] React Native app

---

## 📄 Licentie

MIT License — ChefShift NL Team
