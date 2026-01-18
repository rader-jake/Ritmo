# Ritmo - Habit Tracking Application

## Overview

Ritmo is a habit/goal tracking web application that helps users visualize their consistency over time through effort-based logging and heatmap visualizations. Unlike binary habit trackers, Ritmo allows users to log effort intensity (0-4 scale) for each day, creating a GitHub-style contribution heatmap to show progress patterns.

The application is built as a full-stack TypeScript monorepo with a React frontend and Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens (primary teal #0F766E, accent emerald #34D399)
- **Build Tool**: Vite with path aliases (@/ for client/src, @shared/ for shared)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: REST endpoints defined in shared/routes.ts with Zod validation
- **Authentication**: Replit Auth (OpenID Connect) with Passport.js
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: shared/schema.ts (goals, logs tables) and shared/models/auth.ts (users, sessions)
- **Migrations**: Managed via drizzle-kit push

### Key Design Patterns
- **Shared Types**: TypeScript types and Zod schemas in /shared directory used by both frontend and backend
- **API Contract**: Routes defined declaratively in shared/routes.ts with method, path, input schema, and response schemas
- **Storage Interface**: Abstract IStorage interface in server/storage.ts allows swapping implementations
- **Auth Integration**: Modular auth system in server/replit_integrations/auth/ with separate storage, routes, and middleware

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components including Heatmap, GoalCard, EffortLogger
    pages/        # Route pages (Dashboard, GoalDetails, Landing)
    hooks/        # Custom hooks (use-auth, use-goals, use-logs)
    lib/          # Utilities and query client
server/           # Express backend
  replit_integrations/auth/  # Replit Auth integration
shared/           # Shared types, schemas, and route definitions
  models/         # Database model schemas
```

## External Dependencies

### Database
- **PostgreSQL**: Primary data store accessed via DATABASE_URL environment variable
- **Drizzle ORM**: Query builder and schema management

### Authentication
- **Replit Auth**: OpenID Connect provider (ISSUER_URL defaults to https://replit.com/oidc)
- **Required Environment Variables**: REPL_ID, SESSION_SECRET, DATABASE_URL

### UI Libraries
- **Shadcn/ui**: Pre-built accessible components (new-york style variant)
- **Radix UI**: Headless UI primitives for dialogs, popovers, tooltips, etc.
- **Lucide React**: Icon library
- **date-fns**: Date manipulation for heatmap generation
- **react-day-picker**: Calendar component for date selection

### Build & Development
- **Vite**: Frontend build with HMR and Replit-specific plugins
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development