export interface JwtPayload {
  sub: string;
  email: string;
  dni?: string | null;
  rol: string;
}

export type AuthenticatedUser = JwtPayload;
