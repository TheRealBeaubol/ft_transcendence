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
	
		const friend = await db.get('SELECT id, username, avatar FROM users WHERE username = ?', friendUsername);
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

	fastify.delete('/api/friends/remove/:id', { preHandler: fastify.authenticate }, async (request, reply) => {
		const db = await openDb();
		const userId = request.user.id;
		const friendId = Number(request.params.id);

		if (!friendId) {
			return reply.status(400).send({ error: 'ID ami requis' });
		}

		const existingFriendship = await db.get(
			`SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ?`,
			[userId, friendId]
		);

		if (!existingFriendship) {
			return reply.status(404).send({ error: 'Ami non trouvé' });
		}

		await db.run('DELETE FROM friends WHERE user_id = ? AND friend_id = ?', [userId, friendId]);
		await db.run('DELETE FROM friends WHERE user_id = ? AND friend_id = ?', [friendId, userId]);

		return reply.send({ message: 'Ami supprimé avec succès' });
	});

	fastify.post('/api/friend-requests/send', { preHandler: fastify.authenticate }, async (request, reply) => {
		const db = await openDb();
		const userId = request.user.id;
		const { friendUsername } = request.body;

		if (friendUsername === "") return reply.status(400).send({ error: "Nom d’utilisateur de l’ami requis" });
		const friend = await db.get('SELECT id FROM users WHERE username = ?', friendUsername);
		if (!friend) return reply.status(400).send({ error: "Utilisateur introuvable" });
		if (friend.id === userId) return reply.status(400).send({ error: "Impossible de s'ajouter soi-même" });

		const existingFriendship = await db.get(
			`SELECT 1 FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
			[userId, friend.id, friend.id, userId]
		);
		if (existingFriendship) return reply.status(400).send({ error: "Ami déjà ajouté" });

		const existing = await db.get(
			'SELECT * FROM friend_requests WHERE requester_id = ? AND receiver_id = ? AND status = "pending"',
			[userId, friend.id]
		);
		if (existing) return reply.status(400).send({ error: "Demande déjà envoyée" });

		await db.run('INSERT INTO friend_requests (requester_id, receiver_id) VALUES (?, ?)', [userId, friend.id]);
		return reply.send({ message: "Demande d’ami envoyée" });
	});

	fastify.get('/api/friend-requests/received', { preHandler: fastify.authenticate }, async (request, reply) => {
		const db = await openDb();
		const userId = request.user.id;
	
		try {
			const rows = await db.all(`
				SELECT fr.id, fr.created_at, u.id as requester_id, u.username, u.avatar
				FROM friend_requests fr
				JOIN users u ON u.id = fr.requester_id
				WHERE fr.receiver_id = ?
			`, [userId]);
	
			const formatted = rows.map(row => ({
				id: row.id,
				created_at: row.created_at,
				requester: {
					id: row.requester_id,
					username: row.username,
					avatar: row.avatar,
				}
			}));
	
			return reply.send(formatted);
		} catch (err) {
			request.log.error(err);
			return reply.status(500).send({ error: 'Erreur lors de la récupération des demandes d’amis' });
		}
	});

	fastify.post('/api/friend-requests/respond', { preHandler: fastify.authenticate }, async (request, reply) => {
		const db = await openDb();		
		const userId = request.user.id;
		const { requestId } = request.body;

		const requestRow = await db.get('SELECT * FROM friend_requests WHERE id = ? AND receiver_id = ?', [requestId, userId]);
		if (!requestRow) return reply.status(404).send({ error: "Demande non trouvée" });

		await db.run('DELETE FROM friend_requests WHERE id = ?', requestId);

		await db.run('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)', [userId, requestRow.requester_id]);
		await db.run('INSERT INTO friends (user_id, friend_id) VALUES (?, ?)', [requestRow.requester_id, userId]);

		const friend = await db.get('SELECT id, username, avatar FROM users WHERE id = ?', requestRow.requester_id);

		return reply.send({
			message: "Demande acceptée",
			friend,
		});
	});
	
	fastify.post('/api/friends/decline', { preHandler: fastify.authenticate }, async (request, reply) => {
		const db = await openDb();
		const userId = request.user.id;
		const { requestId } = request.body;

		await db.run('DELETE FROM friend_requests WHERE id = ? AND receiver_id = ?', [requestId, userId]);
		return reply.send({ message: "Demande refusée" });
	});
}