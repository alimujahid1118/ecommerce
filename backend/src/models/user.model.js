import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    'firstName': {
        type: String,
        required: [true, "First Name is a required field."]
    },
    'lastName': {
        type: String,
        required: [true, "Last Name is a required field."]
    },
    'username': {
        type: String,
        required: [true, "Username is a required field."],
        unique: [true, "Username must be unique."]
    },
    'email': {
        type: String,
        required: [true, "Email is a required field."],
        unique: [true, "Email must be unique."]
    },
    'password': {
        type: String,
        required: [true, "Password is a required field."]
    }
}, { timestamps: true });

const userModel = mongoose.model("users", userSchema);

export default userModel;