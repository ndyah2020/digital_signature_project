const jwt = require("jsonwebtoken");

export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  role: string;
  publicKey: string | null;
}

export function signToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.sign(payload, secret, { expiresIn: "2h" });
}

export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.verify(token, secret) as JwtPayload;
}
