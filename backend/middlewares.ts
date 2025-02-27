import { IncomingMessage, ServerResponse } from "http";
import { RequestHandler } from "./types.js";

const requestQueue: {
  req: IncomingMessage;
  res: ServerResponse;
  handler: RequestHandler;
}[] = [];
let processing = false;

/**
 * Kolejkuje przychodzące żądania i wykonuje je jedno po drugim.
 */
export function queueRequest(
  req: IncomingMessage,
  res: ServerResponse,
  handler: RequestHandler
) {
  requestQueue.push({ req, res, handler });
  processQueue();
}

async function processQueue() {
  if (processing || requestQueue.length === 0) return;

  processing = true;
  const { req, res, handler } = requestQueue.shift()!;

  try {
    await handler(req, res);
  } catch (err) {
    console.error("Błąd podczas obsługi żądania:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
  processing = false;
  processQueue(); // Przetwarzamy kolejne żądanie
}
