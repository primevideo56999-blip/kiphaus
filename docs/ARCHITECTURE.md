# Technical Architecture Document

## Tech Stack
- **Frontend Framework:** Next.js (App Router) + React
  - *Reasoning:* Provides excellent SEO out-of-the-box (crucial for a travel marketplace), fast page loads via Server-Side Rendering (SSR), and seamless API routes for backend integrations.
- **Styling:** Vanilla CSS & CSS Modules (Neumorphism Design System)
  - *Reasoning:* Neumorphism requires precise control over multi-layered box-shadows, inset shadows, and subtle gradients. Vanilla CSS ensures we maintain exact design tokens without framework bloat.
- **Backend / API Layer:** External Backend (Managed Separately)
  - *Reasoning:* Someone else is working on the backend. The frontend will communicate with this external backend. Next.js API Routes (`/api`) may be used strictly as a proxy/BFF (Backend For Frontend) if needed for secure token handling, but core logic lives externally.
- **Database:** PostgreSQL (managed via Supabase or Neon)
  - *Reasoning:* Relational data structure is perfect for properties, hosts, bookings, and verifications. High reliability and scalability.
- **Authentication:** Firebase Auth
  - *Reasoning:* Easy implementation for phone number OTPs (critical for Indian user base), Google login, and email/password authentication.
- **Hosting:** Vercel
  - *Reasoning:* Native optimization for Next.js, automated deployments, and edge network capabilities.

## File & Folder Structure
```
/kiphaus
├── /app                  # Next.js App Router root
│   ├── /(auth)           # Authentication route group
│   │   ├── /login        # Login page
│   │   ├── /signup       # Registration page
│   │   ├── /forget       # Forgot password
│   │   ├── /verify       # OTP / Email verification
│   │   └── /reset        # Password reset
│   ├── /(guest)          # Guest facing routes (Search, Property details)
│   ├── /(host)           # Host facing routes (Dashboard, Onboarding)
│   ├── /(legal)          # Legal documents route group
│   │   ├── /terms        # Terms of Service
│   │   ├── /policy       # Privacy Policy
│   │   └── /cookies      # Cookie Policy
│   ├── /(public)         # Public info pages
│   │   ├── /about        # About Us
│   │   ├── /blog         # Company Blog / Articles
│   │   └── /contact      # Contact Us
│   ├── layout.tsx        # Root layout (Providers, Fonts)
│   └── page.tsx          # Main landing page
├── /components           # Reusable UI components
│   ├── /ui               # Neumorphic primitives (Buttons, Cards, Inputs)
│   ├── /layout           # Header, Footer, Sidebar
│   ├── /shared           # Shared components used across features
│   └── /features         # Complex feature components (SearchBox, ImageGallery)
├── /hooks                # Custom React hooks (e.g., useAuth, useMediaQuery)
├── /services             # External API integration services (connecting to the separate backend)
├── /styles               # Global CSS and Neumorphism Tokens
│   ├── globals.css       # CSS Variables (Colors, Shadows)
│   └── neumorphism.css   # Utility classes for soft UI effects
├── /lib                  # Utility functions and configurations
│   ├── firebase.ts       # Firebase initialization
│   ├── db.ts             # PostgreSQL client setup
│   └── utils.ts          # Helper functions (currency formatting, date parsing)
├── /types                # TypeScript interfaces and types
├── /public               # Static assets (Images, Icons)
└── /docs                 # Project documentation (PRD, Architecture, etc.)
```

## Database Schema (PostgreSQL)

**1. `users` Table**
- `id` (UUID, Primary Key)
- `role` (String: 'guest', 'host', 'admin')
- `full_name` (String)
- `phone_number` (String, Unique)
- `email` (String, Unique)
- `created_at` (Timestamp)

**2. `properties` Table**
- `id` (UUID, Primary Key)
- `host_id` (UUID, Foreign Key -> users.id)
- `title` (String)
- `description` (Text)
- `price_per_night` (Decimal)
- `city` (String)
- `state` (String)
- `whatsapp_number` (String)
- `verification_level` (Integer: 0, 1, 2, 3, 4)
- `is_active` (Boolean)
- `created_at` (Timestamp)

**3. `property_images` Table**
- `id` (UUID, Primary Key)
- `property_id` (UUID, Foreign Key -> properties.id)
- `image_url` (String)
- `is_primary` (Boolean)

**4. `subscriptions` Table**
- `id` (UUID, Primary Key)
- `host_id` (UUID, Foreign Key -> users.id)
- `plan_type` (String: 'basic', 'premium')
- `status` (String: 'active', 'expired', 'pending')
- `start_date` (Timestamp)
- `end_date` (Timestamp)

## Environment & Config Notes
- **Never Hardcode:** API keys, Database URLs, and JWT secrets.
- **Environment Variables Required:**
  - `NEXT_PUBLIC_FIREBASE_API_KEY`: Client-side Firebase key.
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain.
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID.
  - `DATABASE_URL`: Connection string for PostgreSQL database (Server-side only).
  - `WHATSAPP_API_TOKEN`: If using official WhatsApp Business API for automated messages (Server-side only).
  - `NEXT_PUBLIC_APP_URL`: Base URL for sharing links and callbacks.
