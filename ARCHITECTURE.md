# DotDot - Architecture Plan & Tech Spec

> **Status**: Ready for team review
> **Version**: 1.0
> **Last Updated**: 2025-10-10
> **Estimated Timeline**: 5 weeks to production

## Executive Summary

A web application for sharing and celebrating shows/movies you enjoyed with a 3-dot rating system (Liked/Really Liked/Loved). Users create a personal collection of their favorite content and get a shareable public profile at `/u/{username}` to share their taste with friends.

### Key Decisions
- **Backend**: Supabase (PostgreSQL BaaS) - No vendor lock-in, easy migration path
- **Frontend**: React 19 + TypeScript + Vite (already set up)
- **Timeline**: 2-3 weeks for MVP, 5 weeks for production launch
- **Cost**: $0-25/month for first year (Supabase free tier → paid)

### Why This Stack?
1. **Speed**: Supabase eliminates 80% of backend work (auth, database, security)
2. **Portability**: Standard PostgreSQL + SQL means easy migration if needed
3. **Modern**: Latest React 19, TypeScript, and best-in-class libraries
4. **Proven**: All technologies are production-tested at scale

---

## Project Overview
A web application for sharing and celebrating shows/movies you enjoyed. Users curate their personal collection with a 3-dot rating system and share their taste through public profiles.

**Key Concept**: Only content you enjoyed makes it to your list - this is a celebration of what you loved, not a comprehensive watch history.

## Core Features (MVP)
1. User authentication and management (email/password)
2. Add/edit/delete enjoyed shows/movies
3. 3-dot rating system (1=Liked, 2=Really Liked, 3=Loved)
4. View by year (yearly consumption)
5. Public shareable profile at `/u/{username}` - your curated taste
6. TMDB integration for auto-fetching posters and metadata (Phase 2)

---

## Architecture Decision

### Backend Strategy: Hybrid Approach

**Phase 1 (Prototype/MVP)**: Supabase
- Fastest time to market (~2-3 weeks for MVP vs 6-8 weeks custom backend)
- Built-in authentication (email + OAuth ready)
- Real-time capabilities (if needed for future features)
- No server management or DevOps required
- Free tier supports up to 50K monthly active users
- PostgreSQL = standard database (easy to migrate later)

**Phase 2 (Scale)**: Migrate to custom backend when needed
- When you hit 50K+ MAU or Supabase pricing limits ($25/mo → $100+/mo)
- When you need custom business logic or complex workflows
- When you need more control over infrastructure
- Migration path: Export PostgreSQL data → import to your own DB

### Recommended: **Supabase** over Firebase

**Why Supabase wins:**

| Feature | Supabase ✅ | Firebase ❌ |
|---------|------------|------------|
| **Database** | PostgreSQL (SQL standard) | Firestore (NoSQL proprietary) |
| **Migration Path** | Easy - standard SQL export/import | Hard - proprietary query syntax |
| **Vendor Lock-in** | Low - can self-host, standard SQL | High - Firebase-specific APIs |
| **Pricing Transparency** | Predictable ($0 → $25 → $100) | Can scale unpredictably with reads |
| **Complex Queries** | Native SQL joins, aggregations | Limited - denormalization needed |
| **Security Model** | Row Level Security (RLS) in DB | Security rules in separate config |
| **Auth** | Built-in (email, OAuth, magic links) | Built-in (email, OAuth) |
| **Real-time** | PostgreSQL changes subscription | Firestore real-time listeners |
| **Storage** | Built-in file storage | Built-in file storage |
| **Self-hosting** | Yes (open source) | No |
| **Free Tier** | 500MB DB, 50K MAU, 1GB storage | 1GB storage, 50K reads/day |

**Key reasons for Supabase:**
1. **No vendor lock-in**: Standard PostgreSQL means you can migrate to AWS RDS, Google Cloud SQL, or self-hosted DB anytime
2. **Better data modeling**: SQL relations (users → watched_items) are natural; Firebase requires denormalization
3. **Easier debugging**: Standard SQL queries vs Firebase's collection/document paradigm
4. **Cost predictable**: Fixed tiers vs Firebase's per-operation pricing
5. **Future-proof**: If you grow, you already have real database skills on your team

**When Firebase might be better:**
- If team already knows Firebase deeply
- If you need Google Cloud ecosystem integration
- If you want Firebase Functions (though Supabase has Edge Functions)

**For this project**: Supabase is the clear winner due to simpler data model (users + watched items with ratings) and portability.

---

## Data Model

### User
```typescript
{
  id: uuid (PK)
  email: string
  username: string
  display_name: string
  avatar_url?: string
  created_at: timestamp
  updated_at: timestamp
}
```

### WatchedItem
```typescript
{
  id: uuid (PK)
  user_id: uuid (FK -> User)
  type: 'movie' | 'tv_show'
  title: string
  year?: number
  poster_url?: string
  tmdb_id?: number  // Optional: link to TMDB for metadata
  created_at: timestamp
  updated_at: timestamp
}
```

### Rating
```typescript
{
  id: uuid (PK)
  user_id: uuid (FK -> User)
  item_id: uuid (FK -> WatchedItem)
  rating: number  // 1-5 or 1-10 (your dot system)
  watched_date: date
  notes?: string
  created_at: timestamp
  updated_at: timestamp
}
```

### Why separate Rating table?
- Users can watch the same movie/show multiple times
- Track rating changes over time
- Better analytics (average rating, rating trends)

---

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript ✅ (already set up)
- **Build Tool**: Vite ✅ (already configured)
- **Routing**: React Router v6
  - **Why**: Industry standard, simple API, nested routes support
  - **Alternative considered**: TanStack Router (too new, smaller ecosystem)
- **State Management**:
  - **Zustand** for client state (theme, UI state) - **RECOMMENDED**
    - Why: Lightweight (1KB), simple API, no boilerplate
    - vs Redux Toolkit: Zustand is 90% simpler for our use case
  - **TanStack Query (React Query)** for server state (Supabase data)
    - Why: Built-in caching, refetching, optimistic updates
    - vs manual useState: Eliminates 100+ lines of loading/error handling
- **UI Library**: **Shadcn/ui** - **RECOMMENDED**
  - Why:
    - Copy-paste components (no npm package bloat)
    - Built on Radix UI (accessible primitives)
    - Tailwind-based (full customization)
    - Own the code (can modify anything)
  - vs MUI: No theme wrestling, lighter bundle size
  - vs Chakra UI: Better TypeScript support, more modern
- **Styling**: Tailwind CSS
  - Why: Utility-first, no CSS files, fast prototyping
  - Already using similar styles in App.css - easy migration
- **Forms**: React Hook Form + Zod validation
  - Why: Best DX, minimal re-renders, TypeScript inference from Zod schemas
  - vs Formik: React Hook Form is 3x faster, better TS support
- **Date Handling**: date-fns
  - Why: Tree-shakeable, immutable, simple API
  - vs Day.js: date-fns has better TS types and wider adoption

### Backend (Phase 1)
- **BaaS**: Supabase
  - Authentication (email, OAuth)
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Storage (for user avatars, posters)

### Backend (Phase 2 - Optional Future)
- **Runtime**: Node.js + Express or Fastify
- **ORM**: Drizzle or Prisma
- **Database**: PostgreSQL (easy migration from Supabase)
- **API**: REST or GraphQL
- **Auth**: JWT + refresh tokens

### DevOps
- **Hosting**: Vercel or Netlify (frontend)
- **Database**: Supabase cloud (free tier → paid)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (errors), PostHog (analytics)

---

## API Design (Supabase Client SDK)

### Authentication
```typescript
// Sign up
supabase.auth.signUp({ email, password })

// Sign in
supabase.auth.signInWithPassword({ email, password })

// OAuth
supabase.auth.signInWithOAuth({ provider: 'google' })

// Sign out
supabase.auth.signOut()
```

### Watched Items
```typescript
// Create
supabase.from('watched_items').insert({ user_id, title, type })

// Read (user's items)
supabase.from('watched_items')
  .select('*, ratings(*)')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// Update
supabase.from('watched_items').update({ title }).eq('id', itemId)

// Delete
supabase.from('watched_items').delete().eq('id', itemId)
```

### Ratings
```typescript
// Add rating
supabase.from('ratings').insert({
  user_id,
  item_id,
  rating,
  watched_date
})

// Get ratings by year
supabase.from('ratings')
  .select('*, watched_items(*)')
  .eq('user_id', userId)
  .gte('watched_date', `${year}-01-01`)
  .lte('watched_date', `${year}-12-31`)
```

---

## Frontend Architecture

### Folder Structure
```
src/
├── components/
│   ├── ui/                    # Shadcn/ui components (copy-paste)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx         # Navigation bar with user menu
│   │   ├── Layout.tsx         # Main layout wrapper
│   │   └── Footer.tsx
│   └── features/
│       ├── auth/
│       │   ├── LoginForm.tsx
│       │   ├── SignupForm.tsx
│       │   └── AuthGuard.tsx  # Protected route wrapper
│       ├── watched-items/
│       │   ├── WatchedItem.tsx         # Single item display
│       │   ├── WatchedItemsList.tsx    # List view
│       │   ├── AddItemDialog.tsx       # Add/Edit modal
│       │   ├── ItemForm.tsx            # Form component
│       │   └── RatingDots.tsx          # 3-dot rating display
│       └── profile/
│           ├── ProfileView.tsx         # Public profile page
│           ├── ProfileHeader.tsx
│           └── YearSection.tsx         # Group items by year
├── hooks/
│   ├── useAuth.ts              # Auth context hook
│   ├── useWatchedItems.ts      # TanStack Query hooks for items
│   └── useUser.ts              # User data hook
├── lib/
│   ├── supabase.ts             # Supabase client initialization
│   ├── types.ts                # TypeScript interfaces
│   ├── utils.ts                # Helper functions (cn, formatDate, etc.)
│   └── tmdb.ts                 # TMDB API client (Phase 2)
├── pages/
│   ├── Landing.tsx             # Public landing page
│   ├── Login.tsx               # Login page
│   ├── Signup.tsx              # Signup page
│   ├── Dashboard.tsx           # User's private dashboard
│   ├── Profile.tsx             # Public profile (/u/:username)
│   └── NotFound.tsx            # 404 page
├── stores/
│   └── uiStore.ts              # Zustand store (theme, modals, etc.)
├── App.tsx                     # Router setup
├── App.css                     # Global styles (migrate to Tailwind)
├── main.tsx                    # App entry point
└── vite-env.d.ts               # Vite types
```

### Key Pages & Routes
| Route | Page | Access | Description |
|-------|------|--------|-------------|
| `/` | Landing | Public | Marketing/intro page with CTA to sign up |
| `/login` | Login | Public | Login form |
| `/signup` | Signup | Public | Signup form (email, username, password) |
| `/dashboard` | Dashboard | Private | User's own items (editable) |
| `/u/:username` | Profile | Public | Public profile view (read-only) |
| `/settings` | Settings | Private | Edit profile, change password (Phase 2) |

### Component Hierarchy
```
App
├── Layout
│   ├── Header (logo, nav, user menu)
│   └── Footer
└── Routes
    ├── Landing (public)
    ├── Login (public)
    ├── Signup (public)
    ├── Dashboard (private)
    │   ├── WatchedItemsList
    │   │   └── WatchedItem (with edit/delete actions)
    │   └── AddItemDialog
    │       └── ItemForm (with RatingDots selector)
    └── Profile (public)
        ├── ProfileHeader (avatar, display name, stats)
        └── YearSection[] (grouped items by year)
            └── WatchedItem (read-only)
```

---

## Security Considerations

### Supabase Row Level Security (RLS)
```sql
-- Users can only read their own data
CREATE POLICY "Users can view own watched items"
  ON watched_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own data
CREATE POLICY "Users can insert own watched items"
  ON watched_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own data
CREATE POLICY "Users can update own watched items"
  ON watched_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own data
CREATE POLICY "Users can delete own watched items"
  ON watched_items FOR DELETE
  USING (auth.uid() = user_id);
```

### Frontend Security
- Never expose Supabase service key (only anon key)
- Validate all user inputs (Zod schemas)
- Sanitize user-generated content
- Use HTTPS only
- Implement rate limiting (Supabase has built-in)

---

## Migration Strategy (Supabase → Custom Backend)

When needed, migration is straightforward:

1. **Export data**: Supabase uses PostgreSQL, use `pg_dump`
2. **Set up new backend**: Express + Prisma/Drizzle
3. **Migrate database**: Import SQL dump to your PostgreSQL
4. **Replace API calls**: Swap Supabase client calls with REST/GraphQL
5. **Implement auth**: JWT with same user IDs
6. **Gradual rollout**: Use feature flags

**Cost estimation**:
- Supabase free tier: 0-50K MAU → $0
- Supabase Pro: 50K+ MAU → $25/month
- Custom backend: VPS ($5-20/mo) + DB ($10-20/mo) = $15-40/mo
- Migrate when you hit 50K users or need advanced features

---

## Implementation Phases

### Phase 1: MVP Foundation (Week 1-2)
**Goal**: Get basic CRUD working with authentication

- [ ] **Backend Setup** (Day 1-2)
  - Set up Supabase project
  - Create database schema with RLS policies
  - Test auth flow manually

- [ ] **Project Structure** (Day 3)
  - Install dependencies (Supabase, React Router, TanStack Query, Zustand)
  - Set up folder structure (see below)
  - Configure env variables
  - Set up Tailwind CSS (migrate from current CSS)

- [ ] **Authentication** (Day 4-5)
  - Build login/signup UI
  - Implement auth context/hook
  - Protected routes
  - Logout functionality

- [ ] **Core Features** (Day 6-10)
  - Display user's watched items (replace hardcoded data)
  - Add new item form (title, type, rating, date)
  - Edit existing item
  - Delete item
  - Basic validation with Zod

- [ ] **Public Profile** (Day 11-12)
  - Create username on signup (unique constraint)
  - Public profile page at `/u/{username}`
  - Show all watched items grouped by year
  - Keep existing 3-dot rating display

- [ ] **Basic Polish** (Day 13-14)
  - Loading states
  - Error handling
  - Basic responsive design
  - Deploy to Vercel

**Deliverable**: Working app where users can sign up, add/edit/delete shows, and share their profile URL

---

### Phase 2: Enhancement (Week 3-4)
**Goal**: Better UX with metadata and improved UI

- [ ] **TMDB API Integration** (Day 1-3)
  - Get TMDB API key
  - Search movies/shows by title
  - Auto-populate poster, year, metadata
  - Fallback to manual entry if not found

- [ ] **UI Improvements** (Day 4-7)
  - Integrate Shadcn/ui components (Button, Dialog, Input, etc.)
  - Better forms with React Hook Form
  - Improved mobile responsive design
  - Dark mode toggle (optional)

- [ ] **Filtering & Sorting** (Day 8-10)
  - Filter by type (movie/TV)
  - Filter by rating (1-3 dots)
  - Sort by date, title, rating
  - Search within user's items

- [ ] **Profile Enhancements** (Day 11-12)
  - User avatar upload
  - Display name editing
  - Stats (total watched, breakdown by rating)
  - "Watching" badge support

**Deliverable**: Polished MVP with auto-metadata and better UX

---

### Phase 3: Polish & Launch (Week 5)
**Goal**: Production-ready app

- [ ] **Performance** (Day 1-2)
  - Image optimization (poster thumbnails)
  - TanStack Query caching tuning
  - Code splitting with React.lazy
  - Lighthouse audit

- [ ] **Quality** (Day 3-4)
  - Error boundaries
  - Loading skeletons
  - Empty states
  - Toast notifications
  - Accessibility audit (keyboard nav, ARIA labels)

- [ ] **SEO & Sharing** (Day 5)
  - Meta tags for profile pages
  - Open Graph tags (for sharing on social media)
  - Twitter cards
  - Sitemap generation

**Deliverable**: Production-ready app ready for users

---

### Phase 4: Future Enhancements (Post-MVP)
**When to do**: After getting user feedback

- [ ] **Social Features** (if users request)
  - Follow friends
  - Activity feed
  - Recommendations based on similar users

- [ ] **Export & Import** (if users request)
  - Export data (CSV/JSON)
  - Import from Letterboxd, IMDb, etc.

- [ ] **Advanced Features**
  - Watch history (multiple watches of same item)
  - Notes/reviews per item
  - Tags/lists (e.g., "Favorites", "To Rewatch")
  - Year-end wrapped (like Spotify Wrapped)

- [ ] **Scale** (when needed)
  - Evaluate if Supabase limits hit
  - Plan custom backend migration if needed
  - Add caching layer (Redis)
  - CDN for images

---

### Timeline Summary
- **Week 1-2**: MVP Foundation → Users can add/edit/delete items
- **Week 3-4**: Enhancement → TMDB integration + better UI
- **Week 5**: Polish → Production launch
- **Total**: ~5 weeks to production-ready app

---

## Cost Breakdown (First Year)

**Scenario 1: Low traffic (0-1K users)**
- Supabase: Free tier
- Vercel: Free tier
- Domain: $12/year
- **Total: ~$12/year**

**Scenario 2: Medium traffic (1K-10K users)**
- Supabase: $25/month
- Vercel: Free tier (or Pro $20/mo if needed)
- Domain: $12/year
- **Total: ~$300-540/year**

**Scenario 3: High traffic (10K-50K users)**
- Supabase: $25-100/month
- Vercel: $20/month
- Monitoring: $10-20/month
- **Total: ~$660-1,680/year**

---

## Dependencies to Install

### Core Dependencies (npm install)
```bash
# Backend/Database
npm install @supabase/supabase-js
# Why: Official Supabase client for auth, database, and storage

# Routing
npm install react-router-dom
# Why: Standard routing library for React, v6 has best DX

# Server State Management
npm install @tanstack/react-query
# Why: Best solution for fetching/caching/syncing server data

# Client State Management
npm install zustand
# Why: Simplest state management (1KB), no boilerplate

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers
# Why: react-hook-form = best performance, zod = TypeScript schema validation

# Dates
npm install date-fns
# Why: Tree-shakeable, good TypeScript support

# Utilities
npm install clsx tailwind-merge
# Why: For conditional Tailwind classes (used by Shadcn/ui)
```

### Dev Dependencies (npm install -D)
```bash
# Styling
npm install -D tailwindcss postcss autoprefixer
# Why: Utility-first CSS, industry standard

# Shadcn/ui setup (after Tailwind is configured)
npx shadcn@latest init
# Why: Will set up components directory and base config
```

### Phase 2 Dependencies (Later)
```bash
# TMDB API client (when adding metadata)
npm install axios
# Why: Simpler API client for TMDB HTTP requests

# Image optimization (when adding posters)
npm install sharp
# Why: Fast image processing (thumbnails, compression)
```

### Total Bundle Size Estimate
- React + React DOM: ~130 KB
- Supabase client: ~50 KB
- React Router: ~15 KB
- TanStack Query: ~40 KB
- Zustand: ~1 KB
- React Hook Form: ~25 KB
- Zod: ~15 KB
- date-fns: ~5 KB (tree-shaken)
- Tailwind CSS: ~3 KB (production, purged)
- **Total: ~284 KB gzipped**

Compare to:
- Firebase: ~180 KB (but locked in)
- Redux Toolkit: ~45 KB (vs Zustand 1 KB)
- MUI: ~300 KB (vs Shadcn/ui ~20 KB)

---

## Next Steps to Start Implementation

### Step 1: Set Up Supabase (15 minutes)
1. Go to https://supabase.com
2. Sign up / login
3. Create new project:
   - Project name: `dotdot`
   - Database password: (generate strong password)
   - Region: Choose closest to target users
4. Wait for project to provision (~2 minutes)
5. Get credentials from Settings → API:
   - Project URL: `https://xxx.supabase.co`
   - Anon key: `eyJ...` (safe to expose publicly)
6. Save to `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

### Step 2: Create Database Schema (10 minutes)
Run this SQL in Supabase SQL Editor:

```sql
-- Create users profile table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint username_length check (char_length(username) >= 3 and char_length(username) <= 30),
  constraint username_format check (username ~ '^[a-zA-Z0-9_-]+$')
);

-- Create watched_items table (shows/movies you enjoyed)
create table public.watched_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('movie', 'tv_show')),
  title text not null,
  year int,
  poster_url text,
  tmdb_id int,
  rating int not null check (rating >= 1 and rating <= 3), -- 1=Liked, 2=Really Liked, 3=Loved
  watched_date date not null,
  notes text,
  watching boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for performance
create index watched_items_user_id_idx on public.watched_items(user_id);
create index watched_items_watched_date_idx on public.watched_items(watched_date);
create index profiles_username_idx on public.profiles(username);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.watched_items enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Watched items policies
create policy "Public watched items viewable by everyone"
  on public.watched_items for select
  using (true);

create policy "Users can insert own watched items"
  on public.watched_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own watched items"
  on public.watched_items for update
  using (auth.uid() = user_id);

create policy "Users can delete own watched items"
  on public.watched_items for delete
  using (auth.uid() = user_id);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'display_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Step 3: Install Dependencies (5 minutes)
```bash
npm install @supabase/supabase-js @tanstack/react-query react-router-dom zustand react-hook-form zod @hookform/resolvers date-fns clsx tailwind-merge

npm install -D tailwindcss postcss autoprefixer

npx tailwindcss init -p
```

### Step 4: Configure Tailwind (5 minutes)
Update `tailwind.config.js`:
```js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Step 5: Initialize Shadcn/ui (5 minutes)
```bash
npx shadcn@latest init
```
Choose:
- Style: Default
- Base color: Zinc
- CSS variables: Yes

### Total Setup Time: ~40 minutes
Then ready to start coding!

---

## Product Decisions (Confirmed)

1. **Rating system**: 3-dot system (score 1-3)
   - ● = Liked
   - ●● = Really liked
   - ●● = Loved
2. **Privacy**: Simple public profiles - each user gets a shareable URL at `/u/{username}`
   - No privacy settings for MVP (all profiles are public)
   - Users share their URL with friends
3. **Social features**: None for MVP - just personal tracking + URL sharing
4. **Metadata**: TMDB API integration for auto-fetching posters/metadata
5. **Platform**: Web-only (responsive design)
6. **Monetization**: Free (no monetization for prototype)
7. **Year view**: Display shows/movies by year watched (as seen in current prototype)

## Simplified Data Model (Updated)

### User
```typescript
{
  id: uuid (PK)
  email: string
  username: string (unique, used in public URL)
  display_name: string
  avatar_url?: string
  created_at: timestamp
  updated_at: timestamp
}
```
- Public profile accessible at: `/u/{username}`
- No privacy settings for MVP

### WatchedItem
```typescript
{
  id: uuid (PK)
  user_id: uuid (FK -> User)
  type: 'movie' | 'tv_show'
  title: string
  year?: number
  poster_url?: string
  tmdb_id?: number
  rating: number  // 1-3 (1=Liked, 2=Really Liked, 3=Loved)
  watched_date: date
  notes?: string
  watching?: boolean  // Currently watching (in progress)
  created_at: timestamp
  updated_at: timestamp
}
```
- Simplified: rating moved into watched_item (no separate ratings table)
- Only items you enjoyed (rating 1-3) - no negative ratings
- Each watch is a new entry (if rewatching something you loved again, create new item)
