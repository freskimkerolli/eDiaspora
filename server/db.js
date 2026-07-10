import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "data", "users.json");

function ensureDbFile() {
  if (!fs.existsSync(path.dirname(DB_FILE))) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, "[]", "utf-8");
  }
}

function readUsers() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeUsers(users) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export function findUserByEmail(email) {
  return readUsers().find(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );
}

export function findUserByVerificationToken(token) {
  return readUsers().find((user) => user.verificationToken === token);
}

export function createUser(user) {
  const users = readUsers();
  const newUser = { id: users.length + 1, ...user };
  users.push(newUser);
  writeUsers(users);
  return newUser;
}

export function updateUser(id, updates) {
  const users = readUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  writeUsers(users);
  return users[index];
}
