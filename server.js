const express = require(`express`);
const app = express();
const server = require(`http`).Server(app);
const hostname = `127.0.0.1`;
const port = process.env.PORT || 3000;

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

app.use(`/`, express.static(`public`));
