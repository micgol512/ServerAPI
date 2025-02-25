import { IncomingMessage, ServerResponse } from "http";

export interface User {
  id: string; //immutable
  username: string;
  password: string; // Dla uproszczenia przechowujemy hasło w postaci jawnej (w praktyce należy stosować hashowanie)
  role: "admin" | "user"; //immutable
  balance: number; //immutable
}

export interface Car {
  id: string;
  model: string;
  price: number;
  ownerId: string | null;
}

export interface Base<T> {
  //T to users albo cars
  data: T[];
  get(): T[];
  get(id: string): T;

  set<K extends keyof T>(id: string, updates: Partial<Pick<T, K>>): void;
  delete(id: string): void;
}
export class BaseImpl<T extends { id: string }> implements Base<T> {
  data: T[];
  constructor(data: T[]) {
    this.data = data;
  }
  get(): T[];
  get(id: string): T;
  get(id?: string | undefined) {
    if (!id) {
      return this.data;
    } else {
      const item = this.data.find((item) => item.id === id);
      if (!item) {
        throw new Error("Not found");
      }
      return item;
    }
  }
  set<K extends keyof T>(id: string, updates: Partial<Pick<T, K>>): void {
    const index = this.data.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }
    this.data[index] = {
      ...this.data[index],
      ...updates,
    };
  }
  delete(id: string): void {
    this.data = this.data.filter((item) => item.id !== id);
  }
}
export interface DataBase {
  users: BaseImpl<User>;
  cars: BaseImpl<Car>;
}

export class DB implements DataBase {
  users: BaseImpl<User>;
  cars: BaseImpl<Car>;
  constructor(users: User[], cars: Car[]) {
    this.users = new BaseImpl(users);
    this.cars = new BaseImpl(cars);
  }
}

export type RequestHandler = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<void>;
