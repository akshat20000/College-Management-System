const { createClient } = require('redis');

const redisClient = createClient({
  username: process.env["redis-username"],
  password: process.env["redis-password"],
  socket: {
    host: process.env["redis-host"],
    port: process.env["redis-port"]
  }
});

redisClient.on('error', (err) => console.error(' Redis Client Error', err));

(async () => {
  await redisClient.connect();
  console.log(' Redis connected successfully');
})();

module.exports = redisClient;
