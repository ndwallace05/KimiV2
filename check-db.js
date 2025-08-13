require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./prisma/dev.db'
      }
    }
  });
  
  try {
    console.log('=== CLEARING OAUTH CONFLICTS ===');
    
    // Delete all existing users and accounts to start fresh
    await prisma.account.deleteMany({});
    console.log('✅ Deleted all accounts');
    
    await prisma.session.deleteMany({});
    console.log('✅ Deleted all sessions');
    
    await prisma.verificationToken.deleteMany({});
    console.log('✅ Deleted all verification tokens');
    
    await prisma.integrationToken.deleteMany({});
    console.log('✅ Deleted all integration tokens');
    
    await prisma.userProfile.deleteMany({});
    console.log('✅ Deleted all user profiles');
    
    await prisma.user.deleteMany({});
    console.log('✅ Deleted all users');
    
    console.log('\n🎉 Database cleaned! OAuth should work now.');
    
  } catch (error) {
    console.error('Database error:', error.message);
    console.log('\n⚠️  If database is locked, stop all dev servers and try again.');
  } finally {
    await prisma.$disconnect();
  }
}

main();