# Library Management System

The API data layer uses Prisma with PostgreSQL to manage a library catalog. The schema models users with `PATRON` or `LIBRARIAN` roles, genres, books, reading lists, borrow requests, space bookings, and optional book reviews.

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
npm run build
```

`migrate deploy` applies the checked-in PostgreSQL migrations, making it suitable for the hosted database. The seed is safe to rerun: it upserts genres by name and books by ISBN. It creates four genres and sixteen books.

Set `JWT_SECRET` in `.env` before starting the API. Run `npm start` after building, or use `npm run start:dev` while developing. The Postman collection in `docs/postman_collection.json` includes the authentication, genre, and book endpoints.

## Set up the client

The React/Vite catalog runs separately from the API:

```powershell
cd client
npm install
npm run dev
```

The checked-in `client/.env` points `VITE_API_URL` at `http://localhost:3000`, the API's default local address. Change it when the API runs elsewhere. The authenticated API supports patron borrow requests (`POST /borrow-requests`, `GET /borrow-requests`) for books in the patron's reading list. Librarians can review all requests at `GET /borrow-requests/admin`, approve or reject pending requests, and record returns; approval checks available copies and returns calculate overdue fines at 10 currency units per late day. Librarian-only book and genre management is protected by JWT role guards. Space bookings are stored by `POST /bookings`; overlapping bookings for the same space and date are rejected, including concurrent submissions.

The client includes catalog search and genre filtering, a reading list synced to the signed-in user's account, account registration and login, and a protected space-booking form. Guest reading-list entries are merged into the account on login or registration. The authenticated `GET /reading-list` and `PUT /reading-list` endpoints fetch and replace a user's list across devices.

## Schema Decisions

`Book` references `Genre` through the required `genreId` foreign key instead of embedding a genre name or object in each book. A genre is shared catalog data: storing it once avoids inconsistent spellings and duplicated descriptions, and lets the database enforce that every book points to a real genre. The one-to-many relation also makes it straightforward to list books by genre and update genre details consistently.

`User.role` is a Prisma enum, so only the supported roles can be stored. `ReadingListEntry` stores each user's saved books with a composite `(userId, bookId)` primary key, preventing duplicates and cascading when a user or book is deleted. `BorrowRequest` tracks request status, due and return dates, and the assessed fine. `Review` is included as a stretch relation: each review belongs to one book and one user, ratings are integers, and the `(bookId, userId)` unique constraint limits a user to one review per book.

One difference from a document database is that Prisma makes relationships explicit through foreign keys and relation fields. In a document database, it would be more natural to embed genre details in a book document; here, normalization and referential integrity are modeled directly in the schema.
