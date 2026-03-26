# Rusil Stream - Netflix-like Streaming Platform

A full-stack, production-style streaming demo app built with Next.js, MongoDB, TMDB API, and vidsrc. Features Netflix-inspired UI, user authentication, multiple profiles, watch history, and saved lists.

## Features

- **Modern Netflix-like UI**: Smooth transitions, glossy poster tiles, dark theme with unique accent colors
- **Email Verification**: Secure signup with email verification via Resend API
- **JWT Authentication**: Email/password login with JWT tokens stored in httpOnly cookies and localStorage
- **Multiple Profiles**: Up to 5 profiles per account with "Who's watching?" selection
- **Watch History**: Track viewing progress per profile
- **Saved Lists**: Add movies to "My List" for later viewing
- **TMDB Integration**: Real movie metadata, posters, and details
- **TV Shows Support**: Browse and watch TV series with season/episode selection
- **Streaming**: vidsrc-embed.ru powered video playback with autoplay
- **Responsive Design**: Mobile-first, works on all devices
- **Server-side Caching**: TMDB API responses cached for performance
- **SEO Optimized**: Complete meta tags, Open Graph, and Twitter Card support
- **PWA Ready**: Manifest.json for progressive web app capabilities

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with httpOnly cookies + localStorage
- **Email Service**: Resend API for email verification
- **Styling**: Tailwind CSS 4
- **Data Source**: TMDB API
- **Streaming**: vidsrc-embed.ru player
- **State Management**: React hooks + localStorage
- **Security**: bcryptjs for password hashing, JWT tokens

## Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── (auth)/               # Auth route group — no URL prefix
│   │   │   ├── login/            → /login
│   │   │   └── verify-email/     → /verify-email
│   │   ├── (main)/               # Main app route group — no URL prefix
│   │   │   ├── home/             → /home
│   │   │   ├── movies/           → /movies
│   │   │   ├── movie/[id]/       → /movie/:id
│   │   │   ├── tv-shows/         → /tv-shows
│   │   │   ├── player/[id]/      → /player/:id
│   │   │   ├── my-list/          → /my-list
│   │   │   └── settings/         → /settings
│   │   ├── (admin)/              # Admin route group — no URL prefix
│   │   │   └── dev-tools/        → /dev-tools
│   │   ├── api/                  # API routes (domain-grouped)
│   │   │   ├── auth/             # Auth endpoints
│   │   │   ├── login/            # Login endpoint
│   │   │   ├── movies/           # TMDB proxy with caching
│   │   │   ├── history/          # Watch history
│   │   │   ├── saved/            # Saved list
│   │   │   ├── profile/          # Profile management
│   │   │   ├── stream/           # Stream URL proxy
│   │   │   └── admin/            # Admin endpoints
│   │   ├── profiles/             # Profile selection page
│   │   ├── layout.js             # Root layout
│   │   ├── page.js               # Root page (redirect)
│   │   ├── globals.css
│   │   ├── error.js
│   │   ├── loading.js
│   │   └── not-found.js
│   ├── components/
│   │   ├── layout/               # Navigation, headers, page shells
│   │   │   ├── AppNavbar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Logo.jsx
│   │   ├── media/                # Image, video, and content display
│   │   │   ├── OptimizedImage.jsx
│   │   │   └── SkeletonLoader.jsx
│   │   ├── ui/                   # Generic, reusable UI primitives
│   │   │   ├── Loading.js
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── DefaultProfileSVG.jsx
│   │   ├── features/             # Feature-specific, page-coupled components
│   │   │   ├── HomePageClient.jsx
│   │   │   ├── MovieShareClient.jsx
│   │   │   ├── FirstVisitNotice.jsx
│   │   │   ├── PWAInstallPrompt.jsx
│   │   │   ├── PushNotifications.jsx
│   │   │   └── DevToolsSuppress.jsx
│   │   └── index.js              # Barrel — re-exports all components
│   ├── lib/
│   │   ├── db.js                 # MongoDB connection
│   │   ├── auth.js               # Auth utilities (JWT helpers)
│   │   └── tmdb.js               # TMDB API wrapper with caching
│   ├── models/
│   │   ├── User.js               # User schema with profiles
│   │   ├── WatchHistory.js       # Watch history schema
│   │   └── SavedList.js          # Saved list schema
│   └── middleware.js             # Next.js route middleware
├── packages/
│   └── shared/                   # Shared utilities (future cross-platform)
│       ├── package.json          # @streaming-app/shared
│       └── index.js              # Candidate exports for mobile/TV apps
├── apps/                         # Future mobile/TV apps (see apps/README.md)
├── scripts/                      # Dev/maintenance scripts
│   └── seed.js
└── public/                       # Static assets
```

### Component Categories

When adding a new component, pick the category that matches its responsibility:

| Category | Folder | Use for |
|---|---|---|
| `layout` | `src/components/layout/` | Navigation bars, page shells, headers, footers — anything that wraps or frames content |
| `media` | `src/components/media/` | Images, video players, thumbnails, skeleton loaders — anything that displays media |
| `ui` | `src/components/ui/` | Generic, stateless primitives (spinners, icons, buttons) with no feature-specific logic |
| `features` | `src/components/features/` | Components tightly coupled to a specific feature or page (home page client, share dialogs, etc.) |

Import components via the barrel for clean paths:

```js
import { AppNavbar, LoadingSpinner, HomePageClient } from '@/components';
// or directly from the subfolder:
import AppNavbar from '@/components/layout/AppNavbar';
```

### Route Group Conventions

Route groups use parentheses in the folder name and **do not affect URL paths**. Use them to co-locate related pages and share layouts without changing URLs.

- `(auth)` — unauthenticated pages (login, signup, verify)
- `(main)` — authenticated app pages (home, browse, player)
- `(admin)` — admin-only pages

To add a new page:
1. Decide which group it belongs to (or create a new group if needed)
2. Create `src/app/(group)/your-route/page.js`
3. The URL will be `/your-route` — the group name is invisible to the router

To add a shared layout for a group, create `src/app/(group)/layout.js`. It will wrap only the pages inside that group without affecting others.

### API Route Conventions

All API routes live under `src/app/api/` and are grouped by domain. When adding a new endpoint, place it under the matching domain folder (e.g., `src/app/api/auth/` for auth-related endpoints). See `src/app/api/README.md` for details.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)
- TMDB API key (free from themoviedb.org)
- Resend API key (free from resend.com)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd my-nextjs-movie-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rusilstream
TMDB_API_KEY=your_tmdb_api_key
NEXTAUTH_SECRET=your-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=your_resend_api_key
```

4. Seed the database (creates demo user):
```bash
npm run seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `TMDB_API_KEY` | TMDB API key for movie data | Yes |
| `NEXTAUTH_SECRET` | JWT secret (min 32 chars) | Yes |
| `NEXTAUTH_URL` | App URL (for production) | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL for email links | Yes |
| `RESEND_API_KEY` | Resend API key for emails | Yes |

### Getting API Keys

**TMDB API Key:**
1. Sign up at [themoviedb.org](https://www.themoviedb.org/)
2. Go to Settings → API
3. Request an API key (free)
4. Copy the "API Key (v3 auth)"

**MongoDB Atlas:**
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get connection string from "Connect" → "Connect your application"

**Resend API Key:**
1. Sign up at [resend.com](https://resend.com/)
2. Verify your domain (or use their test domain for development)
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `re_`)

## Key Features Explained

### Authentication Flow
1. User signs up with email/password/name
2. Verification email sent via Resend API
3. User clicks verification link in email
4. Email verified, account activated
5. Password hashed with bcrypt
6. JWT token stored in httpOnly cookie + localStorage
7. Middleware protects routes
8. Profile selection after login

### Profile System
- Each user can have up to 5 profiles
- Profiles stored as subdocuments in User model
- Selected profile ID stored in localStorage
- Watch history and saved lists are profile-specific

### Watch History
- Automatically tracked when playing a movie
- Updates every 30 seconds during playback
- Stores last position and watched percentage
- Status: watching, completed (>85%), paused

### TMDB Caching
- Server-side in-memory cache with 30-minute TTL
- Reduces API calls and improves performance
- Caches: trending, popular, top rated, search, details

### Streaming
- vidsrc.to embed player
- Supports HLS streaming
- Full-screen capable
- No direct API key needed (embed-based)

## API Routes

### Authentication
- `POST /api/auth/send-verification` - Send verification email
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/login` - Login (requires verified email)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Movies (TMDB)
- `GET /api/movies` - Trending movies
- `GET /api/movies?type=popular` - Popular movies
- `GET /api/movies?type=top_rated` - Top rated
- `GET /api/movies?query=search` - Search movies
- `GET /api/movies?id=123` - Movie details

### Profiles
- `POST /api/profile` - Create profile
- `PUT /api/profile` - Update profile
- `DELETE /api/profile?profileId=xxx` - Delete profile

### Watch History
- `GET /api/history?profileId=xxx` - Get history
- `POST /api/history` - Update watch progress

### Saved List
- `GET /api/saved?profileId=xxx` - Get saved movies
- `POST /api/saved` - Add to list
- `DELETE /api/saved?profileId=xxx&movieId=123` - Remove

### Streaming
- `GET /api/stream/[id]` - Get stream URL

## Database Schemas

### User
```javascript
{
  email: String (unique),
  passwordHash: String,
  profiles: [{
    name: String,
    avatarUrl: String,
    preferences: Object
  }],
  emailVerified: Boolean,
  verificationToken: String,
  verificationTokenExpiry: Date,
  createdAt: Date,
  isAdmin: Boolean
}
```

### WatchHistory
```javascript
{
  userId: ObjectId,
  profileId: ObjectId,
  movieId: Number,
  movieTitle: String,
  posterPath: String,
  lastPlayedAt: Date,
  lastPositionSec: Number,
  watchedPercentage: Number,
  status: 'watching' | 'completed' | 'paused'
}
```

### SavedList
```javascript
{
  userId: ObjectId,
  profileId: ObjectId,
  movieId: Number,
  movieTitle: String,
  posterPath: String,
  addedAt: Date
}
```

### Security Notes
- ✅ Your API keys are **safe** in Vercel environment variables
- ✅ They are **encrypted** and **not exposed** to the browser
- ✅ Only server-side code can access them
- ✅ Never commit `.env` file to GitHub (already in `.gitignore`)

### Environment Variables for Production
```env
MONGODB_URI=your_mongodb_connection_string
TMDB_API_KEY=your_tmdb_api_key
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
NODE_ENV=production
```

Generate secure secret:
```bash
openssl rand -base64 32
```

## Development Notes

### Caching Strategy
- TMDB responses cached server-side for 30 minutes
- Reduces API calls and improves performance
- Cache automatically expires and refreshes

### Security
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens in httpOnly cookies (XSS protection)
- Middleware protects all authenticated routes
- No sensitive data exposed to client

### Performance
- Server components for initial page loads
- Client components for interactivity
- Image optimization with Next.js Image
- Lazy loading for carousels

## Future Enhancements

- [x] Continue watching carousel on home page
- [x] TV show support with season/episode selection
- [x] Email verification
- [ ] Advanced search filters
- [ ] User reviews and ratings
- [ ] Social features (share, recommend)
- [ ] Password reset via email
- [ ] Admin dashboard
- [ ] Analytics dashboard
- [ ] Parental controls
- [ ] Download for offline viewing
- [ ] Watchlist sharing between profiles
- [ ] Recommendations based on watch history

## Educational Purpose

This project is for educational purposes only. It demonstrates:
- Full-stack Next.js development
- MongoDB integration with Mongoose
- JWT authentication
- API design and caching
- Modern React patterns
- Responsive UI design
- Video streaming integration

## License

MIT License - Educational Project

## Credits

- Movie data from [TMDB](https://www.themoviedb.org/)
- Streaming via [vidsrc-embed.ru](https://vidsrc-embed.ru/)
- Email service by [Resend](https://resend.com/)
- UI inspired by Netflix, Disney+, and HBO Max

---

**Made by [Rusil Koirala](https://rusilkoirala.com.np)**

Built with ❤️ for learning and demonstration purposes.
