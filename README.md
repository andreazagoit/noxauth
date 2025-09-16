# NoxAuth - OAuth Provider

A minimal OAuth authentication provider built with Next.js, JWT, Neon, and Drizzle ORM.

## Features

- 🔐 JWT-based authentication with access and refresh tokens
- 🌐 OAuth support for Google and GitHub
- 🗄️ PostgreSQL database with Neon
- 🔧 Type-safe database queries with Drizzle ORM
- 🍪 Secure HTTP-only cookies
- 📱 Responsive UI with Tailwind CSS

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment variables:**
   Create a `.env` file with the following variables:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@host:5432/database"

   # JWT Secrets (generate random strings)
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key"

   # App URL
   NEXTAUTH_URL="http://localhost:3000"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # GitHub OAuth
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   ```

3. **Database setup:**

   ```bash
   npm run db:push
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` as redirect URI

### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`

## API Endpoints

- `GET /api/auth/signin/[provider]` - Initiate OAuth flow
- `GET /api/auth/callback/[provider]` - Handle OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/signout` - Sign out user

## Database Schema

- **users**: User profiles with email, name, role
- **credentials**: Password hashes for local auth (future)
- **oauth_accounts**: OAuth account links

## Usage

Visit `http://localhost:3000` to see the sign-in page with OAuth providers.

After authentication, users are redirected to `/dashboard` where they can view their profile and sign out.
