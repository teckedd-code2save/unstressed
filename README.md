# Unstressed — Proactive Intelligent Leisure

A context-aware mobile sanctuary that learns your rhythm and guides you toward rest, focus, and joy.

## Monorepo Structure

```
unstressed/
├── apps/
│   ├── mobile/          # Expo (React Native) app
│   └── api/             # Fastify REST API
├── packages/
│   ├── db/              # Prisma schema, migrations, repositories
│   └── ui/              # Shared design tokens
```

## Stack

| Layer | Tech |
|---|---|
| Mobile | React Native 0.76 + Expo SDK 52 |
| Styling | NativeWind v4 (Tailwind for RN) |
| Navigation | Expo Router v4 |
| Font | Manrope (Expo Google Fonts) |
| Auth | Clerk |
| Backend | Fastify + Node.js |
| Database | PostgreSQL 18 + Prisma v7 |
| AI | Claude API (claude-sonnet-4-6) |
| Builds | EAS (Expo Application Services) |
| Monorepo | Turborepo + pnpm |

## Getting Started

### Prerequisites
- Node.js ≥ 20
- pnpm ≥ 10
- Docker (for Postgres)
- Expo Go app or physical device

### 1. Install dependencies
```bash
pnpm install
```

### 2. Set up environment variables

```bash
# API
cp apps/api/.env.example apps/api/.env
# Fill in: CLERK_SECRET_KEY, ANTHROPIC_API_KEY

# Mobile
cp apps/mobile/.env.example apps/mobile/.env.local
# Fill in: EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
```

### 3. Start Postgres (if not already running)
```bash
docker compose -f apps/api/docker-compose.yml up -d postgres
```

### 4. Run migrations + seed
```bash
cd packages/db
pnpm db:migrate
pnpm db:seed
```

### 5. Start the API
```bash
pnpm --filter @unstressed/api dev
# Running on http://localhost:3001
```

### 6. Start the mobile app
```bash
pnpm --filter @unstressed/mobile dev
# Scan QR code with Expo Go
```

## V1 Screens

| Screen | Route | Description |
|---|---|---|
| Right Now | `(tabs)/` | Proactive AI suggestions for this moment |
| Intelligent Search | `(tabs)/search` | Mood-based search with "why it fits" explanations |
| Collections | `(tabs)/collections` | Trips, folders, recently saved places |
| Digital Atrium | `(tabs)/context` | Energy blueprint, calendar sync, silence protocols |
| Auth | `(auth)/` | Google OAuth + email/password via Clerk |

## Design System

Two themes implemented from the Stitch prototypes:

- **Serene Logic** — light mode, `#faf9f6` surface, `#156a67` teal
- **Midnight Sanctuary** — dark mode, `#121412` surface, `#93d2d1` teal glow

All tokens live in `apps/mobile/tailwind.config.js`.

## Building for App Stores

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in
eas login

# Development build (for device testing)
eas build --profile development --platform ios

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/suggestions/right-now` | AI-generated Right Now dashboard |
| POST | `/api/search` | Mood-based intelligent search |
| GET | `/api/collections` | User's trips, folders, saved items |
| POST | `/api/collections` | Create a new collection |
| POST | `/api/collections/:id/items` | Save a place to a collection |
| GET | `/api/context` | User's context profile |
| PATCH | `/api/context` | Update context profile |
| GET | `/health` | Health check |
| POST | `/webhooks/clerk` | Clerk user sync webhook |

## Roadmap

- **V1** ✅ Right Now · Search · Collections · Context Profile · Auth
- **V2** Group Planning (Dashboard → Voting → Itinerary)
- **V3** Social Safety (Safe & Seen, Safety Circles)
- **V4** Push notifications · Background context sync · Lock-screen widgets
