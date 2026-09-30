import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "admin_session";
export const SESSION_TTL_S = 60 * 60 * 12;

const key = () => new TextEncoder().encode(process.env.SESSION_SECRET ?? "");

export const signSession = (sub: string) =>
  new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_S}s`)
    .sign(key());

export async function verifySession(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return payload.role === "admin" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}
