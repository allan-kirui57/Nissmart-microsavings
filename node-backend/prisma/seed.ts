import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create first user
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      id: 'user-001',
      email: 'alice@example.com',
      name: 'Alice Johnson',
      userType: 'user',
      wallets: {
        create: [
          {
            currency: 'USD',
            balance: 5000.00,
          },
          {
            currency: 'EUR',
            balance: 3500.50,
          },
        ],
      },
    },
    include: {
      wallets: true,
    },
  });

  console.log('User 1 created:', user1);

  // Create second user
  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      id: 'user-002',
      email: 'bob@example.com',
      name: 'Bob Smith',
      userType: 'user',
      wallets: {
        create: [
          {
            currency: 'USD',
            balance: 2500.75,
          },
          {
            currency: 'GBP',
            balance: 1800.00,
          },
        ],
      },
    },
    include: {
      wallets: true,
    },
  });

  console.log('User 2 created:', user2);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      id: 'user-admin',
      email: 'admin@example.com',
      name: 'Admin User',
      userType: 'admin',
      wallets: {
        create: [
          {
            currency: 'USD',
            balance: 100000.00,
          },
        ],
      },
    },
    include: {
      wallets: true,
    },
  });

  console.log('Admin user created:', adminUser);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
