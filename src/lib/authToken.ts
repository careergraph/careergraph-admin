import { jwtDecode } from "jwt-decode";

export type AuthTokenClaims = {
  sub?: string;
  role?: string;
  email?: string;
  exp?: number;
  iat?: number;
};

export const decodeAccessToken = (token: string): AuthTokenClaims | null => {
  try {
    return jwtDecode<AuthTokenClaims>(token);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string, skewSeconds = 15): boolean => {
  const claims = decodeAccessToken(token);
  if (!claims?.exp) {
    return true;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return claims.exp <= nowInSeconds + skewSeconds;
};
