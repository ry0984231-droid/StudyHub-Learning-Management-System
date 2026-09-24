# Quick Windows Setup

1. Install Node.js 18+.
2. Install/start MongoDB or use MongoDB Atlas.
3. Open this folder in VS Code.
4. Run `npm install` from the project root.
5. Copy `.env.example` to `.env`.
6. Set `MONGODB_URI` and a JWT secret of at least 32 characters.
7. Run both servers with `npm run dev:all`.
8. Open `http://localhost:5173`. The API runs at `http://localhost:5000`.

If a port is already in use, stop the other application using port 5000 or 5173 before starting StudyHub.
