import app from "./src/app.js";
import envConfig from "./src/config/config.js";
import database from "./src/config/database.js";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

database();

app.listen(envConfig.PORT, () => {
    console.log(`\n----------------- App running on port: ${envConfig.PORT} -----------------`);
})