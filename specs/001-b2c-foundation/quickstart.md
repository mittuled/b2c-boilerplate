# Quick Start Guide: B2C Boilerplate — Phase 1

**Goal**: Clone the repository and reach a running application in under 15 minutes.

## Prerequisites

Run the doctor command to validate your environment:

```bash
npm run doctor
```

The doctor checks for:

| Tool | Required Version | Purpose |
|------|-----------------|---------|
| Node.js | >= 20.x | JavaScript runtime |
| pnpm | >= 9.x | Package manager |
| Git | >= 2.x | Version control |
| Docker | >= 24.x | Local Supabase (database, auth, storage) |
| Supabase CLI | >= 1.200.x | Database migrations, type generation, local dev |
| Xcode | >= 16.x | iOS/macOS builds (macOS only) |
| Android Studio | >= 2024.x | Android builds (optional for web-only dev) |
| .NET SDK | >= 8.x | Windows Desktop builds (optional) |

## Setup Steps

### 1. Clone and Install (2 minutes)

```bash
git clone <repo-url>
cd b2c-boilerplate
pnpm install
```

### 2. Start Local Supabase (3 minutes)

```bash
supabase start
```

This starts local PostgreSQL, Auth, Storage, Realtime, and Edge Functions via Docker. On first run, it pulls images (~2 minutes). Subsequent starts take ~10 seconds.

Output includes local URLs and keys:
```
API URL: http://127.0.0.1:54321
Auth URL: http://127.0.0.1:54321/auth/v1
Storage URL: http://127.0.0.1:54321/storage/v1
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
anon key: eyJ...
service_role key: eyJ...
```

### 3. Apply Migrations and Seed Data (1 minute)

```bash
supabase db reset
```

This runs all migrations in order, then executes `supabase/seed.sql` to populate test data (roles, permissions, test users, design tokens).

### 4. Configure Environment (1 minute)

```bash
cp .env.example .env.local
```

The `.env.example` file documents all required variables. For local dev, the Supabase keys from step 2 are auto-populated by the setup script. Verify with:

```bash
pnpm run env:validate
```

### 5. Generate Types (30 seconds)

```bash
supabase gen types typescript --local > contracts/generated/typescript/database.ts
```

This generates TypeScript types from your local database schema. The types are used by the web app and admin panel for type-safe data access.

### 6. Start the Web App (1 minute)

```bash
pnpm turbo dev --filter=web
```

Open `http://localhost:3000`. You should see the landing page.

### 7. Start the Admin Panel (optional)

```bash
pnpm turbo dev --filter=admin
```

Open `http://localhost:3001`. Log in with `superadmin@test.com` / `Test1234!`.

### 8. Run Tests (2 minutes)

```bash
# All web tests
pnpm turbo test --filter=web

# Database RLS tests
supabase test db
```

## Test Accounts

| Email | Password | Role | Status |
|-------|----------|------|--------|
| superadmin@test.com | Test1234! | Super Admin | Active, MFA enabled |
| admin@test.com | Test1234! | Admin | Active |
| moderator@test.com | Test1234! | Moderator | Active |
| user@test.com | Test1234! | End User | Active |
| unverified@test.com | Test1234! | End User | Unverified |
| suspended@test.com | Test1234! | End User | Suspended |
| deactivated@test.com | Test1234! | End User | Deactivated |

## Platform-Specific Setup

### iOS / macOS

```bash
cd apps/ios
xcodebuild -resolvePackageDependencies -project App.xcodeproj
open App.xcodeproj
```

Build and run on a simulator (Cmd+R). The app connects to local Supabase.

### Android

```bash
cd apps/android
./gradlew assembleDebug
```

Open `apps/android/` in Android Studio. Run on emulator. The app connects to local Supabase via `10.0.2.2:54321`.

### Windows Desktop

```bash
cd apps/desktop-windows
dotnet restore
dotnet build
dotnet run --project App
```

## Code Generation

Generate new components, screens, or API endpoints:

```bash
# Interactive generator
pnpm run generate

# Direct generation
pnpm run generate component MyButton
pnpm run generate screen ProfileEdit
pnpm run generate api-endpoint user-preferences
```

Generated files follow project conventions and auto-update barrel exports.

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm run doctor` | Validate local environment |
| `pnpm turbo dev --filter=web` | Start web app dev server |
| `pnpm turbo dev --filter=admin` | Start admin panel dev server |
| `pnpm turbo test` | Run all JS/TS tests |
| `pnpm turbo lint` | Run Biome linting |
| `pnpm turbo typecheck` | Run TypeScript type checking |
| `supabase start` | Start local Supabase |
| `supabase stop` | Stop local Supabase |
| `supabase db reset` | Reset database (re-run migrations + seed) |
| `supabase db diff` | Generate migration from schema changes |
| `supabase migration new <name>` | Create a new migration file |
| `supabase gen types typescript --local` | Regenerate TypeScript types |
| `supabase test db` | Run pgTAP database tests |
| `pnpm run generate` | Interactive code generator |
| `pnpm run env:validate` | Validate environment variables |

## Troubleshooting

**Docker not running**: `supabase start` requires Docker. Ensure Docker Desktop is running.

**Port conflicts**: Supabase uses ports 54321 (API), 54322 (DB), 54323 (Studio). If occupied, stop conflicting services or configure different ports in `supabase/config.toml`.

**Type generation fails**: Ensure Supabase is running (`supabase status`) and migrations have been applied (`supabase db reset`).

**iOS build fails**: Run `xcode-select --install` to ensure command line tools are installed. Check Xcode version with `xcodebuild -version`.

## Architecture Overview

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Web App    │  │  Admin Panel │  │  Mobile/Desktop│
│  (Next.js)   │  │  (Next.js)   │  │  (Native)     │
└──────┬───────┘  └──────┬───────┘  └──────┬────────┘
       │                 │                 │
       └────────────┬────┴────────────────┘
                    │
           ┌────────▼────────┐
           │    Supabase     │
           ├─────────────────┤
           │  Auth           │  ← Email, OAuth, MFA, CAPTCHA
           │  PostgREST      │  ← Auto-generated REST API
           │  Edge Functions  │  ← Custom business logic
           │  Storage         │  ← File uploads (avatars)
           │  Realtime        │  ← Live notifications
           │  PostgreSQL      │  ← Data + RLS + migrations
           └─────────────────┘
```

Each client platform has its own typed API client generated from the shared OpenAPI spec in `contracts/openapi.yaml`. Design tokens in `tokens/` generate platform-native theme files.
