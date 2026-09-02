import mongoose from "mongoose";

// Read-only view over the e-commerce app's existing `users` collection.
// The chat service never creates, updates, or deletes users — it only looks
// them up to resolve identity, display names, and the is_admin flag.
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: String,
    email: String,
    is_admin: Boolean
}, { collection: "users", autoIndex: false });

const userModel = mongoose.model("users", userSchema);

export default userModel;
