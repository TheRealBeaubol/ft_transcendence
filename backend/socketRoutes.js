// socketRoutes.js
import jwt from "jsonwebtoken";
const { verify } = jwt;

const activeUsers = new Map();

export default async function (fastify) {
  fastify.get('/api/friend-status', { websocket: true }, (connection, req) => {
    const { token } = req.query;
    console.log("🔐 Token reçu :", token);

    if (!token) {
      console.error("❌ Aucun token fourni");
      connection.socket.close();
      return;
    }

    let payload;
    try {
      payload = verify(token, process.env.JWT_SECRET);
      console.log("✅ JWT vérifié avec succès :", payload);
    } catch (err) {
      console.error("❌ JWT invalide :", err.message);
      connection.socket.close();
      return;
    }

    const userId = payload.id;
    const ws = connection.socket;

    activeUsers.set(userId, ws);
    console.log(`✅ Connexion WebSocket réussie pour l'utilisateur ${userId}`);

    ws.send(`🟢 Connecté en tant qu'utilisateur ${userId}`);

    ws.on('close', () => {
      activeUsers.delete(userId);
      console.log(`👋 Utilisateur ${userId} déconnecté`);
    });

    ws.on('message', (msg) => {
      console.log(`📩 Message reçu de ${userId} :`, msg.toString());
    });
  });
}

export { activeUsers };
