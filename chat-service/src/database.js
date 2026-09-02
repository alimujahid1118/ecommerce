import mongoose from "mongoose";
import { envConfig } from "./config.js";

async function database() {
    try {
        await mongoose.connect(envConfig.MONGO_URI);
        console.log("-------------- Chat service connected to MongoDB.. --------------\n");
    } catch (err) {
        console.error("Chat service failed to connect to MongoDB:", err);
        // Exit non-zero so Render restarts the service instead of leaving it
        // running without a database.
        process.exit(1);
    }
}

export default database;
