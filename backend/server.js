const fastify = require('fastify')({ logger: true });

fastify.get('/api/', async () => ({ message: 'Pong API ready!' }));

fastify.listen({ port: 3000, host: '0.0.0.0' });