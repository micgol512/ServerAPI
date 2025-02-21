import http, { IncomingMessage, ServerResponse } from "http";
import path from "path";

import { promises as fs } from "fs";
import url, { fileURLToPath } from "url";
import { queueRequest } from "./middlewares.js";

console.clear();
console.log(` --> Uruchomiono serwer <--
 |
 |> ${process.env.HOSTNAME?.replace(":", "://")}:${process.env.PORT}
 |
`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// console.log(path.dirname(__dirname));

const PORT = process.env.PORT ?? "3000";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const reqUrl = req.url;
  const reqMethod = req.method;

  // console.log("WINDOWWWWW ", window.location.hash); // -> #home
  const myURL = new URL(`http://localhost:3000${req.url}`);
  // console.log(myURL);
  // console.log(myURL.searchParams.get("id"));
  console.log(req.url);
  console.log(req.method);
  res.statusCode = 200;
  let filePath = path.join(__dirname, "../", "frontend", "index.html");
  if (reqUrl === "/static") {
    filePath = path.join(__dirname, "../", "frontend", "index.html");
    const data = await fs.readFile(filePath);
    res.end(data);
  } else if (reqUrl === "/users") {
    res.end("<h1>Pobieranie Users</h1>");
  } else res.end("<h1>Błąd</h1>");

  // if (req.url === "/test" && req.method === "GET") {
  //   await delay(2000); // Symulacja długiego procesu
  //   res.writeHead(200, { "Content-Type": "application/json" });
  //   res.end(JSON.stringify({ message: "Żądanie obsłużone" }));
  // } else {
  //   res.writeHead(404, { "Content-Type": "application/json" });
  //   res.end(JSON.stringify({ error: "Nie znaleziono endpointu" }));
  // }
}

const server = http.createServer(async (req, res) => {
  queueRequest(req, res, handleRequest);

  // else if (req.url?.includes("about"))
  //   filePath = path.join(__dirname, "about.html");
  // else if (req.url?.includes("contact"))
  //   filePath = path.join(__dirname, "contact.html");
  // else filePath = path.join(__dirname, "not_found.html");

  // 1st option serve static files from frontend folder while hitting /static/ endpoint
  // if (// startsWith(/static/)) {}
  // then server file
  // 2nd option allow CORS

  // 1. Obsługa endpointów
  // 2. Proste serwowanie plików statycznych z katalogu frontend (np. pod ścieżką /static/)
});

server.listen(PORT, () => {
  console.log(`Server running succesfull.`);
});
