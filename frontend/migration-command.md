# Prisma Migration Command

Run the following command in your terminal from the project root (`verso` directory) once your PostgreSQL database (via Supabase or local container) is running and your `DATABASE_URL` environment variable is set:

```bash
npx prisma migrate dev --name init
```

This will create a new migration, apply it to the database, and generate the Prisma Client.
