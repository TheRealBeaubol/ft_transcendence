import { openDb } from './db.js';

export default async function joinTournamentRoute(fastify) {
	fastify.post('/api/tournaments/join', { preHandler: fastify.authenticate }, async (request, reply) => {
		const db = await openDb();
		const userId = request.user.id;
		const { tournamentName } = request.body;

		if (!tournamentName || typeof tournamentName !== 'string') {
			return reply.status(400).send({ error: 'Nom du tournoi requis' });
		}

		try {
			const tournament = await db.get('SELECT id FROM tournaments WHERE name = ?', [tournamentName]);

			if (!tournament) {
				return reply.status(404).send({ error: 'Tournoi non trouvé' });
			}

			const existing = await db.get(
				'SELECT 1 FROM tournament_players WHERE tournament_id = ? AND user_id = ?',
				[tournament.id, userId]
			);

			if (existing) {
				return reply.status(400).send({ error: 'Vous êtes déjà inscrit à ce tournoi' });
			}

			await db.run(
				'INSERT INTO tournament_players (tournament_id, user_id) VALUES (?, ?)',
				[tournament.id, userId]
			);

			return reply.send({ message: 'Inscription au tournoi réussie' });
		} catch (err) {
			request.log.error(err);
			return reply.status(500).send({ error: 'Erreur lors de l’inscription au tournoi' });
		}
	});
}