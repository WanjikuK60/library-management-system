# Library Management System

The API data layer uses Prisma with PostgreSQL to manage a library catalog. The schema models users with `PATRON` or `LIBRARIAN` roles, genres, books, and optional book reviews.

## Requirements

- Node.js 18 or newer and npm
- PostgreSQL database

## Set up the API

```powershell
cd api
Copy-Item .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL connection string.
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

`migrate deploy` applies the checked-in PostgreSQL migration, making it suitable for the hosted database. The seed is safe to rerun: it upserts genres by name and books by ISBN. It creates four genres and sixteen books.

## Schema Decisions

`Book` references `Genre` through the required `genreId` foreign key instead of embedding a genre name or object in each book. A genre is shared catalog data: storing it once avoids inconsistent spellings and duplicated descriptions, and lets the database enforce that every book points to a real genre. The one-to-many relation also makes it straightforward to list books by genre and update genre details consistently.

`User.role` is a Prisma enum, so only the supported roles can be stored. `Review` is included as a stretch relation: each review belongs to one book and one user, ratings are integers, and the `(bookId, userId)` unique constraint limits a user to one review per book.

One difference from a document database is that Prisma makes relationships explicit through foreign keys and relation fields. In a document database, it would be more natural to embed genre details in a book document; here, normalization and referential integrity are modeled directly in the schema.
