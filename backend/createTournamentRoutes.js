import { openDb } from './db.js';

export default async function createTournamentRoutes(fastify) {
	fastify.post('/api/tournaments/create', { preHandler: fastify.authenticate }, async (request, reply) => {
		const db = await openDb();
		const userId = request.user.id;
		const { name } = request.body;

		if (!name || typeof name !== 'string') {
			return reply.status(400).send({ error: 'Nom du tournoi requis et valide' });
		}

		try {
			const result = await db.run(
				'INSERT INTO tournaments (name, creator_id, created_at) VALUES (?, ?, datetime("now"))',
				[name, userId]
			);

			return reply.send({
				success: true,
				tournament: {
					id: result.lastID,
					name,
					creator_id: userId,
				},
			});
		} catch (err) {
			request.log.error(err);
            console.error("Erreur SQL :", err);  // <-- ajoute ceci pour un log clair
			return reply.status(500).send({ error: 'Erreur lors de la création du tournoi' });
		}
	});
}
