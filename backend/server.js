import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyWebsocket from "@fastify/websocket";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { initDb, openDb } from "./db.js";
import profileRoutes from "./profileRoutes.js";
import friendRoutes from "./friendRoutes.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;

if (!JWT_SECRET) {
	throw new Error("La variable JWT_SECRET est requise dans le .env");
}

const fastify = Fastify({ logger: true });
fastify.register(fastifyWebsocket);
fastify.register(fastifyJwt, {
	secret: JWT_SECRET
});

const activeUsers = new Map();
fastify.get('/api/friend-status', { websocket: true }, (connection, req) => {
	try {
	  const url = new URL(req.raw.url, `http://${req.headers.host}`);
	  const token = url.searchParams.get('token');
  
	  if (!token) {
		console.log('❌ Aucun token fourni');
		return connection.socket.close();
	  }
  
	  const decoded = fastify.jwt.verify(token);
	  console.log("✅ JWT vérifié :", decoded);
  
	  connection.socket.send(`Bienvenue ${decoded.username}`);
  
	  connection.socket.on('message', (message) => {
		console.log(`💬 Message de ${decoded.username} :`, message.toString());
	  });
  
	} catch (err) {
	  console.error("🚫 JWT invalide :", err.message);
	  connection.socket.close();
	}
  });
  
  


async function notifyFriendsStatusChange(userId, isOnline) {
    const db = await openDb();

    const friends = await db.all(
        `SELECT friend_id FROM friends WHERE user_id = ?`, [userId]
    );

    for (const friend of friends) {
        const friendSocket = activeUsers.get(friend.friend_id);
        if (friendSocket) {
            friendSocket.send(JSON.stringify({
                type: 'friend_status',
                userId,
                online: isOnline,
            }));
        }
    }
}

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

	await fastify.register(profileRoutes);
	await fastify.register(friendRoutes);

	fastify.get("/api/", async () => ({ message: "Pong API ready!" }));

	const registerSchema = {
		type: "object",
		required: ["username", "password", "email"],
		properties: {
			username: { type: "string", minLength: 3 },
			password: { type: "string", minLength: 6 },
			email: { type: "string", format: "email" }
		}
	};

	const loginSchema = {
		type: "object",
		required: ["identifier", "password"],
		properties: {
			identifier: { type: "string", minLength: 3 },
			password: { type: "string", minLength: 6 }
		}
	};

	fastify.post("/api/register", { schema: { body: registerSchema } }, async (request, reply) => {
		const { username, password, email} = request.body;
		try {
			const existing = await db.get("SELECT id FROM users WHERE username = ?", username);
			if (existing) {
				return reply.code(400).send({ error: "Username déjà utilisé" });
			}
			const existingEmail = await db.get("SELECT id FROM users WHERE email = ?", email);
			if (existingEmail) {
				return reply.code(400).send({ error: "Email déjà utilisé" });
			}
			const defaultAvatar = "https://i.pinimg.com/1200x/35/99/27/359927d1398df943a13c227ae0468357.jpg"; // URL d'avatar par défaut
			const saltRounds = 10;
			const hashed = await bcrypt.hash(password, saltRounds);
			const result = await db.run(
				"INSERT INTO users (username, password, email, avatar) VALUES (?, ?, ?, ?)",
				username,
				hashed,
				email,
				defaultAvatar
			);
			return reply.code(201).send({ id: result.lastID, username });
		} catch (err) {
			request.log.error(err);
			return reply.code(500).send({ error: "Erreur interne" });
		}
	});

	fastify.post("/api/login", { schema: { body: loginSchema } }, async (request, reply) => {
		const { identifier, password } = request.body;
		try {
			const user = await db.get(
				"SELECT id, username, password FROM users WHERE username = ? OR email = ?",
				identifier,
				identifier
			);
	
			if (!user) {
				return reply.code(400).send({ error: "Utilisateur non trouvé" });
			}
	
			const isValid = await bcrypt.compare(password, user.password);
			if (!isValid) {
				return reply.code(400).send({ error: "Mot de passe incorrect" });
			}
	
			const token = fastify.jwt.sign({ id: user.id, username: user.username });
			return reply.send({ token });
		} catch (err) {
			request.log.error(err);
			return reply.code(500).send({ error: "Erreur interne" });
		}
	});

	try {
		await fastify.listen({ port: Number(PORT), host: "0.0.0.0" });
		fastify.log.info(`Serveur démarré sur le port ${PORT}`);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
})();
