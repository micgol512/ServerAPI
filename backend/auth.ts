import { loadFullUsers } from "./data.js";
import { User } from "./types.js";
import { ServerResponse, IncomingMessage } from "http";

export function encodeToken(userId: string): string {
  let token = userId;
  return token;
}
export function decodeToken(token: string): string {
  let userId = token;
  return userId;
}
export async function getUserFromToken(token: string): Promise<User | null> {
  const users = await loadFullUsers();
  const id = decodeToken(token);
  return users.get(id);

  // return {
  //   id: "1", //immutable
  //   username: "string",
  //   password: "string", // Dla uproszczenia przechowujemy hasło w postaci jawnej (w praktyce należy stosować hashowanie)
  //   role: "admin", //immutable
  //   balance: 123, //immutable
  // };
}

export function setAuthCookie(
  res: ServerResponse,
  token: string,
  maxAge: number = 60
) {
  res.setHeader("set-cookie", `token=${token}; max-age=${maxAge}};`);
}

export function parseCookies(req: IncomingMessage): Record<string, string> {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return {};
  }
  return cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.split("=");
    acc[key.trim()] = value;
    return acc;
  }, {} as Record<string, string>);
}
