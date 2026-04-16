# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier format all files
npm run type-check       # TypeScript check (nuxt typecheck)
npm run lint:all         # lint + format:check + type-check combined

# Database (requires Docker)
npm run db:start         # Start local Supabase (Docker)
npm run db:stop          # Stop local Supabase
npm run db:reset         # Reset DB and re-run all migrations
npm run db:studio        # Open Supabase Studio UI
npm run db:push          # Push migrations to production
npm run db:use-local     # Switch .env to local Supabase
npm run db:use-prod      # Switch .env to production Supabase
npm run seed:all         # Create test users + seed workout data

# Mobile testing
npm run dev:mobile       # Dev server bound to LAN IP (port 3001)
```

There are no automated tests in this project.

## Architecture

**Stack:** Nuxt 3 SPA (`ssr: false`) + Supabase (auth + Postgres) + TailwindCSS. UI language is pt-BR throughout.

### Auto-imports

- `components/ui/` — imported globally **without prefix** (e.g., `<Button>`, `<Card>`)
- `components/` — imported globally without path prefix
- `lib/` — functions auto-imported (e.g., `cn()` from `lib/utils.ts`)
- `@vueuse/nuxt` — all VueUse composables auto-imported
- `types/index.ts` — TypeScript interfaces are **not** globally available; import explicitly where needed in `.vue` files (though `WorkoutWithExercises`, `ExerciseWithSets`, etc. are used without imports in pages — this causes existing TS errors that are pre-existing and non-blocking)

### Pages & routing

File-based routing. All pages require `definePageMeta({ middleware: 'auth' })` except `/login` and `/auth/callback`.

| Route | Purpose |
|---|---|
| `/` | Workout list + create workout (with template picker) |
| `/workouts/[id]` | Workout detail editor (exercises, sets, timer) |
| `/templates` | Template management |
| `/templates/[id]` | Template exercise editor |
| `/status` | Calendar view of workout history + streak stats |
| `/profile` | User profile, avatar, password |

### Supabase patterns

```ts
const supabase = useSupabaseClient()
const session = useSupabaseSession() // reactive session ref

// Auth check
if (!session.value?.user)
  return
```

All tables use Row Level Security — every query is automatically scoped to `auth.uid()`. No need to manually filter by `user_id` in client code; Supabase enforces it.

### Database schema

```
profiles
  └── workouts (user_id FK, date DATE, source_template_id FK?)
        └── exercises ("order" INTEGER)
              └── workout_sets

workout_templates (user_id FK)
  └── template_exercises ("order" INTEGER, default_sets, default_reps, default_weight_kg)
```

**`order` is a reserved PostgREST keyword.** Never use `.match({ order: value })` — it's parsed as ORDER BY. Always use `.eq('"order"', value)` with double-quoted column name when filtering by `order`.

**Dates** are stored as PostgreSQL `DATE` (`YYYY-MM-DD` string in JS). When constructing a `Date` object from a date string, always append `T12:00:00` to avoid UTC timezone shifting the day: `new Date(dateStr + 'T12:00:00')`. Generate today's date with local time (not `toISOString()`).

### Database migrations

Migrations live in `supabase/migrations/`. Run `npm run db:reset` to apply all locally. To apply to production: `npm run db:push`. Never modify existing migration files — add new ones.

### Code style

- Props: use `withDefaults(defineProps<...>(), {...})` and access as `props.xxx` in `<script setup>`. No destructuring.
- `cn()` from `~/lib/utils` must be imported explicitly (not auto-imported).
- Component events follow Vue 3 `defineEmits<{ eventName: [argType] }>()` syntax.
- No date libraries — use vanilla `Date` API.

### Key composables

| File | Purpose |
|---|---|
| `composables/useExerciseLibrary.ts` | Static exercise library with muscle group filtering |
| `composables/useOnboardingTour.ts` | Driver.js onboarding tour (first-time users) |
| `composables/useMarkdownTemplate.ts` | Parse markdown to create templates |
| `composables/useOAuthClient.ts` | OAuth social login helpers |

### Environment

`.env` file controls which Supabase instance is active. Use `npm run db:use-local` / `npm run db:use-prod` to switch. Never commit `.env`. The `.env.example` shows required variables.
