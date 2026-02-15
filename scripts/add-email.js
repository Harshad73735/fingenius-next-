const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

(async () => {
  try {
    // Find user by primary email
    const user = await db.user.findUnique({
      where: { email: 'harshadhadule5@gmail.com' }
    });

    if (!user) {
      console.log('User not found');
      process.exit(1);
    }

    // Add secondary email
    const result = await db.userEmail.create({
      data: {
        email: 'harshalgawaliera@gmail.com',
        userId: user.id
      }
    });

    console.log('✅ Secondary email added:', result.email);
    console.log('User will now receive budget alerts on both emails');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await db.$disconnect();
  }
})();
