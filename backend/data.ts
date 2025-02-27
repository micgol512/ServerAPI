// // biblioteka JWT -> https://jwt.io/
// //https://www.npmjs.com/package/jsonwebtoken

import { promises as fs } from "fs";
import { BaseImpl, Car, DB, User } from "./types.js";

let USERS_PATH = "./db/users.json";
let CARS_PATH = "./db/cars.json";

export async function loadFile(filePath: string) {
  const rawData = await fs.readFile(filePath, "utf-8");
  const data = JSON.parse(rawData);
  return data;
}
async function saveFile(filePath: string, data: any) {
  await fs.writeFile(filePath, JSON.stringify(data));
}
export async function loadUsers(): Promise<User[]> {
  return loadFile(USERS_PATH);
}
export async function loadFullUsers(): Promise<BaseImpl<User>> {
  return new BaseImpl(await loadFile(USERS_PATH));
}
export async function loadFullCars(): Promise<BaseImpl<Car>> {
  return new BaseImpl(await loadCars());
}
export async function loadCars(): Promise<Car[]> {
  return loadFile(CARS_PATH);
}
export async function saveUsers(data: User[]): Promise<void> {
  await saveFile(USERS_PATH, data);
}
export async function saveCars(data: Car[]): Promise<void> {
  await saveFile(CARS_PATH, data);
}

export async function saveDB(data: DB): Promise<void> {
  await Promise.all([
    fs.writeFile(USERS_PATH, JSON.stringify(data.users.get())),
    fs.writeFile(CARS_PATH, JSON.stringify(data.cars.get())),
  ]);
}
const mojaData = new DB(await loadUsers(), await loadCars());
const users = new BaseImpl(await loadUsers());
const cars = new BaseImpl(await loadCars());
console.log("Users:", users.get());
console.log("Cars:", cars.get());
