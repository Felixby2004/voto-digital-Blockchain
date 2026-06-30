import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123456', 10);

  const user = await prisma.usuario.upsert({
    where: { email: 'admin@universidad.edu' },
    update: { passwordHash },
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

  // Seed default students
  const studentPasswordHash = await bcrypt.hash('Student123456', 10);

  const student1 = await prisma.usuario.upsert({
    where: { email: 'estudiante1@universidad.edu' },
    update: { passwordHash: studentPasswordHash },
    create: {
      nombre: 'Juan Perez',
      email: 'estudiante1@universidad.edu',
      dni: '12345678',
      passwordHash: studentPasswordHash,
      rol: 'ESTUDIANTE',
      estado: 'ACTIVO',
      estudiante: {
        create: {
          dni: '12345678',
          codigoUniversitario: '20260001',
          facultad: 'INGENIERIA',
          escuela: 'INGENIERIA DE SISTEMAS',
          carrera: 'INGENIERIA DE SISTEMAS',
        },
      },
    },
    include: { estudiante: true },
  });

  console.log('✅ Estudiante 1 creado:');
  console.log('   email: estudiante1@universidad.edu');
  console.log('   password: Student123456');
  console.log('   codigo: 20260001');

  const student2 = await prisma.usuario.upsert({
    where: { email: 'estudiante2@universidad.edu' },
    update: { passwordHash: studentPasswordHash },
    create: {
      nombre: 'Maria Gomez',
      email: 'estudiante2@universidad.edu',
      dni: '87654321',
      passwordHash: studentPasswordHash,
      rol: 'ESTUDIANTE',
      estado: 'ACTIVO',
      estudiante: {
        create: {
          dni: '87654321',
          codigoUniversitario: '20260002',
          facultad: 'CIENCIAS',
          escuela: 'INFORMATICA',
          carrera: 'INFORMATICA',
        },
      },
    },
    include: { estudiante: true },
  });

  console.log('✅ Estudiante 2 creado:');
  console.log('   email: estudiante2@universidad.edu');
  console.log('   password: Student123456');
  console.log('   codigo: 20260002');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
