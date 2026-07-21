import mongoose from "mongoose";
import { envConfig } from "./config.js";

async function database() {
    try {
        await mongoose.connect(envConfig.MONGO_URI);
        console.log('-------------- Connected to MongoDB Database.. --------------\n');
    } catch (err) {
        console.log(err);
    }
}

export default database;