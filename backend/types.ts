export interface User {
    id: string; //immutable
    username: string;
    password: string; // Dla uproszczenia przechowujemy hasło w postaci jawnej (w praktyce należy stosować hashowanie)
    role: 'admin' | 'user'; //immutable
    balance: number; //immutable
  }
  
  export interface Car {
    id: string;
    model: string;
    price: number;
    ownerId: string;
  }
  