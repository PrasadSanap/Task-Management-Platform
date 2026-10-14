# Task & Team Management Platform

A full-stack task manager built for the Full Stack Intern technical assessment.

## Stack
- Frontend: React, Vite, React Router, Axios, Redux Toolkit, Tailwind CSS
- Backend: Node.js, Express, Mongoose
- Database: MongoDB Atlas
- Security: bcrypt password hashing, JWT authentication, ownership checks
- Included extras: dark mode, toast notifications, paginated task list, backend unit tests

## Requirements
Node.js 20+ and a MongoDB Atlas connection string.

## 1. Configure the backend
```powershell
cd server
Copy-Item .env.example .env
```
Edit `server/.env` and set `MONGODB_URI` and a long random `JWT_SECRET`.

```powershell
npm install
npm run dev
```
Backend runs at `http://localhost:5000`; health check: `http://localhost:5000/api/health`.

## 2. Configure the frontend
Open another terminal:
```powershell
cd client
Copy-Item .env.example .env
npm install
npm run dev
```
Frontend runs at the URL printed by Vite, usually `http://localhost:5173`.

## API
All task routes require `Authorization: Bearer <token>`.
- `POST /api/auth/register` — `{ "name": "Example User", "email": "user@example.com", "password": "Test@1234" }`
- `POST /api/auth/login` — `{ "email": "user@example.com", "password": "Test@1234" }`
- `GET /api/auth/me`
- `GET /api/tasks` (supports `search`, `status`, `priority`, `sort`, `page`, `limit` query parameters)
- `GET /api/tasks/:id`
- `POST /api/tasks` — title, description, priority, dueDate, status, assignedUser
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

Task records are scoped to the logged-in user. The `assignedUser` field references a User document. Validation errors return 400, missing resources 404, and missing/invalid JWTs 401.

## Tests
```powershell
cd server
npm test
```

## Deployment
1. Create a MongoDB Atlas cluster and add the Render outbound access policy / network access settings required by your account.
2. Deploy `server` as a Node web service on Render. Build command `npm install`, start command `npm start`. Add `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (your deployed Vercel URL), and `NODE_ENV=production` environment variables.
3. Deploy `client` on Vercel with root directory `client` and build command `npm run build`. Add `VITE_API_URL` pointing to the deployed backend URL plus `/api` (example format: `https://your-service.onrender.com/api`).
4. Update `CLIENT_URL` on Render to the actual Vercel domain and redeploy.
5. Register test users on the live site and put the real test credentials and live URLs in this README before submitting. Do not submit the example credentials unless you have created and verified those accounts.

## Security notes
Never commit `.env` files. The app hashes passwords, uses JWTs, validates IDs and input, and prevents users from modifying/deleting another user's tasks. Remember Me keeps the token in local storage; without it, the token is stored for the current browser tab session.
