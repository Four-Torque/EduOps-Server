export type JwtPayload = {
  id: string;
  role: string;
  exp?: number;
  iat?: number;
};
