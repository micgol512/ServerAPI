// // biblioteka JWT -> https://jwt.io/
// //https://www.npmjs.com/package/jsonwebtoken

import { promises as fs } from "fs";
import { Car, DB, User } from "./types.js";
let path = "./db/users.json";
async function loadFile(filePath: string) {
  const rawData = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(rawData);
  return data;
}
async function loadUsers() {
  const rawData = await fs.readFile("./db/users.json", "utf-8");
  const users = JSON.parse(rawData);
  return users;
}
async function loadCars() {
  const rawData = await fs.readFile("./db/cars.json", "utf-8");
  const cars = JSON.parse(rawData);
  return cars;
}
async function saveDB(data: DB): Promise<void> {
  await Promise.all([
    fs.writeFile("./db/users.json", JSON.stringify(data.users.get())),
    fs.writeFile("./db/cars.json", JSON.stringify(data.cars.get())),
  ]);
}
const mojaData = new DB(await loadUsers(), await loadCars());
console.log(mojaData.users.get());

// async function main(update: Partial<User> | Partial<Car>) {
//   const myDB = new DB(
//     await loadFile("./db/users.json"),
//     await loadFile("./db/cars.json")
//   );
//   // tu logika zapisu, odczytu i modyfikacji bazy w zależności od przekazanej ścieżki
//   console.log("Cars:", myDB.cars.get());
//   myDB.cars.set("1", update);
//   console.log("Car id 1:", myDB.cars.get("1"));
//   await saveDB(myDB);
// }

// await main({ model: "Honda" });
// await main({ model: "Zafira" });
