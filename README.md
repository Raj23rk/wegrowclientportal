# WeGrow Client Portal Backend

Built with NestJS, MongoDB (Mongoose), and Supabase.

## Environment Variables
Configured in `.env`:
- `PORT=3000`
- `MONGODB_URI=mongodb://127.0.0.1:27017/wegrow_portal`
- `JWT_SECRET=wegrow_transformation_portal_super_secret_jwt_key_2026`
- `SUPABASE_URL=https://your-project.supabase.co`
- `SUPABASE_KEY=your-supabase-key`

## Setup & Running
```bash
npm install
npm run start:dev
```

## Seeding Database
```bash
npm run seed
```
Populates clients C001 (Meridian Foods), C002 (Kaveri Textiles), and consultant Dr. Thavabalan.
