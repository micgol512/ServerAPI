import { User } from "./types.js";
import { ServerResponse, IncomingMessage } from "http";

export function generateToken(userId: string): string {
  return "";
}

export function getUserFromToken(token: string): User | null {
  return {
    id: "1", //immutable
    username: "string",
    password: "string", // Dla uproszczenia przechowujemy hasło w postaci jawnej (w praktyce należy stosować hashowanie)
    role: "admin", //immutable
    balance: 123, //immutable
  };
}

export function setAuthCookie(res: ServerResponse, token: string) {}

export function parseCookies(req: IncomingMessage): Record<string, string> {
  return {};
}
