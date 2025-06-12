/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

// initialize Prisma Client
const prisma = new PrismaClient();

// Import users from JSON file
const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'seed', 'user.json'), 'utf8'),
);

async function main() {
  await seedAdmin();
  await seedUsers();
  console.log('Seeding completed successfully');
}

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL!;
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 12);
  const adminUsername = process.env.ADMIN_USERNAME!;
  if (!adminEmail || !adminPassword || !adminUsername) {
    throw new Error(
      'ADMIN_EMAIL, ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be set',
    );
  }
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      username: adminUsername,
      email: adminEmail,
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`Admin user created: ${adminUser.createdAt.toISOString()}`);
}

async function seedUsers() {
  await prisma.user.createMany({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    data: users.map((user) => ({
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
    })),
    skipDuplicates: true,
  });
  console.log(`Seeded ${users.length} users`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
