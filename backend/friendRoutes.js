import { openDb } from "./db.js";

export default async function friendRoutes(fastify) {
	fastify.get('/api/friends', { preHandler: fastify.authenticate }, async (request, reply) => {
		const db = await openDb();
		const userId = request.user.id;
	
		try {
			const rows = await db.all(`
				SELECT u.id, u.username, u.avatar FROM friends f
				JOIN users u ON f.friend_id = u.id
				WHERE f.user_id = ?`, userId);
			return reply.send(rows);
		} catch (err) {
			request.log.error(err);
			return reply.status(500).send({ error: 'Erreur lors de la récupération des amis' });
		}
	});
	

	fastify.post('/api/friends/add', { preHandler: fastify.authenticate }, async (request, reply) => {
		const db = await openDb();
		const userId = request.user.id;
		const { friendUsername } = request.body;
	
		const friend = await db.get('SELECT id FROM users WHERE username = ?', friendUsername);
		if (!friend) {
			return reply.status(400).send({ error: 'Nom d’utilisateur de l’ami requis' });
		}
		const existingFriendship = await db.get(`SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ?`, [userId, friend.id]);
		if (existingFriendship) {
			return reply.status(400).send({ error: 'Ami déjà ajouté' });
		}
		await db.run ('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)', [userId, friend.id]);
		await db.run ('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)', [friend.id, userId]);
		return reply.send({
			message: 'Ami ajouté avec succès',
			friend: {
				id: friend.id,
				username: friend.username,
				avatar: friend.avatar
			}
		});
	});

	fastify.post('/api/friends/remove', { preHandler: fastify.authenticate }, async (request, reply) => {
		const db = await openDb();
		const userId = request.user.id;
		const { friendUsername, confirm } = request.body;

		if (!confirm) {
			return reply.status(400).send({ error: 'Confirmation requise pour supprimer un ami' });
		}
		const friend = await db.get('SELECT id FROM users WHERE username = ?', friendUsername);
		if (!friend) {
			return reply.status(400).send({ error: 'Nom d’utilisateur de l’ami requis' });
		}
		const existingFriendship = await db.get(`SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ?`, [userId, friend.id]);
		if (!existingFriendship) {
			return reply.status(400).send({ error: 'Ami non trouvé' });
		}
		await db.run('DELETE FROM friends WHERE user_id = ? AND friend_id = ?', [userId, friend.id]);
		await db.run('DELETE FROM friends WHERE user_id = ? AND friend_id = ?', [friend.id, userId]);

		return reply.send ({message: 'Ami supprimé avec succès'})
	});
}