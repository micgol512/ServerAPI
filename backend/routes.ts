// routes

import { IncomingMessage, ServerResponse } from "http";
import { loadCars, loadUsers } from "./data.js";
import path from "path";
import { promises as fs } from "fs";
import { __dirname } from "./index.js";
import { BaseImpl } from "./types.js";
//GET
// /static/ ->  index.html
// /cars -> cars from db/cars.json
// /cars/:id -> specyfic data for id
// /users -> users from db/users.json
// /users/id ->specyfic data for id
//login i logout? register

//POST
export async function homeHandler(req: IncomingMessage, res: ServerResponse) {
  // res.end("<h1>Strona główna</h1>");
  const filePath = path.join(__dirname, "../", "frontend", "index.html");
  const data = await fs.readFile(filePath);
  res.end(data);
}
export async function carsHandler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        console.log("Co jest w body", data);
        res.end(JSON.stringify(data));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "set-cookie": "cookie=123",
    });
    const cars = await loadCars();
    console.log(cars);
    res.end(JSON.stringify(cars));
  }
}
export async function usersHandler(req: IncomingMessage, res: ServerResponse) {
  const users = new BaseImpl(await loadUsers());
  res.writeHead(200, {
    "Content-Type": "application/json",
    "set-cookie": "cookie=123",
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
  const users = await loadUsers();
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

      const user = users.find(
        (u) => u.username === username && u.password === password
      );
      const us = users.filter(
        ({ username, password }: any) =>
          username === username && password === password
      );

      if (user) {
        res.writeHead(200, { "Content-Type": "application/json" });
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

export default {
  homeHandler,
  carsHandler,
  usersHandler,
  hackHandler,
  notFoundHandler,
  errorHandler,
  loginHandler,
};
