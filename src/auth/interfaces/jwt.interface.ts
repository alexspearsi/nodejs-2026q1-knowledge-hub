enum UserRole {
  admin,
  editor,
  viewer,
}

export interface JwtPayload {
  userId: string;
  login: string;
  role: UserRole;
}
