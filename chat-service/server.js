import http from "http";
import app from "./src/app.js";
import { envConfig } from "./src/config.js";
import database from "./src/database.js";
import initChatSocket from "./src/socket/chatSocket.js";

await database();

// Express and Socket.IO share one HTTP server so a single Render web service
// (one port) serves both the REST API and the websocket upgrade.
const server = http.createServer(app);

const io = initChatSocket(server);

// Lets REST controllers broadcast over the same Socket.IO instance.
app.set("io", io);

server.listen(envConfig.PORT, () => {
    console.log(`\n----------------- Chat service running on port: ${envConfig.PORT} -----------------`);
});
