import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nombre: z.string().min(2),
  codigo: z.string().min(1),
  role: z.enum(['ESTUDIANTE', 'DOCENTE']),
});
