import jwt from "jsonwebtoken";
import { notifyFriendsStatusChange } from "./server.js";
import { openDb } from "./db.js";

const { verify } = jwt;

const activeUsers = new Map();

export default async function (fastify) {
	fastify.get('/api/friend-status', { websocket: true }, async (connection, req) => {
		try {
			const { token } = req.query;
			console.log("🔐 Token reçu :", token);
			console.log("🔗 Connexion WebSocket établie");

			if (!token) {
				console.error("❌ Aucun token fourni");
				connection.socket.close(4001, "No token provided");
				return;
			}

			const payload = verify(token, process.env.JWT_SECRET);

			const ws = connection;
			const userId = payload.id;

			if (!activeUsers.has(userId)) {
				activeUsers.set(userId, new Set());
				notifyFriendsStatusChange(userId, true);
			}

			activeUsers.get(userId).add(ws);

			console.log(`🟢 Utilisateur ${userId} en ligne`);

			ws.on('close', (code, reason) => {
				console.log(`🔴 WebSocket fermé, code=${code}, reason=${reason.toString()}`);
				const userSockets = activeUsers.get(userId);
				userSockets?.delete(ws);
				if (userSockets?.size === 0) {
					activeUsers.delete(userId);
					notifyFriendsStatusChange(userId, false);
				}
			});

			ws.on('error', (err) => {
				console.error(`⚠️ WebSocket erreur utilisateur ${userId}:`, err);
			});

			ws.send(JSON.stringify({ type: 'welcome', msg: 'Connected to friend status server' }));

			const db = await openDb();
			const friends = await db.all(
				`SELECT friend_id FROM friends WHERE user_id = ?`,
				[userId]
			);

			for (const friend of friends) {
				const isOnline = activeUsers.has(friend.friend_id);
				ws.send(JSON.stringify({
					type: 'friend_status',
					userId: friend.friend_id,
					online: isOnline,
				}));
			}

		} catch (err) {
			console.error("Erreur dans WebSocket handler :", err);
			connection.socket.close(1011, "Internal server error");
		}
	});
}

export { activeUsers };
