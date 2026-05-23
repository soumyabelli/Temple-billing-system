const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dataDir = path.join(__dirname, "..", "data");
const usersFilePath = path.join(dataDir, "users.json");

const ensureUsersFile = async () => {
  await fs.promises.mkdir(dataDir, { recursive: true });
  if (!fs.existsSync(usersFilePath)) {
    await fs.promises.writeFile(usersFilePath, "[]", "utf-8");
  }
};

const readUsers = async () => {
  await ensureUsersFile();
  const raw = await fs.promises.readFile(usersFilePath, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeUsers = async (users) => {
  await ensureUsersFile();
  await fs.promises.writeFile(usersFilePath, JSON.stringify(users, null, 2), "utf-8");
};

const findUserByEmail = async (email) => {
  const users = await readUsers();
  return users.find((user) => user.email === email) || null;
};

const findUserById = async (id) => {
  const users = await readUsers();
  return users.find((user) => user.id === id) || null;
};

const createUser = async ({ name, email, password, role, mustChangePassword = false, provider = "local" }) => {
  const users = await readUsers();
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    password,
    role,
    mustChangePassword,
    provider,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);

  return user;
};

const updateUser = async (id, updates) => {
  const users = await readUsers();
  const idx = users.findIndex((user) => user.id === id);
  if (idx < 0) {
    return null;
  }

  users[idx] = {
    ...users[idx],
    ...updates,
    id: users[idx].id,
    updatedAt: new Date().toISOString(),
  };

  await writeUsers(users);
  return users[idx];
};

const getAllUsers = async () => {
  const users = await readUsers();
  return users;
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  getAllUsers,
};
