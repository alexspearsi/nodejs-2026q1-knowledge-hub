import { UserRole } from '../../generated/prisma/enums';

export interface JwtPayload {
  userId: string;
  login: string;
  role: UserRole;
}
