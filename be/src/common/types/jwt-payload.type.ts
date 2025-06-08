export interface JWTPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
  jti?: string;
  [key: string]: unknown;
}
