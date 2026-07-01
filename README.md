# 📚 Lumina Sphere

> The Immersive Culture OS — un lector de EPUB/PDF que conecta cada libro con su "vibra": películas, playlists y charlas con sus personajes.

Lumina Sphere es una app de lectura inmersiva. Subís un libro (EPUB/PDF) o lo buscás en catálogos públicos, lo leés in-app, y la IA te arma un universo alrededor: el **mood** del libro se cruza con **películas (TMDB)** y **playlists para leer (Spotify)**, y podés **chatear con los personajes** del libro, que la IA extrae automáticamente.

---

## ✨ Features

- **Lector EPUB/PDF** con biblioteca personal, progreso de lectura, notas, subrayados y marcadores.
- **Vibe Engine**: análisis del mood del libro con IA → recomienda 4 películas + 4 playlists afines (datos reales de TMDB y Spotify).
- **Companions**: chat con los personajes principales del libro, extraídos por IA y cacheados por libro.
- **Discover**: catálogo de libros (Google Books, Open Library), bestsellers (NYT) y obras de dominio público (Project Gutenberg).
- **Multi-idioma** (i18n propio) y diseño glassmorphism con 10 paletas según el mood.
- **Auth** por email/contraseña (bcrypt) y, opcionalmente, Google OAuth.
- **Planes**: tier `starter` (hasta 5 libros) con paywall hacia `pro`/`premium`.

---

## 🛠️ Stack

| Capa        | Tecnología                                                              |
|-------------|-------------------------------------------------------------------------|
| Framework   | **Next.js 14** (App Router) + **React 18** + **TypeScript**             |
| Estilos     | **Tailwind CSS** (glassmorphism, 10 mood palettes) + **Framer Motion**  |
| Estado      | **Zustand**                                                             |
| Auth        | **NextAuth v5** (Credentials + Google) + `@auth/prisma-adapter`         |
| Base de datos | **SQLite** vía **Prisma** (archivo local `prisma/dev.db`)             |
| IA          | **Google Gemini** (free tier) — chat de personajes y análisis de vibe   |
| APIs        | Google Books · Open Library · Project Gutenberg · NYT · TMDB · Spotify  |

> **Nota:** el proyecto corre **sin Docker ni Postgres**. Usa SQLite local, ideal para desarrollo. Para producción multi-usuario conviene migrar a Postgres (ver más abajo).

---

## 🚀 Puesta en marcha

Requisitos: **Node ≥ 18.17** y **npm ≥ 9.6**.

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
#    Editá .env y completá al menos: AUTH_SECRET y GEMINI_API_KEY

# 3. Crear la base de datos SQLite y el cliente Prisma
npm run db:push
npm run db:generate

# (opcional) cargar datos de ejemplo
npm run db:seed

# 4. Arrancar en desarrollo
npm run dev
```

La app queda en **http://localhost:3000**.

---

## 🔑 Variables de entorno

El detalle está en [`.env.example`](.env.example). Las imprescindibles para arrancar:

| Variable           | Obligatoria | Para qué                                              |
|--------------------|:-----------:|-------------------------------------------------------|
| `DATABASE_URL`     | ✅          | Conexión SQLite (por defecto `file:./dev.db`)         |
| `AUTH_SECRET`      | ✅          | Firma de sesiones NextAuth (mín. 32 chars)            |
| `GEMINI_API_KEY`   | ✅          | IA de companions y vibe (Google AI Studio, free tier) |
| `TMDB_API_KEY`     | ➖          | Carátulas y datos reales de películas                 |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | ➖ | Playlists reales de Spotify              |
| `GOOGLE_BOOKS_API_KEY` / `NYT_API_KEY` | ➖ | Búsqueda y bestsellers en Discover         |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ➖ | Login con Google (si faltan, se usa solo email) |

Sin las claves opcionales la app funciona igual: la IA cae a sus *fallbacks* y los servicios externos simplemente no aparecen.

---

## 📜 Scripts

| Script             | Acción                                          |
|--------------------|-------------------------------------------------|
| `npm run dev`      | Servidor de desarrollo                          |
| `npm run build`    | Build de producción                             |
| `npm run start`    | Servir el build                                 |
| `npm run lint`     | ESLint                                          |
| `npm run type-check` | Chequeo de tipos (`tsc --noEmit`)             |
| `npm run db:push`  | Aplica el schema a SQLite                       |
| `npm run db:studio`| Prisma Studio (explorador visual de la DB)      |
| `npm run db:seed`  | Carga datos de ejemplo                          |

---

## 🗂️ Estructura

```
src/
├── app/                # App Router: páginas y rutas /api
│   ├── api/            # chat · search · vibe · auth · health
│   ├── library/ reader/ discover/ analytics/ ...
├── components/         # UI (glass), reader, library, companions, vibe, layout
├── lib/
│   ├── actions/        # Server Actions (libros, auth, upload, discover)
│   ├── ai/             # cliente Gemini
│   ├── services/       # TMDB, Spotify, Google Books, NYT, Gutenberg
│   ├── security/       # rate limiting, emails desechables
│   └── i18n/           # diccionarios y traducción server-side
└── types/              # tipos del dominio
prisma/
└── schema.prisma       # 11 modelos (User, Book, UserBook, Note, ...)
```

---

## 🧭 De cara a producción

- **Base de datos:** migrar de SQLite a **PostgreSQL** (cambiar `provider` en `prisma/schema.prisma` y `DATABASE_URL`).
- **Rate limiting:** el limitador actual es en memoria (un proceso). Para escalar horizontalmente, moverlo a **Redis**.
- **Archivos subidos:** hoy el texto se guarda en la DB; para producción conviene un object storage (S3/R2) para los archivos originales.
- **Secretos:** nunca commitear `.env`. Rotar cualquier clave que haya estado en texto plano.
