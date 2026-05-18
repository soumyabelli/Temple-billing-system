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

const createUser = async ({ name, email, password, role }) => {
  const users = await readUsers();
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    password,
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);

  return user;
};

module.exports = {
  findUserByEmail,
  createUser,
};
