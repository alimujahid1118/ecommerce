import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
    'title': {
        type: String,
        required: [true, "Title is a required field."]
    },
    'body': {
        type: String,
        required: [true, "Body is a required field."]
    },
    'createdBy': {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    }
}, { timestamps: true });

const promotionModel = mongoose.model("promotions", promotionSchema);

export default promotionModel;
