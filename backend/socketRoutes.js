import jwt from "jsonwebtoken";
import { notifyFriendsStatusChange } from "./server.js";

const { verify } = jwt;

const activeUsers = new Map();

export default async function (fastify) {
  fastify.get('/api/friend-status', { websocket: true }, (connection, req) => {
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
    console.log("✅ JWT vérifié avec succès :", payload);

    const ws = connection;
    console.log("🔗 WebSocket : ", ws);

    const userId = payload.id;
    console.log(`🆔 ID utilisateur : ${userId}`);

    if (activeUsers.has(userId)) {
      const oldWs = activeUsers.get(userId);
      if (oldWs.readyState === oldWs.OPEN) {
        oldWs.close(4000, 'New connection established');
      }
    }

    activeUsers.set(userId, ws);
    console.log(`🟢 Utilisateur ${userId} en ligne`);

    notifyFriendsStatusChange(userId, true)

    ws.send(JSON.stringify({ type: 'welcome', msg: 'Connected to friend status server' }));

    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.ping(); // ping manuel
      }
    }, 30000);

    ws.on('pong', () => {
      console.log(`Pong reçu de l'utilisateur ${userId}`);
    });

    ws.on('close', (code, reason) => {
      console.log(`🔴 WebSocket fermé, code=${code}, reason=${reason.toString()}`);
      activeUsers.delete(userId);
      notifyFriendsStatusChange(userId, false);
      clearInterval(interval);
    });

    ws.on('error', (err) => {
      console.error(`⚠️ WebSocket erreur utilisateur ${userId}:`, err);
    });

  } catch (err) {
    console.error("Erreur dans WebSocket handler :", err);
    connection.socket.close(1011, "Internal server error");
  }
});
}

export { activeUsers };
