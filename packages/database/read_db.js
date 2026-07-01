const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:12345@localhost:5432/universidad_voto?schema=public'
    }
  }
});

async function main() {
  const users = await prisma.usuario.findMany({
    include: {
      estudiante: true,
      administrador: true
    }
  });
  console.log('--- USERS IN DATABASE ---');
  for (const user of users) {
    console.log(`ID: ${user.id}`);
    console.log(`Nombre: ${user.nombre}`);
    console.log(`Email: ${user.email}`);
    console.log(`Rol: ${user.rol}`);
    console.log(`Estado: ${user.estado}`);
    console.log(`Password Hash: ${user.passwordHash}`);
    const bcrypt = require('bcrypt');
    if (user.rol === 'SUPER_ADMINISTRADOR') {
      const match = await bcrypt.compare('Admin123456', user.passwordHash);
      console.log(`Bcrypt check 'Admin123456': ${match}`);
    } else {
      const match = await bcrypt.compare('Student123456', user.passwordHash);
      console.log(`Bcrypt check 'Student123456': ${match}`);
    }
    console.log('-------------------------');
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
