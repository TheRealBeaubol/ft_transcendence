import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { initDb } from "./db.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;

if (!JWT_SECRET) {
  throw new Error("La variable JWT_SECRET est requise dans le .env");
}

const fastify = Fastify({ logger: true });

fastify.register(fastifyJwt, {
  secret: JWT_SECRET
});

fastify.decorate("authenticate", async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

let db;
(async () => {
  db = await initDb();
  fastify.log.info("Base SQLite initialisée");
})();

const userSchema = {
  type: "object",
  required: ["username", "password"],
  properties: {
    username: { type: "string", minLength: 3 },
    password: { type: "string", minLength: 6 }
  }
};

fastify.get("/api/", async () => ({ message: "Pong API ready!" }));

fastify.post("/api/register", { schema: { body: userSchema } }, async (request, reply) => {
  const { username, password } = request.body;
  try {
    const existing = await db.get("SELECT id FROM users WHERE username = ?", username);
    if (existing) {
      return reply.code(400).send({ error: "Username déjà utilisé" });
    }
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);
    const result = await db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      username,
      hashed
    );
    return reply.code(201).send({ id: result.lastID, username });
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ error: "Erreur interne" });
  }
});

fastify.post("/api/login", { schema: { body: userSchema } }, async (request, reply) => {
  const { username, password } = request.body;
  try {
    const user = await db.get("SELECT id, password FROM users WHERE username = ?", username);
    if (!user) {
      return reply.code(400).send({ error: "Utilisateur non trouvé" });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return reply.code(400).send({ error: "Mot de passe incorrect" });
    }
    const token = fastify.jwt.sign({ id: user.id, username });
    return reply.send({ token });
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ error: "Erreur interne" });
  }
});

fastify.get("/api/profile", {
  preValidation: [fastify.authenticate]
}, async (request, reply) => {
  const user = request.user;
  return { id: user.id, username: user.username };
});

const start = async () => {
  try {
    await fastify.listen({ port: Number(PORT), host: "0.0.0.0" });
    fastify.log.info(`Serveur démarré sur le port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
