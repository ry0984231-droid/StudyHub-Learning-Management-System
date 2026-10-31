# StudyHub backend

The backend is an Express API. It handles login, courses, lessons, enrollments,
quizzes, payments, certificates, and the other data used by the frontend.

## Start it

Run commands from the project root:

```bash
npm install
npm run dev
```

The API listens on `http://localhost:5000` by default. The frontend's Vite
server forwards `/api` requests to this address. Set `PORT` to use a different
port.

Before starting the server, set these values in the root `.env` file:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/studyhub
MONGODB_DB_NAME=studyhub
JWT_SECRET=use_a_random_secret_at_least_32_characters_long
```

Check that the server is running at `http://localhost:5000/api/health`.

## Where things live

- `server.js` starts Express and connects to MongoDB.
- `server/routes/api.js` maps API URLs to middleware and controller functions.
- `server/controllers/` contains the work for each feature, such as courses
  and enrollments.
- `server/middleware/` contains shared request checks, including login,
  permissions, input validation, uploads, and error responses.
- `server/config/config.js` reads environment settings.
- `server/db/store.js` reads and writes the app's MongoDB collections.
- `server/services/` contains integrations such as email delivery.

## How a request works

1. A route in `server/routes/api.js` receives the request.
2. Middleware checks the request, for example by validating its input or
   confirming the user's role.
3. The controller performs the feature's work and uses `db` for stored data.
4. The controller sends a JSON response. Unexpected errors go to the shared
   error handler.

When adding an API feature, put its main logic in a controller and register its
URL in `server/routes/api.js`. Keep authentication and role checks on the
route, beside the handler they protect.
