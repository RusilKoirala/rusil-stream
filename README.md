# Rusil Stream

A modern, Netflix-style movie streaming web app built with Next.js, Vite, and Tailwind CSS. Powered by TMDB and VidSrc APIs, featuring a beautiful, responsive UI, authentication, and a premium movie player experience.

## Features

- **Netflix-inspired UI:** Hero banner, carousels, genre pills, and modern gradients.
- **Authentication:** Login/logout, route protection, and profile management.
- **Profile Settings:** Change username, password, and profile picture (with fallback).
- **Responsive Design:** Fully mobile-friendly, with hamburger menu and adaptive layouts.
- **Movie Player:** Large video player, transparent navbar, genre tags, and detailed info.
- **Search:** Find movies by title or genre.
- **Custom Branding:** Transparent logo and Netflix-style text branding.
- **Easy User Management:** Add users by editing a single file.

## Getting Started

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd my-nextjs-movie-app
```

### 2. Install dependencies
```sh
npm install
```

### 3. Run the development server
```sh
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

### 4. Add/Manage Users
Edit the users array in `src/app/api/login/route.js` and `src/app/login/page.js` to add or update users and their profile pictures.

## Deploying to Vercel
1. Push your code to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com](https://vercel.com), sign in, and import your repo.
3. Click **Deploy**. Vercel will build and host your app automatically.

## Credits
- [TMDB API](https://www.themoviedb.org/documentation/api) for movie data
- [VidSrc API](https://vidsrc.to/) for streaming
- [Next.js](https://nextjs.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ by Rusil**
