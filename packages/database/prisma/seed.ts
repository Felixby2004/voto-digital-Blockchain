import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = (pwd: string) => bcrypt.hash(pwd, 10);

  // ─────────────────────────────────────────
  // 1. USUARIOS (nombres reales, correos @unitru.edu.pe)
  // ─────────────────────────────────────────

  // Super Admin
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'cmendoza@unitru.edu.pe' },
    update: {},
    create: {
      nombre: 'Carlos Alberto Mendoza Ruiz',
      email: 'cmendoza@unitru.edu.pe',
      passwordHash: await hash('Admin123456'),
      rol: 'SUPER_ADMINISTRADOR',
      estado: 'ACTIVO',
      administrador: { create: { rol: 'SUPER_ADMIN' } },
    },
    include: { administrador: true },
  });

  // Admin Electoral
  await prisma.usuario.upsert({
    where: { email: 'atorres@unitru.edu.pe' },
    update: {},
    create: {
      nombre: 'Ana Lucia Torres Vega',
      email: 'atorres@unitru.edu.pe',
      passwordHash: await hash('Electoral123'),
      rol: 'ADMINISTRADOR_ELECTORAL',
      estado: 'ACTIVO',
      administrador: { create: { rol: 'ADMIN_ELECTORAL' } },
    },
  });

  // Auditor
  await prisma.usuario.upsert({
    where: { email: 'lvega@unitru.edu.pe' },
    update: {},
    create: {
      nombre: 'Luis Fernando Vega Salazar',
      email: 'lvega@unitru.edu.pe',
      passwordHash: await hash('Auditor123'),
      rol: 'AUDITOR',
      estado: 'ACTIVO',
      auditor: { create: {} },
    },
  });

  // Estudiantes habilitados para votar (nombres reales peruanos)
  const estudiantesData = [
    { nombre: 'Juan Manuel Perez Castillo', email: 'jperezc@unitru.edu.pe', dni: '12345678', codigo: '20260001', facultad: 'Facultad de Ingeniería', escuela: 'Escuela de Ingeniería de Sistemas', carrera: 'Ingeniería de Sistemas' },
    { nombre: 'Maria Fernanda Gomez Herrera', email: 'mgomezh@unitru.edu.pe', dni: '87654321', codigo: '20260002', facultad: 'Facultad de Ingeniería', escuela: 'Escuela de Ingeniería de Sistemas', carrera: 'Ingeniería de Software' },
    { nombre: 'Pedro Alejandro Castillo Rojas', email: 'pcastillor@unitru.edu.pe', dni: '11111111', codigo: '20260003', facultad: 'Facultad de Ingeniería', escuela: 'Escuela de Ingeniería Civil', carrera: 'Ingeniería Civil' },
  ];

  const estudiantes: any[] = [];
  for (const e of estudiantesData) {
    const user = await prisma.usuario.upsert({
      where: { email: e.email },
      update: {},
      create: {
        nombre: e.nombre,
        email: e.email,
        dni: e.dni,
        passwordHash: await hash('Student123456'),
        rol: 'ESTUDIANTE',
        estado: 'ACTIVO',
        estudiante: {
          create: {
            dni: e.dni,
            codigoUniversitario: e.codigo,
            facultad: e.facultad,
            escuela: e.escuela,
            carrera: e.carrera,
          },
        },
      },
      include: { estudiante: true },
    });
    estudiantes.push(user);
  }

  console.log(`✅ ${estudiantes.length} estudiantes creados`);

  // ─────────────────────────────────────────
  // 2. ELECCION ACTIVA (única)
  // ─────────────────────────────────────────
  const eleccionId = 'eleccion-ingenieria-2026';

  const eleccion = await prisma.eleccion.upsert({
    where: { id: eleccionId },
    update: {},
    create: {
      id: eleccionId,
      nombre: 'Elecciones Centro Federado de Ingeniería 2026',
      descripcion: 'Elección del nuevo Centro Federado de Ingeniería para el periodo 2026-2027.',
      estado: 'ACTIVA',
      fechaInicio: new Date('2026-06-29T08:00:00.000Z'),
      fechaFin: new Date('2026-07-01T20:00:00.000Z'),
      facultadesIds: [],
      escuelasIds: [],
      carrerasIds: [],
    },
  });

  console.log('✅ Elección activa creada:', eleccion.nombre);

  // ─────────────────────────────────────────
  // 3. CANDIDATOS (3 nombres reales + partido)
  // ─────────────────────────────────────────
  const candidatosData = [
    {
      id: `candidato-${eleccionId}-1`,
      nombre: 'Alejandro', apellido: 'Vargas López', foto: 'https://ui-avatars.com/api/?name=Alejandro+Vargas&background=0D47A1&color=fff',
      descripcion: 'Estudiante de 8vo ciclo de Ingeniería de Sistemas. Propone mejorar los laboratorios de computación.',
      cargo: 'Presidente del Centro Federado',
      partido: 'Frente Estudiantil Progresista',
      facultad: 'Facultad de Ingeniería',
      escuela: 'Escuela de Ingeniería de Sistemas',
    },
    {
      id: `candidato-${eleccionId}-2`,
      nombre: 'Daniela', apellido: 'Quispe Ramos', foto: 'https://ui-avatars.com/api/?name=Daniela+Quispe&background=C62828&color=fff',
      descripcion: 'Estudiante de 6to ciclo de Ingeniería Civil. Plan de área de esparcimiento y espacios de estudio.',
      cargo: 'Presidente del Centro Federado',
      partido: 'Movimiento Universitario Renovador',
      facultad: 'Facultad de Ingeniería',
      escuela: 'Escuela de Ingeniería Civil',
    },
    {
      id: `candidato-${eleccionId}-3`,
      nombre: 'Marco Antonio', apellido: 'Luna Torres', foto: 'https://ui-avatars.com/api/?name=Marco+Luna&background=2E7D32&color=fff',
      descripcion: 'Estudiante de 9no ciclo de Ingeniería de Software. Digitalización de trámites estudiantiles.',
      cargo: 'Presidente del Centro Federado',
      partido: 'Alianza Estudiantil de Cambio',
      facultad: 'Facultad de Ingeniería',
      escuela: 'Escuela de Ingeniería de Sistemas',
    },
  ];

  for (const c of candidatosData) {
    await prisma.candidato.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        nombre: c.nombre,
        apellido: c.apellido,
        foto: c.foto,
        descripcion: c.descripcion,
        cargo: c.cargo,
        partido: c.partido,
        facultad: c.facultad,
        escuela: c.escuela,
        eleccionId,
      },
    });
  }

  console.log(`✅ ${candidatosData.length} candidatos creados`);

  // ─────────────────────────────────────────
  // 4. PADRÓN ELECTORAL (habilitar estudiantes)
  // ─────────────────────────────────────────
  for (const e of estudiantes) {
    if (e.estudiante) {
      try {
        await prisma.padronElectoral.create({
          data: {
            estudianteId: e.estudiante.id,
            eleccionId,
            estadoHabilitado: true,
            haVotado: false,
          },
        });
      } catch {
        // skip duplicates
      }
    }
  }

  console.log('✅ Padrón electoral creado');

  // ─────────────────────────────────────────
  // 5. RESUMEN
  // ─────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════');
  console.log('  SEED COMPLETADO — SOLO 1 ELECCION ACTIVA');
  console.log('══════════════════════════════════════════════════\n');

  console.log('--- USUARIOS DE PRUEBA ---');
  console.log('Super Admin     : cmendoza@unitru.edu.pe     / Admin123456');
  console.log('Admin Electoral : atorres@unitru.edu.pe       / Electoral123');
  console.log('Auditor         : lvega@unitru.edu.pe         / Auditor123');
  console.log('Estudiante 1    : jperezc@unitru.edu.pe        / Student123456');
  console.log('Estudiante 2    : mgomezh@unitru.edu.pe        / Student123456');
  console.log('Estudiante 3    : pcastillor@unitru.edu.pe     / Student123456\n');

  console.log('--- ELECCION ---');
  const candidatosCount = await prisma.candidato.count({ where: { eleccionId } });
  const padronCount = await prisma.padronElectoral.count({ where: { eleccionId } });
  console.log(`[${eleccion.estado}] ${eleccion.nombre}`);
  console.log(`   Candidatos: ${candidatosCount} | Padrón: ${padronCount}`);
  console.log(`   Inicio: ${eleccion.fechaInicio?.toISOString()}`);
  console.log(`   Fin: ${eleccion.fechaFin?.toISOString()}`);
  console.log(`   electionId: ${eleccionId}`);
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
