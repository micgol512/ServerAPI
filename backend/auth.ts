import { loadFullUsers } from "./data.js";
import { TokenPayload, User } from "./types.js";
import { ServerResponse, IncomingMessage } from "http";
import jwt from "jsonwebtoken";

// const SecretKey = process.env.SECRET_KEY;

export function encodeToken(userId: string): string {
  const SecretKey: string = process.env.SECRET_KEY as string;
  const payload: TokenPayload = { userId };
  return jwt.sign(payload, SecretKey, { expiresIn: "1h" });
}
export function decodeToken(token: string): TokenPayload | null {
  const SecretKey: string = process.env.SECRET_KEY as string;
  try {
    return jwt.verify(token, SecretKey) as TokenPayload;
  } catch (error) {
    return null;
  }
}
// export function decodeToken(token: string): string {
//   let userId = token;
//   return userId;
// }
export async function getUserFromToken(token: string): Promise<User | null> {
  const users = await loadFullUsers();
  const id = decodeToken(token);
  console.log("ID: ", id);
  if (!id) {
    return null;
  }
  return users.get(id.userId);

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
  maxAge?: number
) {
  res.setHeader(
    "set-cookie",
    `token=${token}; ${maxAge ? `max-age=${maxAge}` : ""};`
  );
}

export function parseCookies(req: IncomingMessage): Record<string, string> {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    console.log("No cookies");
    return {};
  }
  const SecretKey: string = process.env.SECRET_KEY as string;
  // console.log("SecretKey: ", SecretKey);
  // console.log("Cookies: ", cookieHeader);

  return cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.split("=");
    acc[key.trim()] = value;
    return acc;
  }, {} as Record<string, string>);
}
