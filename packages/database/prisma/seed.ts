import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123456', 10);

  const user = await prisma.usuario.upsert({
    where: { email: 'admin@universidad.edu' },
    update: {},
    create: {
      nombre: 'Super Administrador',
      email: 'admin@universidad.edu',
      passwordHash,
      rol: 'SUPER_ADMINISTRADOR',
      estado: 'ACTIVO',
      administrador: {
        create: { rol: 'SUPER_ADMIN' },
      },
    },
    include: { administrador: true },
  });

  console.log('✅ Admin inicial creado:');
  console.log('   email: admin@universidad.edu');
  console.log('   password: Admin123456');
  console.log('   rol:', user.rol);
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
