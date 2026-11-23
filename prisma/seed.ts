
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { phone: '+221770000000' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'Deukway',
      phone: '+221770000000',
      email: 'admin@deukway.sn',
      password: await bcrypt.hash('MotDePasseFort123', 10),
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
}
main().finally(() => prisma.$disconnect());