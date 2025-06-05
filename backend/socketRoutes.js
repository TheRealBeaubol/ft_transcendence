import jwt from "jsonwebtoken";
const { verify } = jwt;

const activeUsers = new Map();

export default async function (fastify) {
  fastify.get('/api/friend-status', { websocket: true }, (connection, req) => {
    const { token } = req.query;
    console.log("🔐 Token reçu :", token);

    if (!token) {
      console.error("❌ Aucun token fourni");
      connection.socket.close(4001, "No token provided");
      return;
    }

    let payload;
    try {
      payload = verify(token, process.env.JWT_SECRET);
      console.log("✅ JWT vérifié avec succès :", payload);
    } catch (err) {
      console.error("❌ JWT invalide :", err.message);
      connection.socket.close(4002, "Invalid token");
      return;
    }

    const ws = connection.socket;
    const userId = payload.id;

    // Si déjà connecté, fermer l'ancienne connexion
    if (activeUsers.has(userId)) {
      const oldWs = activeUsers.get(userId);
      if (oldWs.readyState === oldWs.OPEN) {
        oldWs.close(4000, 'New connection established');
      }
    }
    activeUsers.set(userId, ws);
    console.log(`🟢 Utilisateur ${userId} en ligne`);

    ws.send(JSON.stringify({ type: 'welcome', msg: 'Connected to friend status server' }));

    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.ping();
      }
    }, 30000);

    ws.on('close', (code, reason) => {
      const reasonStr = reason ? reason.toString() : '';
      console.log(`🔴 WebSocket fermé, code=${code}, reason=${reasonStr}`);
      activeUsers.delete(userId);
      clearInterval(interval);
    });

    ws.on('error', (err) => {
      console.error(`⚠️ WebSocket erreur utilisateur ${userId}:`, err);
    });

    ws.on('pong', () => {
      console.log(`Pong reçu de l'utilisateur ${userId}`);
    });
  });
}

export { activeUsers };
