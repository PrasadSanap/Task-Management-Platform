# Deployment checklist

- [ ] Create Atlas database and copy connection string into Render `MONGODB_URI`.
- [ ] Set a unique long `JWT_SECRET` in Render.
- [ ] Deploy `server` on Render; verify `/api/health`.
- [ ] Deploy `client` on Vercel with root directory `client`.
- [ ] Set Vercel `VITE_API_URL` to the Render URL ending in `/api`.
- [ ] Set Render `CLIENT_URL` to the exact Vercel URL and redeploy.
- [ ] Register and test an account on the deployed website.
- [ ] Test register, login, logout, task CRUD, search, filters, sorting, and unauthorized access.
- [ ] Add actual live URLs, screenshots, and verified test credentials to README before submission.
- [ ] Never commit secrets or claim deployment/tests passed before verifying them.
