const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { PrismaClient } = require('../src/generated/prisma');

module.exports = async function () {
  const prisma = new PrismaClient();
  try {
    await prisma.user.deleteMany({
      where: { login: 'TEST_LOGIN' },
    });
  } finally {
    await prisma.$disconnect();
  }
};
