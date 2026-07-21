import app from "../src/app.js";
import database from "../src/config/database.js";

await database();

export default app;