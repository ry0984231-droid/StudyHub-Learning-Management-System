# StudyHub — Full MERN Learning Management System

StudyHub is a full-stack MERN-style Learning Management System with a React/Vite frontend and Node.js/Express backend backed by MongoDB.

## Included Features

### Student
- Register / Login / Logout
- JWT authentication
- Profile update and password change
- Forgot password + OTP flow
- Browse and search courses
- Category filtering
- Course details
- Course enrollment
- Lesson/video learning
- Lesson completion and progress tracking
- Quizzes and quiz submission/results
- Course reviews and ratings
- Wishlist
- Payment history
- Razorpay checkout integration
- Course certificates
- Public certificate verification
- Notifications
- Study activity

### Instructor
- Instructor dashboard
- Course creation/update/delete
- Course management
- Lesson creation/update/delete/reordering
- Quiz management
- Student analytics
- Instructor student list

### Admin
- Admin dashboard and metrics
- User management
- Role management
- User deletion
- Course/payment metrics
- Payment history

### Platform
- Responsive React UI
- Dark mode
- Protected role-based API routes
- MongoDB persistence
- Helmet security headers
- CORS
- API rate limiting
- Central error handling
- Email/SMTP integration hook
- Razorpay integration hook

Public registration creates student accounts only. An administrator can promote trusted accounts to instructor through user management.

## Project Structure

```text
StudyHub-fixed/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── App.js
│   ├── main.js
│   └── index.css
├── server/
│   ├── config/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   └── services/
├── server.js
├── vite.config.js
├── package.json
└── .env.example
```

## Requirements

- Node.js 18+
- MongoDB local or MongoDB Atlas
- npm

Optional integrations:
- Razorpay account for real payments
- SMTP account for email delivery

## Installation

```bash
npm install
```

Create `.env` from `.env.example`:

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Set at minimum:

```env
APP_URL=http://localhost:5000
CLIENT_URL=http://localhost:5000
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/studyhub
MONGODB_DB_NAME=studyhub

JWT_SECRET=replace_this_with_a_long_random_secret_at_least_32_characters
```

## Run

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The Express server hosts the Vite development middleware, while all REST APIs are under:

```text
http://localhost:3000/api
```

Health check:

```text
http://localhost:3000/api/health
```

## Production Build

```bash
npm run build
npm start
```

## Important

Real Razorpay and SMTP functionality requires their respective credentials in `.env`. Google sign-in and AI chat have been removed from the application.

## Docker deployment

1. Copy `.env.example` to `.env` and set a unique `JWT_SECRET` of at least 32 characters. Add Razorpay and SMTP values only if those integrations are enabled.
2. Start the app and MongoDB with `docker compose up --build -d`.
3. Check `http://localhost:3000/api/health` and open `http://localhost:3000`.
4. View service logs with `docker compose logs -f app` and stop the stack with `docker compose down`.

The Compose app service connects to its private MongoDB service and stores uploaded videos in a persistent volume. For a public production deployment, terminate TLS at a reverse proxy/load balancer and set `APP_URL` and `CLIENT_URL` to the public HTTPS origin.

Never commit `.env` or production secrets to GitHub.


## Frontend file extensions
React source files use `.jsx`; backend and API utility files remain `.js`.
