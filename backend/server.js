import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { initDb, openDb } from "./db.js";
import profileRoutes from "./profileRoutes.js";
import friendRoutes from "./friendRoutes.js";
import fastifyWebsocket from "fastify-websocket";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;

if (!JWT_SECRET) {
	throw new Error("La variable JWT_SECRET est requise dans le .env");
}

const fastify = Fastify({ logger: true });
fastify.register(fastifyWebsocket);

const activeUsers = new Map();

fastify.get('/api/friend-status', { websocket: true }, (connection, req) => {
	console.log("→ Nouvelle tentative de connexion WebSocket (avant JWT)");
  
	const headers = req?.headers;
	console.log("→ Headers de la requête :", headers);
  
	const token = headers?.['sec-websocket-protocol'];
	console.log("→ Token extrait depuis subprotocol :", token);
  
	const userId = verifyTokenAndGetUserId(token);
	if (!userId) {
	  console.log("Token invalide ou absent, fermeture WS");
	  connection.socket.end();
	  return;
	}
  
	console.log("Client WS connecté pour userId =", userId);
	activeUsers.set(userId, connection.socket);
  
	notifyFriendsStatusChange(userId, true);
  
	connection.socket.on('close', () => {
	  console.log("Client WS déconnecté pour userId =", userId);
	  activeUsers.delete(userId);
	  notifyFriendsStatusChange(userId, false);
	});
  
	connection.socket.on('message', msg => {
	  console.log("WS message de", userId, ":", msg.toString());
	});
  });

function verifyTokenAndGetUserId(token) {
	try {
		if (!token) {
			console.log("Token absent, impossible de vérifier l'utilisateur");
			return null;
		}
		const decoded = jwt.verify(token, JWT_SECRET);
		return decoded.id;
	} catch (e) {
		console.error("Erreur de vérification du token :", e.message);
		return null;
	}
}

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
