import { openDb } from "./db.js";

export default async function tournamentRoutes(fastify) {
  // Récupérer les données d’un tournoi (joueurs + matchs)
  fastify.get('/api/tournaments/:id', { preHandler: fastify.authenticate }, async (request, reply) => {
    const db = await openDb();
    const tournamentId = Number(request.params.id);
    if (!tournamentId) {
      return reply.status(400).send({ error: 'ID tournoi invalide' });
    }

    try {
      // Infos tournoi
      const tournament = await db.get('SELECT id, name, is_started, created_at FROM tournaments WHERE id = ?', tournamentId);
      if (!tournament) {
        return reply.status(404).send({ error: 'Tournoi non trouvé' });
      }

      // Joueurs inscrits
      const players = await db.all(`
        SELECT u.id, u.username, u.avatar
        FROM tournament_players tp
        JOIN users u ON tp.user_id = u.id
        WHERE tp.tournament_id = ?
      `, tournamentId);

      // Matchs du tournoi
      const matches = await db.all(`
        SELECT id, round, player1_id, player2_id, score1, score2, status
        FROM matches
        WHERE tournament_id = ?
        ORDER BY round, id
      `, tournamentId);

      // On veut aussi récupérer les infos des joueurs pour chaque match
      // Simplifions ici : on joindra dans le frontend

      return reply.send({ tournament, players, matches });
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'Erreur lors de la récupération du tournoi' });
    }
  });
}
