const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@attappadionline.com';
  const plainPassword = 'password123';
  
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`User ${email} already exists.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Super Admin',
      role: 'admin',
    },
  });

  console.log(`Created admin user! Email: ${user.email} | Password: ${plainPassword}`);
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
