import { openDb } from './db.js';
import bcrypt from 'bcrypt';

export default async function profileRoutes(fastify) {
  fastify.put('/api/profile', { preHandler: fastify.authenticate }, async (request, reply) => {
    const db = await openDb();
    const user = request.user;
    const { oldPassword, newUsername, newPassword, newEmail, newAvatar } = request.body;

    if (newAvatar) {
      await db.run('UPDATE users SET avatar = ? WHERE id = ?', newAvatar, user.id);
      return reply.send({ success: true });
    }

    if (!oldPassword) {
      return reply.status(400).send({ error: 'Mot de passe actuel requis.' });
    }

    const row = await db.get('SELECT * FROM users WHERE id = ?', user.id);
    if (!row) {
      return reply.status(404).send({ error: 'Utilisateur non trouvé.' });
    }

    const match = await bcrypt.compare(oldPassword, row.password);
    if (!match) {
      return reply.status(401).send({ error: 'Mot de passe incorrect.' });
    }

    if (!newUsername && !newPassword && !newEmail && !newAvatar) {
      return reply.status(400).send({ error: 'Aucune modification détectée.' });
    }

    if (newUsername) {
      const existingUser = await db.get(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        newUsername,
        user.id
      );
    
      if (existingUser) {
        return reply.status(400).send({ error: 'Nom d’utilisateur déjà utilisé.' });
      }
    
      await db.run('UPDATE users SET username = ? WHERE id = ?', newUsername, user.id);
    }

    if (newPassword) {
      const hashed = await bcrypt.hash(newPassword, 10);
      await db.run('UPDATE users SET password = ? WHERE id = ?', hashed, user.id);
    }
    
    if (newEmail) {
      const existingMail = await db.get(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        newEmail,
        user.id
      );
      if (existingMail) {
        return reply.status(400).send({ error: 'Email déjà utilisé.' });
      }

      await db.run('UPDATE users SET email = ? WHERE id = ?', newEmail, user.id);
    }

    return reply.send({ success: true });
  });

  fastify.get('/api/profile', { preHandler: fastify.authenticate }, async (request, reply) => {
    const db = await openDb();
    const user = await db.get('SELECT id, username, email, avatar FROM users WHERE id = ?', request.user.id);
  
    if (!user) {
      return reply.status(404).send({ error: 'Utilisateur non trouvé.' });
    }
  
    return reply.send(user);
  });

  fastify.delete('/api/delete', { preHandler: fastify.authenticate }, async (request, reply) => {
    const db = await openDb();
    const user = request.user;
    const { password } = request.body;

    if (!password) {
      return reply.status(400).send({ error: 'Le mot de passe est requis pour la suppression.' });
    }

    const row = await db.get('SELECT * FROM users WHERE id = ?', user.id);
    if (!row) {
      return reply.status(404).send({ error: 'Utilisateur non trouvé.' });
    }

    const match = await bcrypt.compare(password, row.password);
    if (!match) {
      return reply.status(401).send({ error: 'Mot de passe incorrect.' });
    }

    await db.run('DELETE FROM users WHERE id = ?', user.id);

    return reply.send({ success: true, message: 'Compte supprimé avec succès.' });
  });
}
