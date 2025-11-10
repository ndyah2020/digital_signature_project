export interface User {
    sub: number;
    name: string;
    email: string;
    publicKey?: string;
    role: string;
    iat: number;
    exp: number;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
  };
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    createAt: Date
}