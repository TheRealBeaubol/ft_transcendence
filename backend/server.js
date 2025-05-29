const fastify = require('fastify')({ logger: true });
// Enregistrement des logs

fastify.get('/api/', async () => ({ message: 'Pong API ready!' }));
// Des qu'une requête est reçue, le serveur répond avec un message JSON indiquant que l'API est prête.

fastify.listen({ port: 3000, host: '0.0.0.0' });