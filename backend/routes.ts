// routes

import { IncomingMessage, ServerResponse } from "http";
import {
  loadCars,
  loadFullCars,
  loadFullUsers,
  loadUsers,
  saveCars,
  saveUsers,
} from "./data.js";
import path from "path";
import { promises as fs } from "fs";
import { __dirname, clients } from "./index.js";
import { BaseImpl } from "./types.js";
import {
  decodeToken,
  encodeToken,
  parseCookies,
  setAuthCookie,
} from "./auth.js";

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

  res.end(data);
}
async function purchaseCar(req: IncomingMessage, res: ServerResponse) {}
async function addCar(req: IncomingMessage, res: ServerResponse) {}

export async function carsHandler(req: IncomingMessage, res: ServerResponse) {
  const cars = await loadFullCars();
  if (req.method === "POST") {
    if (req.url?.endsWith("buy")) {
      console.log("POST CARS");
      const carID = req.url?.split("/")[2];
      const token = parseCookies(req)["token"];
      const userID = decodeToken(token)?.userId;
      if (carID && userID) {
        const car = cars.get(carID);
        if (!car) {
          res.writeHead(404, {
            "Content-Type": "application/json",
          });
          res.end(
            JSON.stringify({ error: "Nie znaleziono samochodu o danym id" })
          );
          return;
        }
        if (car.ownerId) {
          res.writeHead(403, {
            "Content-Type": "application/json",
          });
          res.end(JSON.stringify({ error: "Samochód już jest sprzedany" }));
          return;
        }
        const users = await loadFullUsers();
        const user = users.get(userID);
        if (!user) {
          res.writeHead(404, {
            "Content-Type": "application/json",
          });
          res.end(JSON.stringify({ error: "Nie znaleziono użytkownika" }));
          return;
        }
        if (user.balance < car.price) {
          res.writeHead(403, {
            "Content-Type": "application/json",
          });
          res.end(JSON.stringify({ error: "Za mało środków" }));
          return;
        }
        user.balance -= car.price;
        car.ownerId = user.id;
        console.log("CAR ID: ", carID);

        const data = `data: ${JSON.stringify({
          event: "CarPurchased",
          carId: car.id,
          buyerId: userID,
        })}\n\n`;
        clients.forEach((client) => client.write(data));

        await saveUsers(users.get());
        await saveCars(cars.get());

        res.writeHead(200, {
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify({ message: "Kupiono auto" }));
      }
    } else {
      //add CAR

      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          const { model, price } = data;
          if (
            typeof model !== "string" ||
            typeof price !== "number" ||
            price < 0
          ) {
            res.writeHead(400, {
              "Content-Type": "application/json",
            });
            res.end(JSON.stringify({ error: "Niepoprawne dane" }));
            return;
          }
          const newCar = {
            id: cars.get().length.toString(),
            model,
            price,
            ownerId: null,
          };
          cars.add(newCar);
          saveCars(cars.get());
          res.writeHead(201, { "Content-Type": "application/json" });
        } catch (e) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
      return;
    }
  } else {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify(cars.get()));
  }
}
export async function usersHandler(req: IncomingMessage, res: ServerResponse) {
  const token = parseCookies(req)["token"];
  console.log("Token: ", token);
  if (!token) {
    res.writeHead(403, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ error: "Nie zalogowany" }));
    return;
  }
  const userID = decodeToken(token)?.userId;
  if (!userID) {
    res.writeHead(401, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ error: "Brak autoryzacji" }));
    return;
  }
  const users = await loadFullUsers();
  const user = users.get(userID);
  if (!user) {
    res.writeHead(404, {
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ error: "Usera nie znaleziono." }));
    return;
  }
  res.writeHead(200, {
    "Content-Type": "application/json",
  });
  if (user.role !== "admin") {
    res.end(JSON.stringify(user));
  } else {
    res.end(JSON.stringify(users.get()));
  }
}

// const users = await loadFullUsers();
// console.log(parseCookies(req)["token"] || "brak tokena");
// res.writeHead(200, {
//   "Content-Type": "application/json",
// });
// // console.log(users.get());
// res.end(JSON.stringify(users.get()));

export async function hackHandler(req: IncomingMessage, res: ServerResponse) {
  homeHandler(req, res);
  const users = await loadFullUsers();
  const token = parseCookies(req)["token"];
  const userID = decodeToken(token)?.userId as string;
  const cash = req.url ? parseInt(req.url.split("/")[2]) : 1000;

  // users.get(userID)?.balance+=1000;
  res.writeHead(202, {
    "Content-Type": "application/json",
  });
  res.end(
    JSON.stringify({
      message: `Hacked!!! User o ID: ${userID} dodał ${cash} na swoje konto`,
    })
  );
}
export function notFoundHandler(req: IncomingMessage, res: ServerResponse) {
  res.end("<h1>404 - Not Found</h1>");
}
export function errorHandler(req: IncomingMessage, res: ServerResponse) {
  res.end("<h1>500 - Server Error</h1>");
}
export async function loginHandler(req: IncomingMessage, res: ServerResponse) {
  const users = await loadFullUsers();
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    try {
      const data = JSON.parse(body);
      const { username, password } = data;
      const user = users
        .get()
        .find((u) => u.username === username && u.password === password);

      if (user) {
        setAuthCookie(res, encodeToken(user.id));
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
