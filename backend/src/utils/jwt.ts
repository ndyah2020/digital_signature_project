const jwt = require("jsonwebtoken");

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.sign(payload, secret, { expiresIn: "1h" });
}

export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.verify(token, secret) as JwtPayload;
}
