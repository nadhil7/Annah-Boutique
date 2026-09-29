import type { User } from "@/types/user";

export interface AuthService {
  login(email: string, password: string): Promise<User>;
  register(name: string, email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

type StoredUser = User;

const STORAGE_KEY = "annah-auth-users";
const SESSION_KEY = "annah-auth-session";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readUsers(): StoredUser[] {
  const s = getStorage();
  if (!s) return [];
  try {
    const raw = s.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  const s = getStorage();
  if (!s) return;
  try {
    s.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {
    // noop
  }
}

function readSession(): User | null {
  const s = getStorage();
  if (!s) return null;
  try {
    const raw = s.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeSession(user: User | null): void {
  const s = getStorage();
  if (!s) return;
  try {
    if (user) s.setItem(SESSION_KEY, JSON.stringify(user));
    else s.removeItem(SESSION_KEY);
  } catch {
    // noop
  }
}

function makeId(): string {
  return `usr_${Math.random().toString(36).slice(2, 10)}`;
}

export class MockAuthService implements AuthService {
  private memoryUsers: StoredUser[];
  private memorySession: User | null;

  constructor() {
    this.memoryUsers = readUsers();
    this.memorySession = readSession();
  }

  private persist(): void {
    writeUsers(this.memoryUsers);
    writeSession(this.memorySession);
  }

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<User> {
    if (!name.trim()) throw new Error("Name is required");
    if (!email.trim()) throw new Error("Email is required");
    if (!password || password.length < 6)
      throw new Error("Password must be at least 6 characters");

    const normalizedEmail = email.trim().toLowerCase();
    const exists = this.memoryUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (exists) throw new Error("Email is already registered");

    const user: StoredUser = {
      id: makeId(),
      name: name.trim(),
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
    };
    this.memoryUsers.push(user);
    const publicUser = user;
    this.memorySession = publicUser;
    this.persist();
    return publicUser;
  }

  async login(email: string, password: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.memoryUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (!user || !password) throw new Error("Invalid demo credentials");
    const publicUser = user;
    this.memorySession = publicUser;
    this.persist();
    return publicUser;
  }

  async logout(): Promise<void> {
    this.memorySession = null;
    this.persist();
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.memorySession) {
      this.memorySession = readSession();
    }
    return this.memorySession;
  }
}

const mockAuthService: AuthService = new MockAuthService();
export default mockAuthService;
