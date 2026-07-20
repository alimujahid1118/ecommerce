import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    'email': {
        type: String,
        required: [true, "Email is a required field."]
    },
    'user': {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, "User is a required field."]
    },
    'otpHash': {
        type: String,
        required: [true, "Otp is a required field."]
    }
}, { timestamps: true })

const otpModel = mongoose.model("otps", otpSchema);

export default otpModel;