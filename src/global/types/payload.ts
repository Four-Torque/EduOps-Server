export type JwtPayload = {
  id: string;
  role: string;
  branchId: string;
  exp?: number;
  iat?: number;
};
