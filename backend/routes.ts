// routes

import { IncomingMessage, ServerResponse } from "http";
import { loadCars, loadFullCars, loadFullUsers, loadUsers } from "./data.js";
import path from "path";
import { promises as fs } from "fs";
import { __dirname, clients } from "./index.js";
import { BaseImpl } from "./types.js";
import { parseCookies, setAuthCookie } from "./auth.js";
//GET
// /static/ ->  index.html
// /cars -> cars from db/cars.json
// /cars/:id -> specyfic data for id
// /users -> users from db/users.json
// /users/id ->specyfic data for id
//login i logout? register

//
export async function homeHandler(req: IncomingMessage, res: ServerResponse) {
  // res.end("<h1>Strona główna</h1>");
  const filePath = path.join(__dirname, "../", "frontend", "index.html");
  const data = await fs.readFile(filePath);
  setAuthCookie(res, "123");
  res.end(data);
}
export async function carsHandler(req: IncomingMessage, res: ServerResponse) {
  const cars = await loadFullCars();
  if (req.method === "POST") {
    console.log("POST CARS");
    console.log(await parseCookies(req));
    // sprawdzamy czy istnieje samochod o ID podanym w URL
    // potem z tokena czytamy username oraz implementujemy całą baze by sprawdzić czy stać go na zakup oraz określić ID usera
    // jeśli tak to zmieniamy właściciela auta
    // if(auth())
  } else {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });
    console.log(cars.get());
    res.end(JSON.stringify(cars.get()));
  }
}
export async function usersHandler(req: IncomingMessage, res: ServerResponse) {
  const users = await loadFullUsers();
  res.writeHead(200, {
    "Content-Type": "application/json",
  });
  console.log(users.get());
  res.end(JSON.stringify(users.get()));
}
export function hackHandler(req: IncomingMessage, res: ServerResponse) {
  res.end("<h1>Hack</h1>");
}
export function notFoundHandler(req: IncomingMessage, res: ServerResponse) {
  res.end("<h1>404 - Not Found</h1>");
}
export function errorHandler(req: IncomingMessage, res: ServerResponse) {
  res.end("<h1>500 - Server Error</h1>");
}
export async function loginHandler(req: IncomingMessage, res: ServerResponse) {
  // res.writeHead(200, {
  //   "Content-Type": "application/json",
  //   "set-cookie": "cookie=123",
  // });
  const users = await loadFullUsers();
  // console.log(); //show body
  // console.log("Co jest w body", req);
  // res.end(JSON.stringify(users));

  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    try {
      const data = JSON.parse(body);
      const { username, password } = data;
      console.log("username: ", username, "password: ", password);

      const user = users
        .get()
        .find((u) => u.username === username && u.password === password);
      const us = users
        .get()
        .filter(
          ({ username, password }: any) =>
            username === username && password === password
        );

      if (user) {
        setAuthCookie(res, user.id);
        res.end(JSON.stringify(user));
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Błędne dane logowania" }));
      }
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
    }
  });
  return;
}
export async function sseHandler(req: IncomingMessage, res: ServerResponse) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  clients.push(res);
  console.log("Nowy klient SSE podłączony!");

  req.on("close", () => {
    clients.splice(clients.indexOf(res), 1);
    console.log("Klient SSE odłączony");
  });
}
export default {
  homeHandler,
  carsHandler,
  usersHandler,
  hackHandler,
  notFoundHandler,
  errorHandler,
  loginHandler,
  sseHandler,
};
