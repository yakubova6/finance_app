import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export class AuthManager {
  private static TOKEN_KEY = "ecofinance_token";
  private static USER_KEY = "ecofinance_user";

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/login", {
      email,
      password,
    });
    
    const data: AuthResponse = await response.json();
    this.setToken(data.token);
    this.setUser(data.user);
    
    return data;
  }

  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    
    const data: AuthResponse = await response.json();
    this.setToken(data.token);
    this.setUser(data.user);
    
    return data;
  }

  static async forgotPassword(email: string): Promise<void> {
    await apiRequest("POST", "/api/auth/forgot-password", { email });
  }

  static logout(): void {
    this.removeToken();
    window.location.href = "/";
  }

  static getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
