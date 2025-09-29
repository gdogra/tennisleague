# Tennis League San Diego

[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)

Replace OWNER/REPO with your GitHub org and repository.

A modern React app for Tennis League San Diego with member login, product catalog, cart, checkout, and order history. The app runs entirely on static hosting using an in‑browser backend that persists to localStorage.

## Tech Stack

- React 18 + TypeScript + Vite
- TailwindCSS + ShadCN UI
- React Router + TanStack Query
- Lucide icons

## Local Development

Prereqs: Node 18+

Commands:

```bash
nvm use 18   # or install Node 18
npm install
npm run dev
```

Open http://localhost:5173

## Static Backend

The app uses a lightweight in‑browser backend (`src/lib/backend.ts`) that:
- Seeds products and categories
- Stores auth, members, cart, and orders in `localStorage`
- Requires no external APIs

## Deploy

Netlify:
- `netlify.toml` included (build: `npm run build`, publish: `dist`, Node 18)
- Optional CI deploy: `.github/workflows/deploy-netlify.yml`
  - Set repo secrets: `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`
  - Uses GitHub Environment `production` (configure required reviewers if desired)

Render (Static Site):
- `render.yaml` included (Node 18, build and publish `dist`)
- Optional CI deploy: `.github/workflows/deploy-render.yml`
  - Set repo secrets: `RENDER_API_KEY` and `RENDER_SERVICE_ID`
 - SPA fallback: `static.json` is included to rewrite all routes to `/index.html`.
  - Uses GitHub Environment `production` (configure required reviewers if desired)

GitHub Actions CI:
- `.github/workflows/ci.yml` runs type check and build on push/PR

## Docker

Build the production image and run it locally:

```bash
docker build -t tennisleague:latest .
docker run --rm -p 8080:80 tennisleague:latest
```

Open http://localhost:8080

Notes:
- Multi-stage build uses Node 18 to build, then serves `dist` with `serve` binding to `$PORT` (works on Render).
- For Nginx-based serving, use `docker/nginx.conf` and adjust to listen on `$PORT` with a startup script; not used by default.

## Scripts

- `npm run dev` – start Vite dev server
- `npm run build` – build for production
- `npm run preview` – preview built app

A clean, modern React template with TypeScript, Vite, TailwindCSS, and ShadCN UI components. This template provides a solid foundation for building web applications with best practices in mind.

## Tech Features

- ⚡️ **Vite** - Lightning fast build tool
- 🔥 **React 18** - Latest React features
- 🧩 **TypeScript** - Type safety for better developer experience
- 🎨 **TailwindCSS** - Utility-first CSS framework
- 🧰 **ShadCN UI** - Accessible and customizable UI components
- 📱 **Responsive Design** - Mobile-first approach
- 🧭 **React Router** - Easy client-side routing
- 🔄 **React Query** - Data fetching and state management
- 🧪 **Form Handling** - React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Installation

1. Clone this repository:
```bash
git clone https://github.com/your-username/react-template-project.git
cd react-template-project
```

2. Install dependencies:
```bash
npm install
# or
yarn
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open your browser and visit `http://localhost:5173`

## Project Structure

```
react-template-project/
├── public/              # Static assets
│   ├── components/      # Reusable components
│   │   └── ui/          # UI components from ShadCN
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and libraries
│   ├── pages/           # Page components
│   ├── App.tsx          # Main application component
│   ├── index.css        # Global styles
│   └── main.tsx         # Application entry point
├── .gitignore
├── package.json         # Project dependencies and scripts
├── tailwind.config.ts   # TailwindCSS configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Customization

- **Styling**: Modify `tailwind.config.ts` to customize your design tokens
- **Components**: Add or modify components in the `src/components` directory
- **Pages**: Create new pages in the `src/pages` directory
- **Routing**: Update routes in `src/App.tsx`

## Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `dist` directory, ready to be deployed.
