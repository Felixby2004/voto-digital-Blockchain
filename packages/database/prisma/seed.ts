import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ─────────────────────────────────────────
  // 0. UTILITIES
  // ─────────────────────────────────────────
  const hash = (pwd: string) => bcrypt.hash(pwd, 10);

  // ─────────────────────────────────────────
  // 1. FACULTADES, ESCUELAS, CARRERAS
  // ─────────────────────────────────────────
  const facultadesData = [
    { nombre: 'Facultad de Ingeniería' },
    { nombre: 'Facultad de Medicina' },
    { nombre: 'Facultad de Derecho y Ciencias Políticas' },
    { nombre: 'Facultad de Ciencias Económicas' },
  ];

  const facultades: Record<string, any> = {};
  for (const f of facultadesData) {
    const fac = await prisma.facultad.upsert({
      where: { nombre: f.nombre },
      update: {},
      create: f,
    });
    facultades[f.nombre] = fac;
  }

  const escuelasData = [
    { nombre: 'Escuela de Ingeniería de Sistemas', facultadId: facultades['Facultad de Ingeniería'].id },
    { nombre: 'Escuela de Ingeniería Civil', facultadId: facultades['Facultad de Ingeniería'].id },
    { nombre: 'Escuela de Medicina Humana', facultadId: facultades['Facultad de Medicina'].id },
    { nombre: 'Escuela de Derecho', facultadId: facultades['Facultad de Derecho y Ciencias Políticas'].id },
    { nombre: 'Escuela de Contabilidad', facultadId: facultades['Facultad de Ciencias Económicas'].id },
  ];

  const escuelas: Record<string, any> = {};
  for (const e of escuelasData) {
    const esc = await prisma.escuela.upsert({
      where: { nombre_facultadId: { nombre: e.nombre, facultadId: e.facultadId } },
      update: {},
      create: e,
    });
    escuelas[e.nombre] = esc;
  }

  const carrerasData = [
    { nombre: 'Ingeniería de Sistemas', escuelaId: escuelas['Escuela de Ingeniería de Sistemas'].id },
    { nombre: 'Ingeniería de Software', escuelaId: escuelas['Escuela de Ingeniería de Sistemas'].id },
    { nombre: 'Ingeniería Civil', escuelaId: escuelas['Escuela de Ingeniería Civil'].id },
    { nombre: 'Medicina Humana', escuelaId: escuelas['Escuela de Medicina Humana'].id },
    { nombre: 'Derecho', escuelaId: escuelas['Escuela de Derecho'].id },
    { nombre: 'Contabilidad', escuelaId: escuelas['Escuela de Contabilidad'].id },
    { nombre: 'Administración', escuelaId: escuelas['Escuela de Contabilidad'].id },
  ];

  const carreras: Record<string, any> = {};
  for (const c of carrerasData) {
    const car = await prisma.carrera.upsert({
      where: { nombre_escuelaId: { nombre: c.nombre, escuelaId: c.escuelaId } },
      update: {},
      create: c,
    });
    carreras[c.nombre] = car;
  }

  console.log('✅ Facultades, escuelas y carreras creadas');

  // ─────────────────────────────────────────
  // 2. USUARIOS (ADMINS, AUDITORES, PROFESORES, ESTUDIANTES)
  // ─────────────────────────────────────────

  // Super Admin
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@universidad.edu' },
    update: {},
    create: {
      nombre: 'Carlos Mendoza Ruiz',
      email: 'admin@universidad.edu',
      passwordHash: await hash('Admin123456'),
      rol: 'SUPER_ADMINISTRADOR',
      estado: 'ACTIVO',
      administrador: { create: { rol: 'SUPER_ADMIN' } },
    },
    include: { administrador: true },
  });

  // Admin Electoral
  const adminElectoral = await prisma.usuario.upsert({
    where: { email: 'electoral@universidad.edu' },
    update: {},
    create: {
      nombre: 'Ana Lucia Torres',
      email: 'electoral@universidad.edu',
      passwordHash: await hash('Electoral123'),
      rol: 'ADMINISTRADOR_ELECTORAL',
      estado: 'ACTIVO',
      administrador: { create: { rol: 'ADMIN_ELECTORAL' } },
    },
    include: { administrador: true },
  });

  // Auditor
  const auditorUser = await prisma.usuario.upsert({
    where: { email: 'auditor@universidad.edu' },
    update: {},
    create: {
      nombre: 'Luis Fernando Vega',
      email: 'auditor@universidad.edu',
      passwordHash: await hash('Auditor123'),
      rol: 'AUDITOR',
      estado: 'ACTIVO',
      auditor: { create: {} },
    },
    include: { auditor: true },
  });

  console.log('✅ Administradores y auditor creados');

  // Profesores
  const profesoresData = [
    {
      email: 'prof.sistemas@universidad.edu',
      nombre: 'Dr. Roberto Sanchez',
      dni: '11223344',
      codigoEmpleado: 'P2026001',
      facultad: 'Facultad de Ingeniería',
      escuela: 'Escuela de Ingeniería de Sistemas',
      departamento: 'Ciencias de la Computación',
    },
    {
      email: 'prof.derecho@universidad.edu',
      nombre: 'Dra. Carmen Salazar',
      dni: '44332211',
      codigoEmpleado: 'P2026002',
      facultad: 'Facultad de Derecho y Ciencias Políticas',
      escuela: 'Escuela de Derecho',
      departamento: 'Derecho Constitucional',
    },
    {
      email: 'prof.medicina@universidad.edu',
      nombre: 'Dr. Jorge Huaman',
      dni: '55667788',
      codigoEmpleado: 'P2026003',
      facultad: 'Facultad de Medicina',
      escuela: 'Escuela de Medicina Humana',
      departamento: 'Medicina Interna',
    },
  ];

  const profesores: any[] = [];
  for (const p of profesoresData) {
    const user = await prisma.usuario.upsert({
      where: { email: p.email },
      update: {},
      create: {
        nombre: p.nombre,
        email: p.email,
        dni: p.dni,
        passwordHash: await hash('Profesor123'),
        rol: 'PROFESOR',
        estado: 'ACTIVO',
        profesor: {
          create: {
            dni: p.dni,
            codigoEmpleado: p.codigoEmpleado,
            facultad: p.facultad,
            escuela: p.escuela,
            departamento: p.departamento,
          },
        },
      },
      include: { profesor: true },
    });
    profesores.push(user);
  }

  console.log('✅ Profesores creados');

  // Estudiantes
  const estudiantesData = [
    { nombre: 'Juan Perez', email: 'estudiante1@universidad.edu', dni: '12345678', codigo: '20260001', facultad: 'Facultad de Ingeniería', escuela: 'Escuela de Ingeniería de Sistemas', carrera: 'Ingeniería de Sistemas' },
    { nombre: 'Maria Gomez', email: 'estudiante2@universidad.edu', dni: '87654321', codigo: '20260002', facultad: 'Facultad de Ingeniería', escuela: 'Escuela de Ingeniería de Sistemas', carrera: 'Ingeniería de Software' },
    { nombre: 'Pedro Castillo', email: 'pedro.castillo@universidad.edu', dni: '11111111', codigo: '20260003', facultad: 'Facultad de Ingeniería', escuela: 'Escuela de Ingeniería Civil', carrera: 'Ingeniería Civil' },
    { nombre: 'Lucia Mendez', email: 'lucia.mendez@universidad.edu', dni: '22222222', codigo: '20260004', facultad: 'Facultad de Medicina', escuela: 'Escuela de Medicina Humana', carrera: 'Medicina Humana' },
    { nombre: 'Carlos Ruiz', email: 'carlos.ruiz@universidad.edu', dni: '33333333', codigo: '20260005', facultad: 'Facultad de Derecho y Ciencias Políticas', escuela: 'Escuela de Derecho', carrera: 'Derecho' },
    { nombre: 'Sofia Herrera', email: 'sofia.herrera@universidad.edu', dni: '44444444', codigo: '20260006', facultad: 'Facultad de Ciencias Económicas', escuela: 'Escuela de Contabilidad', carrera: 'Contabilidad' },
    { nombre: 'Diego Flores', email: 'diego.flores@universidad.edu', dni: '55555555', codigo: '20260007', facultad: 'Facultad de Ciencias Económicas', escuela: 'Escuela de Contabilidad', carrera: 'Administración' },
    { nombre: 'Valentina Rojas', email: 'valentina.rojas@universidad.edu', dni: '66666666', codigo: '20260008', facultad: 'Facultad de Ingeniería', escuela: 'Escuela de Ingeniería de Sistemas', carrera: 'Ingeniería de Sistemas' },
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
  // 3. ELECCIONES (alrededor de 29 junio - 1 julio 2026)
  // ─────────────────────────────────────────
  const now = new Date('2026-06-30T12:00:00.000Z'); // Hoy es 30 de junio 2026

  const eleccionesData = [
    {
      nombre: 'Elecciones Centro Federado de Ingeniería 2026',
      descripcion: 'Elección del nuevo Centro Federado de Ingeniería para el periodo 2026-2027.',
      estado: 'ACTIVA' as const,
      fechaInicio: new Date('2026-06-29T08:00:00.000Z'),
      fechaFin: new Date('2026-07-01T20:00:00.000Z'),
      facultadesIds: [facultades['Facultad de Ingeniería'].id],
      escuelasIds: [escuelas['Escuela de Ingeniería de Sistemas'].id, escuelas['Escuela de Ingeniería Civil'].id],
      carrerasIds: [carreras['Ingeniería de Sistemas'].id, carreras['Ingeniería de Software'].id, carreras['Ingeniería Civil'].id],
    },
    {
      nombre: 'Elecciones Representante Estudiantil Medicina 2026',
      descripcion: 'Elección del representante estudiantil ante el Consejo de Facultad de Medicina.',
      estado: 'PROGRAMADA' as const,
      fechaInicio: new Date('2026-07-01T08:00:00.000Z'),
      fechaFin: new Date('2026-07-03T18:00:00.000Z'),
      facultadesIds: [facultades['Facultad de Medicina'].id],
      escuelasIds: [escuelas['Escuela de Medicina Humana'].id],
      carrerasIds: [carreras['Medicina Humana'].id],
    },
    {
      nombre: 'Elecciones Decano Derecho 2026',
      descripcion: 'Elección del Decano de la Facultad de Derecho y Ciencias Políticas.',
      estado: 'CERRADA' as const,
      fechaInicio: new Date('2026-06-27T08:00:00.000Z'),
      fechaFin: new Date('2026-06-29T18:00:00.000Z'),
      facultadesIds: [facultades['Facultad de Derecho y Ciencias Políticas'].id],
      escuelasIds: [escuelas['Escuela de Derecho'].id],
      carrerasIds: [carreras['Derecho'].id],
    },
    {
      nombre: 'Elecciones Centro Federado Económicas 2026',
      descripcion: 'Elección del Centro Federado de Ciencias Económicas.',
      estado: 'BORRADOR' as const,
      fechaInicio: null,
      fechaFin: null,
      facultadesIds: [facultades['Facultad de Ciencias Económicas'].id],
      escuelasIds: [escuelas['Escuela de Contabilidad'].id],
      carrerasIds: [carreras['Contabilidad'].id, carreras['Administración'].id],
    },
    {
      nombre: 'Elecciones Consejo Universitario 2026 - Primera Vuelta',
      descripcion: 'Primera vuelta para la elección de representantes ante el Consejo Universitario UNT.',
      estado: 'FINALIZADA' as const,
      fechaInicio: new Date('2026-06-15T08:00:00.000Z'),
      fechaFin: new Date('2026-06-17T20:00:00.000Z'),
      facultadesIds: [],
      escuelasIds: [],
      carrerasIds: [],
    },
  ];

  const elecciones: any[] = [];
  for (const e of eleccionesData) {
    // Generar ID determinista para permitir upsert (Eleccion.nombre no es @unique)
    const slug = e.nombre.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60);
    const deterministicId = `seed-${slug}`;

    const eleccion = await prisma.eleccion.upsert({
      where: { id: deterministicId },
      update: {},
      create: {
        id: deterministicId,
        nombre: e.nombre,
        descripcion: e.descripcion,
        estado: e.estado,
        fechaInicio: e.fechaInicio,
        fechaFin: e.fechaFin,
        facultadesIds: e.facultadesIds,
        escuelasIds: e.escuelasIds,
        carrerasIds: e.carrerasIds,
      },
    });
    elecciones.push(eleccion);
  }

  console.log(`✅ ${elecciones.length} elecciones creadas`);

  // ─────────────────────────────────────────
  // 4. CANDIDATOS
  // ─────────────────────────────────────────
  const candidatosData = [
    // Candidatos para Elección ACTIVA: Centro Federado de Ingeniería
    {
      nombre: 'Alejandro', apellido: 'Vargas López', foto: 'https://ui-avatars.com/api/?name=Alejandro+Vargas&background=0D47A1&color=fff',
      descripcion: 'Estudiante de 8vo ciclo de Ingeniería de Sistemas. Propone mejorar los laboratorios de computación y crear un fondo de emergencia para estudiantes.',
      cargo: 'Presidente del Centro Federado', facultad: 'Facultad de Ingeniería', escuela: 'Escuela de Ingeniería de Sistemas',
      eleccionNombre: 'Elecciones Centro Federado de Ingeniería 2026',
    },
    {
      nombre: 'Daniela', apellido: 'Quispe Ramos', foto: 'https://ui-avatars.com/api/?name=Daniela+Quispe&background=C62828&color=fff',
      descripcion: 'Estudiante de 6to ciclo de Ingeniería Civil. Su plan incluye la construcción de un área de esparcimiento y más espacios de estudio colaborativo.',
      cargo: 'Presidente del Centro Federado', facultad: 'Facultad de Ingeniería', escuela: 'Escuela de Ingeniería Civil',
      eleccionNombre: 'Elecciones Centro Federado de Ingeniería 2026',
    },
    {
      nombre: 'Marco Antonio', apellido: 'Luna Torres', foto: 'https://ui-avatars.com/api/?name=Marco+Luna&background=2E7D32&color=fff',
      descripcion: 'Estudiante de 9no ciclo de Ingeniería de Software. Enfocado en la digitalización de trámites estudiantiles y mentorías técnicas.',
      cargo: 'Presidente del Centro Federado', facultad: 'Facultad de Ingeniería', escuela: 'Escuela de Ingeniería de Sistemas',
      eleccionNombre: 'Elecciones Centro Federado de Ingeniería 2026',
    },
    // Candidatos para Elección PROGRAMADA: Representante Medicina
    {
      nombre: 'Gabriela', apellido: 'Sanchez Vega', foto: 'https://ui-avatars.com/api/?name=Gabriela+Sanchez&background=6A1B9A&color=fff',
      descripcion: 'Estudiante de 5to año de Medicina. Busca mejorar las rotaciones clínicas y el acceso a material de estudio actualizado.',
      cargo: 'Representante Estudiantil', facultad: 'Facultad de Medicina', escuela: 'Escuela de Medicina Humana',
      eleccionNombre: 'Elecciones Representante Estudiantil Medicina 2026',
    },
    {
      nombre: 'Andres', apellido: 'Paredes Molina', foto: 'https://ui-avatars.com/api/?name=Andres+Paredes&background=00695C&color=fff',
      descripcion: 'Estudiante de 4to año de Medicina. Propone convenios con más hospitales para prácticas pre-profesionales.',
      cargo: 'Representante Estudiantil', facultad: 'Facultad de Medicina', escuela: 'Escuela de Medicina Humana',
      eleccionNombre: 'Elecciones Representante Estudiantil Medicina 2026',
    },
    // Candidatos para Elección CERRADA: Decano Derecho
    {
      nombre: 'Dr. Ricardo', apellido: 'Benavides Palacios', foto: 'https://ui-avatars.com/api/?name=Ricardo+Benavides&background=37474F&color=fff',
      descripcion: 'Doctor en Derecho Constitucional con 20 años de experiencia. Ex-magistrado del Tribunal Constitucional.',
      cargo: 'Decano', facultad: 'Facultad de Derecho y Ciencias Políticas', escuela: 'Escuela de Derecho',
      eleccionNombre: 'Elecciones Decano Derecho 2026',
    },
    {
      nombre: 'Dra. Patricia', apellido: 'Mendoza Rivera', foto: 'https://ui-avatars.com/api/?name=Patricia+Mendoza&background=AD1457&color=fff',
      descripcion: 'Doctora en Derecho Penal. Directora del Instituto de Derechos Humanos de la UNT.',
      cargo: 'Decano', facultad: 'Facultad de Derecho y Ciencias Políticas', escuela: 'Escuela de Derecho',
      eleccionNombre: 'Elecciones Decano Derecho 2026',
    },
    // Candidatos para Elección BORRADOR: Centro Federado Económicas
    {
      nombre: 'Fernando', apellido: 'Delgado Cruz', foto: 'https://ui-avatars.com/api/?name=Fernando+Delgado&background=283593&color=fff',
      descripcion: 'Estudiante de Administración. Plan de trabajo basado en emprendimiento estudiantil y ferias de empleo.',
      cargo: 'Presidente del Centro Federado', facultad: 'Facultad de Ciencias Económicas', escuela: 'Escuela de Contabilidad',
      eleccionNombre: 'Elecciones Centro Federado Económicas 2026',
    },
    {
      nombre: 'Camila', apellido: 'Espinoza Leon', foto: 'https://ui-avatars.com/api/?name=Camila+Espinoza&background=4527A0&color=fff',
      descripcion: 'Estudiante de Contabilidad. Propone talleres de certificación y convenios con firmas de auditoría.',
      cargo: 'Presidente del Centro Federado', facultad: 'Facultad de Ciencias Económicas', escuela: 'Escuela de Contabilidad',
      eleccionNombre: 'Elecciones Centro Federado Económicas 2026',
    },
    // Candidatos para Elección FINALIZADA: Consejo Universitario
    {
      nombre: 'Hugo', apellido: 'Nakamura Fujimori', foto: 'https://ui-avatars.com/api/?name=Hugo+Nakamura&background=263238&color=fff',
      descripcion: 'Representante estudiantil saliente. Ganó con el 62% de los votos en la primera vuelta.',
      cargo: 'Representante Estudiantil ante el Consejo Universitario', facultad: null, escuela: null,
      eleccionNombre: 'Elecciones Consejo Universitario 2026 - Primera Vuelta',
    },
    {
      nombre: 'Rosa', apellido: 'Quinteros Palma', foto: 'https://ui-avatars.com/api/?name=Rosa+Quinteros&background=4E342E&color=fff',
      descripcion: 'Docente con amplia trayectoria en investigación. Obtuvo el 58% de los votos del claustro docente.',
      cargo: 'Representante Docente ante el Consejo Universitario', facultad: null, escuela: null,
      eleccionNombre: 'Elecciones Consejo Universitario 2026 - Primera Vuelta',
    },
  ];

  const eleccionMap = new Map(elecciones.map(e => [e.nombre, e.id]));

  for (const c of candidatosData) {
    const eleccionId = eleccionMap.get(c.eleccionNombre);
    if (!eleccionId) continue;

    await prisma.candidato.upsert({
      where: {
        id: `${eleccionId}-${c.nombre.toLowerCase().replace(/\s/g, '-')}-${c.apellido.toLowerCase().replace(/\s/g, '-')}`,
      },
      update: {},
      create: {
        nombre: c.nombre,
        apellido: c.apellido,
        foto: c.foto,
        descripcion: c.descripcion,
        cargo: c.cargo,
        facultad: c.facultad,
        escuela: c.escuela,
        eleccionId,
      },
    });
  }

  console.log(`✅ ${candidatosData.length} candidatos creados`);

  // ─────────────────────────────────────────
  // 5. PADRÓN ELECTORAL (habilitar estudiantes en elecciones)
  // ─────────────────────────────────────────
  const padronData: { estudianteId?: string; profesorId?: string; eleccionId: string }[] = [];

  // Estudiantes habilitados para votar en elección ACTIVA (Ingeniería)
  const eleccionIngenieriaId = eleccionMap.get('Elecciones Centro Federado de Ingeniería 2026');
  const estudiantesIngenieria = estudiantes.filter(
    e => e.estudiante?.facultad === 'Facultad de Ingeniería'
  );
  for (const e of estudiantesIngenieria) {
    if (e.estudiante) {
      padronData.push({ estudianteId: e.estudiante.id, eleccionId: eleccionIngenieriaId! });
    }
  }

  // Estudiantes habilitados para votar en elección PROGRAMADA (Medicina)
  const eleccionMedicinaId = eleccionMap.get('Elecciones Representante Estudiantil Medicina 2026');
  const estudiantesMedicina = estudiantes.filter(
    e => e.estudiante?.facultad === 'Facultad de Medicina'
  );
  for (const e of estudiantesMedicina) {
    if (e.estudiante) {
      padronData.push({ estudianteId: e.estudiante.id, eleccionId: eleccionMedicinaId! });
    }
  }

  // Estudiantes habilitados para votar en elección CERRADA (Derecho)
  const eleccionDerechoId = eleccionMap.get('Elecciones Decano Derecho 2026');
  const estudiantesDerecho = estudiantes.filter(
    e => e.estudiante?.facultad === 'Facultad de Derecho y Ciencias Políticas'
  );
  for (const e of estudiantesDerecho) {
    if (e.estudiante) {
      padronData.push({ estudianteId: e.estudiante.id, eleccionId: eleccionDerechoId! });
    }
  }

  // Estudiantes habilitados para votar en elección BORRADOR (Económicas)
  const eleccionEconomicasId = eleccionMap.get('Elecciones Centro Federado Económicas 2026');
  const estudiantesEconomicas = estudiantes.filter(
    e => e.estudiante?.facultad === 'Facultad de Ciencias Económicas'
  );
  for (const e of estudiantesEconomicas) {
    if (e.estudiante) {
      padronData.push({ estudianteId: e.estudiante.id, eleccionId: eleccionEconomicasId! });
    }
  }

  // Todos los estudiantes y profesores habilitados para elección FINALIZADA (Consejo Universitario)
  const eleccionConsejoId = eleccionMap.get('Elecciones Consejo Universitario 2026 - Primera Vuelta');
  for (const e of estudiantes) {
    if (e.estudiante) {
      padronData.push({ estudianteId: e.estudiante.id, eleccionId: eleccionConsejoId! });
    }
  }
  for (const p of profesores) {
    if (p.profesor) {
      padronData.push({ profesorId: p.profesor.id, eleccionId: eleccionConsejoId! });
    }
  }

  let padronCount = 0;
  for (const p of padronData) {
    try {
      await prisma.padronElectoral.create({ data: p });
      padronCount++;
    } catch {
      // skip duplicates
    }
  }

  console.log(`✅ ${padronCount} registros de padrón electoral creados`);

  // ─────────────────────────────────────────
  // 6. AUDITORÍA
  // ─────────────────────────────────────────
  const auditoriaData = [
    {
      tipoEvento: 'ELECCION_CREADA',
      descripcion: 'Elección creada por el administrador electoral',
      adminId: adminElectoral.id,
      eleccionId: eleccionIngenieriaId,
    },
    {
      tipoEvento: 'ELECCION_PROGRAMADA',
      descripcion: 'Elección programada para inicio el 29 de junio',
      adminId: adminElectoral.id,
      eleccionId: eleccionIngenieriaId,
    },
    {
      tipoEvento: 'ELECCION_ACTIVADA',
      descripcion: 'Elección activada para votación',
      adminId: adminElectoral.id,
      eleccionId: eleccionIngenieriaId,
    },
    {
      tipoEvento: 'ELECCION_CREADA',
      descripcion: 'Elección de Medicina creada',
      adminId: adminElectoral.id,
      eleccionId: eleccionMedicinaId,
    },
    {
      tipoEvento: 'ELECCION_CERRADA',
      descripcion: 'Elección de Decano de Derecho cerrada tras finalizar el plazo',
      adminId: adminElectoral.id,
      eleccionId: eleccionDerechoId,
    },
    {
      tipoEvento: 'ELECCION_FINALIZADA',
      descripcion: 'Primera vuelta del Consejo Universitario finalizada exitosamente',
      adminId: adminElectoral.id,
      eleccionId: eleccionConsejoId,
    },
  ];

  for (const a of auditoriaData) {
    if (a.eleccionId) {
      await prisma.auditoriaEvento.create({ data: a });
    }
  }

  console.log(`✅ ${auditoriaData.length} eventos de auditoría creados`);

  // ─────────────────────────────────────────
  // 7. RESUMEN FINAL
  // ─────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════');
  console.log('  SEED COMPLETADO EXITOSAMENTE');
  console.log('══════════════════════════════════════════════════\n');

  console.log('--- USUARIOS DE PRUEBA ---');
  console.log('Super Admin     : admin@universidad.edu     / Admin123456');
  console.log('Admin Electoral : electoral@universidad.edu / Electoral123');
  console.log('Auditor         : auditor@universidad.edu   / Auditor123');
  console.log('Profesor        : prof.sistemas@universidad.edu / Profesor123');
  console.log('Estudiante 1    : estudiante1@universidad.edu   / Student123456');
  console.log('Estudiante 2    : estudiante2@universidad.edu   / Student123456');
  console.log('... (8 estudiantes en total, todos con password: Student123456)\n');

  console.log('--- ELECCIONES ---');
  for (const e of elecciones) {
    const candidatosCount = await prisma.candidato.count({ where: { eleccionId: e.id } });
    const padronCount = await prisma.padronElectoral.count({ where: { eleccionId: e.id } });
    console.log(`[${e.estado}] ${e.nombre}`);
    console.log(`   Candidatos: ${candidatosCount} | Padrón: ${padronCount}`);
    if (e.fechaInicio) console.log(`   Inicio: ${e.fechaInicio.toISOString()}`);
    if (e.fechaFin) console.log(`   Fin: ${e.fechaFin.toISOString()}`);
    console.log('');
  }
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
