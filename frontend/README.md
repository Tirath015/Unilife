# UniLife Developer React Project

A professional React/Vite frontend for **UniLife**, built like a real developer project instead of keeping every screen inside `App.jsx`.

## What this version includes

- React Router routes for every screen
- Protected routes for authenticated pages
- AuthContext for login, signup, logout, and session handling
- WishlistContext for saved Marketplace items
- API service layer prepared for ASP.NET Core backend APIs
- Mock mode so the frontend works before the backend is complete
- Marketplace as the main working module
- Dashboard, Events, Resources, Notifications, Jobs, Discussions, Profile, and Bruno AI as polished prototype modules
- Floating Bruno AI chatbot at bottom-right
- Responsive layout with mobile bottom navigation
- Centralized CSS using the required UniLife color palette

## Run the project

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal, usually:

```bash
http://localhost:5173/
```

## Demo login

Because mock mode is turned on, you can use:

```text
Email: student@college.ca
Password: Password123
```

## Backend connection

The project is already prepared for backend APIs.

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

When your ASP.NET Core backend is ready, update:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_MOCKS=false
```

While `VITE_USE_MOCKS=true`, pages use local demo data through service files. When it becomes `false`, the same pages call the real backend API.

## Folder structure

```text
src/
├── api/                 # API config and reusable fetch client
├── assets/              # Static assets if needed later
├── components/          # Reusable UI and layout components
│   ├── layout/          # TopNav, Sidebar, BottomNav, AppLayout, BrunoWidget
│   └── ui/              # Button, Card, LoadingState, EmptyState
├── context/             # AuthContext and WishlistContext
├── data/                # Mock data used only before backend is ready
├── hooks/               # Reusable hooks
├── pages/               # Full screens/pages
│   ├── auth/            # Login and Signup
│   ├── marketplace/     # Marketplace, ProductDetails, CreateListing, Wishlist
│   └── prototype/       # Events, Resources, Jobs, Discussions, Notifications
├── services/            # Backend-ready API service functions
├── utils/               # Formatters and validators
├── App.jsx              # Route setup only
├── main.jsx             # React entry point
└── styles.css           # Global styling and responsive design
```

## How to explain this to your professor

> The app is separated into pages, reusable components, context, services, and API files. The UI does not directly depend on hardcoded data. Instead, pages call service files such as `marketplaceService`, `authService`, and `notificationsService`. During the prototype phase, those services return mock data. When the ASP.NET Core backend is ready, we only change the environment variable and the services will call real REST APIs using JWT authentication.

## Important security note

The frontend never stores or hashes passwords by itself. Password hashing, validation, JWT generation, role checks, and database security must be handled in the backend. The frontend only sends login/register requests to the backend and stores the returned JWT token for authorized API calls.
