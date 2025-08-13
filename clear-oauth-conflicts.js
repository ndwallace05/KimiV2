require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
      }
    }
  });
  
  try {
    console.log('🔒 Ensuring database is unlocked...');
    try {
      // Remove SQLite journal/wal files to unlock if previous process crashed
      execSync('rm -f ./prisma/dev.db-journal || true');
      execSync('rm -f ./prisma/dev.db-wal || true');
      execSync('rm -f ./prisma/dev.db-shm || true');
    } catch (e) {
      // Ignore if files do not exist or on Windows; Prisma will still proceed
    }

    console.log('🧹 Starting database cleanup...');

    // Disable foreign key checks to avoid cascading issues during cleanup
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;

    await prisma.integrationToken.deleteMany({});
    console.log('✅ Cleared integration tokens');

    await prisma.userProfile.deleteMany({});
    console.log('✅ Cleared user profiles');

    await prisma.session.deleteMany({});
    console.log('✅ Cleared sessions');

    await prisma.account.deleteMany({});
    console.log('✅ Cleared accounts');

    await prisma.verificationToken.deleteMany({});
    console.log('✅ Cleared verification tokens');

    await prisma.user.deleteMany({});
    console.log('✅ Cleared users');

    console.log('\n🎉 Database fully cleaned! OAuth conflicts resolved.');
  } catch (error) {
    console.error('💥 Database error:', error.message);
    console.error('💡 Try: 1. Stop all dev servers 2. Close any SQLite clients 3. Run again');
  } finally {
    await prisma.$disconnect();
  }
}

main();