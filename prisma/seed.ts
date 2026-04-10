import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const admin = await prisma.user.create({
    data: {
      login: 'admin',
      password: 'admin123',
      role: 'admin',
    },
  });

  const editor1 = await prisma.user.create({
    data: {
      login: 'editor',
      password: 'editor123',
      role: 'editor',
    },
  });

  const editor2 = await prisma.user.create({
    data: {
      login: 'super-editor',
      password: 'editor123-super',
      role: 'editor',
    },
  });

  const category = await prisma.category.create({
    data: {
      name: 'Programming',
      description: 'All about programming',
    },
  });

  const tagJS = await prisma.tag.create({
    data: { name: 'JavaScript' },
  });

  const tagBackend = await prisma.tag.create({
    data: { name: 'Backend' },
  });

  const tagDB = await prisma.tag.create({
    data: { name: 'Database' },
  });

  const article1 = await prisma.article.create({
    data: {
      title: 'Intro to JavaScript',
      content: 'JavaScript basics...',
      status: 'published',
      authorId: admin.id,
      categoryId: category.id,
      tags: {
        connect: [{ id: tagJS.id }],
      },
    },
  });

  const article2 = await prisma.article.create({
    data: {
      title: 'Backend Development',
      content: 'Node.js APIs...',
      status: 'draft',
      authorId: editor1.id,
      categoryId: category.id,
      tags: {
        connect: [{ id: tagBackend.id }, { id: tagJS.id }],
      },
    },
  });

  const article3 = await prisma.article.create({
    data: {
      title: 'Working with Databases',
      content: 'Postgres, Prisma...',
      status: 'archived',
      authorId: editor2.id,
      categoryId: category.id,
      tags: {
        connect: [{ id: tagDB.id }],
      },
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Greate article!',
      articleId: article1.id,
      authorId: editor1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Very useful',
      articleId: article2.id,
      authorId: admin.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'What an article!',
      articleId: article3.id,
      authorId: editor2.id,
    },
  });
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
