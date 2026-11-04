import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SeedBook = [title: string, author: string, isbn: string, description: string, year: number];

type SeedGenre = {
  name: string;
  description: string;
  books: SeedBook[];
};

const catalog: SeedGenre[] = [
  {
    name: 'Fiction',
    description: 'Literary and contemporary fiction.',
    books: [
      ['The Left Hand of Darkness', 'Ursula K. Le Guin', '9780441478125', 'A journey across a world shaped by shifting identity.', 1969],
      ['Things Fall Apart', 'Chinua Achebe', '9780385474542', 'A classic novel of community and change in Nigeria.', 1958],
      ['The Remains of the Day', 'Kazuo Ishiguro', '9780679731726', 'An English butler reflects on duty and regret.', 1989],
      ['Beloved', 'Toni Morrison', '9781400033416', 'A haunting exploration of memory and freedom.', 1987],
    ],
  },
  {
    name: 'Science Fiction',
    description: 'Speculative stories about science, technology, and the future.',
    books: [
      ['Dune', 'Frank Herbert', '9780441172719', 'Political intrigue and ecology on the desert planet Arrakis.', 1965],
      ['Kindred', 'Octavia E. Butler', '9780807083697', 'A woman is repeatedly pulled into the past.', 1979],
      ['The Dispossessed', 'Ursula K. Le Guin', '9780061054884', 'A physicist travels between contrasting societies.', 1974],
      ['Parable of the Sower', 'Octavia E. Butler', '9781538732182', 'A young woman builds a new belief system amid collapse.', 1993],
    ],
  },
  {
    name: 'Mystery',
    description: 'Stories built around investigations and puzzles.',
    books: [
      ['The Big Sleep', 'Raymond Chandler', '9780394758282', 'Private detective Philip Marlowe takes a difficult case.', 1939],
      ['And Then There Were None', 'Agatha Christie', '9780062073488', 'Ten strangers are trapped on an isolated island.', 1939],
      ['The No. 1 Ladies’ Detective Agency', 'Alexander McCall Smith', '9781400034772', 'Precious Ramotswe opens a detective agency in Botswana.', 1998],
      ['The Hound of the Baskervilles', 'Arthur Conan Doyle', '9780451528018', 'Holmes investigates a legend on the moors.', 1902],
    ],
  },
  {
    name: 'History',
    description: 'Narrative and analytical works about the past.',
    books: [
      ['The Silk Roads', 'Peter Frankopan', '9781101912379', 'A history of the world centered on the crossroads of Asia.', 2015],
      ['A Distant Mirror', 'Barbara W. Tuchman', '9780345349576', 'Fourteenth-century Europe in an age of upheaval.', 1978],
      ['The Wretched of the Earth', 'Frantz Fanon', '9780802141323', 'A landmark analysis of colonialism and liberation.', 1961],
      ['King Leopold’s Ghost', 'Adam Hochschild', '9780618001903', 'The history of colonial rule in the Congo.', 1998],
    ],
  },
];

async function main() {
  for (const genreData of catalog) {
    const { books, ...genreDetails } = genreData;
    const genre = await prisma.genre.upsert({
      where: { name: genreDetails.name },
      update: { description: genreDetails.description },
      create: genreDetails,
    });

    for (const [title, author, isbn, description, year] of books) {
      await prisma.book.upsert({
        where: { isbn },
        update: { title, author, description, genreId: genre.id, publishedAt: new Date(`${year}-01-01T00:00:00.000Z`) },
        create: {
          title,
          author,
          isbn,
          description,
          genreId: genre.id,
          publishedAt: new Date(`${year}-01-01T00:00:00.000Z`),
        },
      });
    }
  }

  console.log(`Seeded ${catalog.length} genres and ${catalog.reduce((total, genre) => total + genre.books.length, 0)} books.`);
}

main()
  .catch((error: unknown) => {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
